import { readFileSync } from 'node:fs';
import type { FastifyBaseLogger } from 'fastify';
import OpenAI, { APIConnectionTimeoutError, APIError } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { ResponseInput } from 'openai/resources/responses/responses';
import { type ModelDishSignal, modelExtractionOutputSchema, type SourceClass } from 'shared';
import { ExtractionError } from './extraction-error';

// The OpenAI seam (AD-12/AD-13): this is the ONLY file that imports `openai`. Everything
// else sees `ExtractFn` — what 1.8 mocks. The adapter is DB-free: the pipeline hands it
// `onRetry` so the `extracting` re-transition stays a lifecycle write, not an SDK concern.

export type ExtractionInput = {
  run_id: string;
  source_class: SourceClass;
  content_type: string;
  acquired_text: string | null;
  bytes: Buffer | null;
  // Runs before attempt 2 (the one retry on invalid output) — bumps the staleness anchor.
  onRetry?: () => Promise<void>;
};

export type TokenUsage = { input_tokens: number; output_tokens: number; total_tokens: number };

export type ExtractionResult = {
  dishes: ModelDishSignal[];
  // Summed over attempts — the run's measured cost (NFR2).
  usage: TokenUsage;
  attempts: number;
};

export type ExtractFn = (input: ExtractionInput, log: FastifyBaseLogger) => Promise<ExtractionResult>;

export type RuntimePrompt = { version: string; text: string };

// Versioned runtime prompt in `prompts/runtime/<version>.md`, read once at boot.
export function loadRuntimePrompt(version: string): RuntimePrompt {
  const url = new URL(`../../../prompts/runtime/${version}.md`, import.meta.url);
  return { version, text: readFileSync(url, 'utf8') };
}

export type ExtractionAdapterOptions = { model: string; timeoutMs: number; prompt: RuntimePrompt };

// The real client, built here so `index.ts` never imports the SDK (AC1): no SDK retries —
// the story's one retry on invalid output is the only retry (FR6).
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey, maxRetries: 0 });
}

const OUTPUT_FORMAT = zodTextFormat(modelExtractionOutputSchema, 'menu_extraction');

// Model input by class (AD-6): `text` sends the acquired text, never the file (a text-class
// PDF included); `visual` sends the stored bytes — vision for images, native `input_file`
// for PDFs. Throws a plain Error on a data-integrity state 1.4 cannot produce.
function buildInput(input: ExtractionInput, prompt: RuntimePrompt): { items: ResponseInput; shape: string } {
  const system = { role: 'system' as const, content: prompt.text };
  if (input.source_class === 'text') {
    if (!input.acquired_text) throw new Error(`extraction: run ${input.run_id} is text-class without acquired_text`);
    return { items: [system, { role: 'user', content: input.acquired_text }], shape: 'input_text' };
  }
  if (!input.bytes || input.bytes.length === 0) {
    throw new Error(`extraction: run ${input.run_id} is visual-class without stored bytes`);
  }
  const b64 = input.bytes.toString('base64');
  if (input.content_type === 'application/pdf') {
    return {
      items: [
        system,
        {
          role: 'user',
          content: [{ type: 'input_file', filename: 'menu.pdf', file_data: `data:application/pdf;base64,${b64}` }],
        },
      ],
      shape: 'input_file',
    };
  }
  return {
    items: [
      system,
      {
        role: 'user',
        content: [{ type: 'input_image', detail: 'high', image_url: `data:${input.content_type};base64,${b64}` }],
      },
    ],
    shape: 'input_image',
  };
}

export function createExtractionAdapter(client: OpenAI, opts: ExtractionAdapterOptions): ExtractFn {
  const { model, timeoutMs, prompt } = opts;

  return async (input, log) => {
    const runId = input.run_id;
    const { items, shape } = buildInput(input, prompt);
    log.info({ run_id: runId, source_class: input.source_class, content_type: input.content_type, shape }, 'model input shape');

    const usage: TokenUsage = { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    for (let attempt = 1; attempt <= 2; attempt++) {
      if (attempt === 2) await input.onRetry?.();
      const started = Date.now();
      let response;
      try {
        response = await client.responses.parse(
          { model, input: items, text: { format: OUTPUT_FORMAT } },
          { timeout: timeoutMs },
        );
      } catch (err) {
        const elapsed_ms = Date.now() - started;
        // Timeout first: it is itself an APIError subclass.
        if (err instanceof APIConnectionTimeoutError) {
          log.warn({ run_id: runId, attempt, elapsed_ms, timeout_ms: timeoutMs }, 'model call timed out');
          throw new ExtractionError('model_timeout', `model call exceeded ${timeoutMs} ms`, { attempt, elapsed_ms });
        }
        if (err instanceof APIError) {
          log.warn({ run_id: runId, attempt, elapsed_ms, status: err.status ?? null, err }, 'model call failed');
          throw new ExtractionError('model_error', err.message, { attempt, status: err.status ?? null });
        }
        // Anything else thrown by `parse` is the SDK rejecting the model's text (malformed
        // JSON, schema miss, length/content-filter stop) — invalid output, retried once.
        response = null;
        log.warn({ run_id: runId, attempt, elapsed_ms, err }, 'model output could not be parsed');
      }

      if (response) {
        const u = response.usage;
        const line = {
          run_id: runId,
          model,
          attempt,
          input_tokens: u?.input_tokens ?? 0,
          output_tokens: u?.output_tokens ?? 0,
          total_tokens: u?.total_tokens ?? 0,
          prompt_version: prompt.version,
        };
        usage.input_tokens += line.input_tokens;
        usage.output_tokens += line.output_tokens;
        usage.total_tokens += line.total_tokens;
        log.info(line, 'model usage');

        // Re-validate (AD-12): a refusal leaves `output_parsed` null; a schema miss is invalid.
        const parsed = modelExtractionOutputSchema.safeParse(response.output_parsed);
        if (parsed.success) return { dishes: parsed.data.dishes, usage, attempts: attempt };
        log.warn(
          { run_id: runId, attempt, status: response.status, issues: parsed.error.issues.slice(0, 5) },
          'model output invalid',
        );
      }

      if (attempt === 1) log.warn({ run_id: runId, attempt: 2 }, 'retrying extraction once with the same input');
    }

    throw new ExtractionError('model_invalid_output', 'model output invalid on both attempts', { attempts: 2 });
  };
}
