import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { errorHandler, notFoundHandler } from './errors';
import { MAX_SOURCE_BYTES } from './limits';
import { runsRoutes } from './routes/runs';

// Builds the app without listening — the 1.8 `inject` seam.
export function buildApp() {
  const app = fastify({ logger: true });

  // FR2 cap: 10 MB, one file per run. Exceeding it surfaces as FST_REQ_FILE_TOO_LARGE.
  app.register(multipart, { limits: { fileSize: MAX_SOURCE_BYTES, files: 1 } });
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.get('/api/health', async () => ({ status: 'ok' }));
  app.register(runsRoutes);

  return app;
}
