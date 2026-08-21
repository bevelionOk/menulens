import fastify from 'fastify';
import { env } from './env';

const app = fastify({ logger: true });

// Exists to make the Vite /api proxy verifiable — the only route in Story 1.1.
app.get('/api/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
