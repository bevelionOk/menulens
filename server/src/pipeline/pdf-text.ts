import type { FastifyBaseLogger } from 'fastify';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// PDF text layer via pdfjs (legacy build runs in Node without an explicit worker —
// verified against the installed tarball). Any throw ⇒ '' — the class decision then
// reads it as `visual` (scanned / corrupt), which is not a failure (spec matrix).
// Line breaks follow pdfjs's `hasEOL` so lines reach 1.5 unfused; the caller's
// `collapseWhitespace` still measures the chars (and strips NUL).
export async function extractPdfText(bytes: Buffer, log: FastifyBaseLogger): Promise<string> {
  try {
    const task = getDocument({ data: new Uint8Array(bytes) });
    try {
      const doc = await task.promise;
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        let text = '';
        for (const item of content.items) {
          if (!('str' in item)) continue;
          text += item.str;
          text += item.hasEOL ? '\n' : ' ';
        }
        pages.push(text);
      }
      return pages.join('\n');
    } finally {
      // A failing teardown must not discard text already extracted.
      await task.destroy().catch(() => {});
    }
  } catch (err) {
    log.info({ err }, 'pdf text extraction failed; treating as visual');
    return '';
  }
}
