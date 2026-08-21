import type { FastifyBaseLogger } from 'fastify';
import type { SourceClass } from 'shared';
import { decideSourceClass, hasUsableText } from '../core/class-decision';
import { collapseWhitespace, htmlToText } from '../core/html-to-text';
import type { ArtifactRow } from '../db/source-artifacts-repo';
import type { RunRow } from '../db/runs-repo';
import { env } from '../env';
import { AcquisitionError } from './acquisition-error';
import { fetchSource } from './fetch-url';
import { extractPdfText } from './pdf-text';

export interface AcquiredSource {
  source_class: SourceClass;
  content_type: string;
  // Set for URL runs whose body is kept (PDF / image); undefined leaves upload bytes untouched.
  bytes?: Buffer;
  acquired_text: string | null;
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const HTML_TYPES = new Set(['text/html', 'application/xhtml+xml']);

// Decides by `run.source_type`, then (URL) by the final content type after redirects —
// never by the URL's extension (AD-6). Stage is `fetching_source` throughout.
export async function acquireSource(
  log: FastifyBaseLogger,
  run: RunRow,
  artifact: ArtifactRow | null,
): Promise<AcquiredSource> {
  const minChars = env.SOURCE_MIN_TEXT_CHARS;

  if (run.source_type === 'url') {
    const fetched = await fetchSource(run.source_ref, log);
    const { content_type } = fetched;
    if (content_type === 'application/pdf') {
      const acquired_text = collapseWhitespace(await extractPdfText(fetched.bytes, log));
      const source_class = decideSourceClass({ kind: 'pdf', text_chars: acquired_text.length }, minChars);
      return { source_class, content_type, bytes: fetched.bytes, acquired_text };
    }
    if (IMAGE_TYPES.has(content_type)) {
      return { source_class: 'visual', content_type, bytes: fetched.bytes, acquired_text: null };
    }
    let text: string;
    if (HTML_TYPES.has(content_type)) text = htmlToText(fetched.bytes.toString('utf8'));
    else if (content_type.startsWith('text/')) text = collapseWhitespace(fetched.bytes.toString('utf8'));
    else {
      throw new AcquisitionError('no_usable_text', 'unsupported content type', {
        final_url: fetched.final_url,
        content_type,
      });
    }
    if (!hasUsableText(text.length, minChars)) {
      throw new AcquisitionError('no_usable_text', 'too little text', {
        final_url: fetched.final_url,
        content_type,
        text_chars: text.length,
        min_chars: minChars,
      });
    }
    return {
      source_class: decideSourceClass({ kind: 'url', text_chars: text.length }, minChars),
      content_type,
      acquired_text: text,
    };
  }

  // Uploads: bytes were stored at creation (1.3); never rewritten here.
  if (!artifact?.bytes) throw new Error(`acquireSource: upload run ${run.id} has no stored bytes`);
  if (run.source_type === 'pdf') {
    const acquired_text = collapseWhitespace(await extractPdfText(artifact.bytes, log));
    const source_class = decideSourceClass({ kind: 'pdf', text_chars: acquired_text.length }, minChars);
    return { source_class, content_type: artifact.content_type, acquired_text };
  }
  return { source_class: 'visual', content_type: artifact.content_type, acquired_text: null };
}
