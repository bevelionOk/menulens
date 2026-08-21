import type { FastifyPluginAsync } from 'fastify';
import { createRunUrlRequestSchema, type SourceType } from 'shared';
import { toRunDetail } from '../core/run-state';
import { db } from '../db/client';
import { createRun, findActiveRun, getRunWithDishes, type NewRun } from '../db/runs-repo';
import { insertArtifact } from '../db/source-artifacts-repo';
import { env } from '../env';
import { ApiError } from '../errors';

// FR1 accept set. `image/heic` is deliberately absent (epic: its presence would stop the
// OS HEIC→JPEG auto-convert); `.heic`/`.heif` names are rejected even when mislabeled.
const ACCEPTED_TYPES: Record<string, SourceType> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
};
const HEIC_NAME = /\.(heic|heif)$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unsupportedFile = () =>
  new ApiError(
    415,
    'unsupported_file',
    'Unsupported file type. Use a PDF, JPG, PNG or WebP — for HEIC photos, export as JPEG or take a screenshot.',
  );

// Validation order (AD-4): input → seriality (409) → insert. No DB access before step 2.
export const runsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/runs', async (request, reply) => {
    let run: NewRun;
    let upload: { content_type: string; bytes: Buffer } | null = null;

    if (request.isMultipart()) {
      const part = await request.file();
      if (!part) throw new ApiError(400, 'invalid_request', 'Multipart body must carry a `file` part.');
      const sourceType = ACCEPTED_TYPES[part.mimetype];
      if (!sourceType || HEIC_NAME.test(part.filename)) throw unsupportedFile();
      // Exceeding `limits.fileSize` throws FST_REQ_FILE_TOO_LARGE here → 413 in the error handler.
      const bytes = await part.toBuffer();
      upload = { content_type: part.mimetype, bytes };
      run = { source_type: sourceType, source_ref: part.filename, status: 'processing', stage: null };
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
      run = { source_type: 'url', source_ref: url.href, status: 'processing', stage: null };
    }

    const now = new Date();
    const active = await findActiveRun(new Date(now.getTime() - env.RUN_STALE_AFTER_MS));
    if (active) throw new ApiError(409, 'run_active', `Run ${active.id} is still processing; one run at a time.`);

    // AC3: run row + uploaded bytes in one transaction — an artifact failure leaves no run.
    const created = await db.transaction(async (tx) => {
      const row = await createRun(tx, run);
      if (upload) await insertArtifact(tx, row.id, upload);
      return row;
    });

    request.log.info({ run_id: created.id }, 'run created');
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
