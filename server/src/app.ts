import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { errorHandler, notFoundHandler } from './errors';
import { MAX_SOURCE_BYTES } from './limits';
import type { ExtractFn } from './pipeline/extraction-adapter';
import { runsRoutes } from './routes/runs';

export type AppDeps = { extract: ExtractFn };

// Builds the app without listening — the 1.8 `inject` seam. `extract` is the model seam:
// `index.ts` passes the real adapter, the golden-master passes a mock. This module never
// imports `openai` or the adapter, so the test path loads no SDK.
export function buildApp(deps: AppDeps) {
  // Structured logging is Fastify's built-in Pino instance: every stage transition, every
  // triaged dish and every model call is one JSON line (NFR5).
  const app = fastify({ logger: true });

  // FR2 cap: 10 MB, one file per run. Exceeding it surfaces as FST_REQ_FILE_TOO_LARGE.
  app.register(multipart, { limits: { fileSize: MAX_SOURCE_BYTES, files: 1 } });
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.get('/api/health', async () => ({ status: 'ok' }));
  app.register(runsRoutes, { extract: deps.extract });

  return app;
}
