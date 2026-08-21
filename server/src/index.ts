import { buildApp } from './app';
import { env } from './env';
import { createExtractionAdapter, createOpenAIClient, loadRuntimePrompt } from './pipeline/extraction-adapter';

// The listen-only entry builds the real seam; the per-call timeout is the pipeline's single
// technical timeout (FR6).
const extract = createExtractionAdapter(createOpenAIClient(env.OPENAI_API_KEY), {
  model: env.OPENAI_MODEL,
  timeoutMs: env.MODEL_TIMEOUT_MS,
  prompt: loadRuntimePrompt('extraction-v1'),
});

const app = buildApp({ extract });

try {
  await app.listen({ port: env.PORT });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
