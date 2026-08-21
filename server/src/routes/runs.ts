import type { FastifyPluginAsync } from 'fastify';
import { createRunUrlRequestSchema, type SourceType } from 'shared';
import { isActive, toRunDetail } from '../core/run-state';
import { db } from '../db/client';
import { createRun, findLatestProcessingRun, getRunWithDishes, type NewRun } from '../db/runs-repo';
import { insertArtifact } from '../db/source-artifacts-repo';
import { env } from '../env';
import { ApiError } from '../errors';
import type { ExtractFn } from '../pipeline/extraction-adapter';
import { runPipeline } from '../pipeline/run-pipeline';

// FR1 accept set. `image/heic` is deliberately absent (epic: its presence would stop the
// OS HEIC→JPEG auto-convert). A `Map` so only these four literal keys match — a plain
// object lookup would resolve prototype names like `constructor`.
const ACCEPTED_TYPES = new Map<string, SourceType>([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'image'],
  ['image/png', 'image'],
  ['image/webp', 'image'],
]);
// Catches HEIC by name when the client mislabels the mimetype. A HEIC renamed `.jpg`
// and sent as `image/jpeg` passes by design: no magic-byte sniffing (spec Ask-First).
const HEIC_NAME = /\.(heic|heif)$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unsupportedFile = (message?: string) =>
  new ApiError(
    415,
    'unsupported_file',
    message ??
      'Unsupported file type. Use a PDF, JPG, PNG or WebP — for HEIC photos, export as JPEG or take a screenshot.',
  );

export type RunsRoutesOptions = { extract: ExtractFn };

// Validation order (AD-4): input → seriality (409) → insert. No DB access before step 2.
export const runsRoutes: FastifyPluginAsync<RunsRoutesOptions> = async (app, { extract }) => {
  app.post('/api/runs', async (request, reply) => {
    let run: NewRun;
    let upload: { content_type: string; bytes: Buffer } | null = null;

    if (request.isMultipart()) {
      // `request.file()` yields the first file part whatever its fieldname.
      const part = await request.file();
      if (!part) throw new ApiError(400, 'invalid_request', 'Multipart body must carry a file part.');
      const mimetype = (part.mimetype.split(';')[0] ?? '').trim().toLowerCase();
      const sourceType = ACCEPTED_TYPES.get(mimetype);
      if (!sourceType || HEIC_NAME.test(part.filename)) throw unsupportedFile();
      // Exceeding `limits.fileSize` throws FST_REQ_FILE_TOO_LARGE here → 413 in the error handler.
      const bytes = await part.toBuffer();
      if (bytes.length === 0) throw unsupportedFile('Empty file. Upload a PDF, JPG, PNG or WebP with content.');
      upload = { content_type: mimetype, bytes };
      run = { source_type: sourceType, source_ref: part.filename || 'upload', status: 'processing', stage: null };
    } else {
      const parsed = createRunUrlRequestSchema.safeParse(request.body);
      if (!parsed.success) throw new ApiError(400, 'invalid_url', 'Body must be JSON `{ "url": "https://…" }`.');
      let url: URL;
      try {
        url = new URL(parsed.data.url);
      } catch {
        throw new ApiError(400, 'invalid_url', 'Not a valid URL.');
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new ApiError(400, 'invalid_url', 'URL must use http or https.');
      }
      // Credentials would be persisted in `source_ref` and echoed in logs/History.
      if (url.username || url.password) {
        throw new ApiError(400, 'invalid_url', 'URL must not contain credentials.');
      }
      run = { source_type: 'url', source_ref: url.href, status: 'processing', stage: null };
    }

    // Seriality gate (AD-10): the newest `processing` run decides — if it is not active
    // by the same pure rule the read path uses, no run is.
    const now = new Date();
    const latest = await findLatestProcessingRun();
    if (latest && isActive(latest, now, env.RUN_STALE_AFTER_MS)) {
      throw new ApiError(409, 'run_active', `Run ${latest.id} is still processing; one run at a time.`);
    }

    // AC3: run row + uploaded bytes in one transaction — an artifact failure leaves no run.
    const created = await db.transaction(async (tx) => {
      const row = await createRun(tx, run);
      if (upload) await insertArtifact(tx, row.id, upload);
      return row;
    });

    request.log.info({ run_id: created.id }, 'run created');
    // AD-4: the pipeline starts after the commit and is never awaited by the request.
    void runPipeline(request.log, created.id, extract);
    return reply.status(201).send({ id: created.id, status: created.status });
  });

  app.get<{ Params: { id: string } }>('/api/runs/:id', async (request) => {
    const { id } = request.params;
    // A non-uuid never reaches Postgres (it would raise 22P02 there).
    if (!UUID.test(id)) throw new ApiError(404, 'not_found', 'Run not found.');
    const run = await getRunWithDishes(id);
    if (!run) throw new ApiError(404, 'not_found', 'Run not found.');
    const { dishes, ...row } = run;
    return toRunDetail(row, dishes, new Date(), env.RUN_STALE_AFTER_MS);
  });
};
