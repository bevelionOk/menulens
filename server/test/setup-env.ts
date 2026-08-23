import { fileURLToPath } from 'node:url';

// The golden-master talks to a real Postgres, so it needs the same environment the server
// boots with (`env.ts` fails fast otherwise). Locally that is the repo-root `.env` — the
// same file `npm run dev` and `db:migrate` read via `--env-file-if-exists`. In CI there is
// no file and the workflow exports the variables directly.

// Only a missing file is expected. A malformed or unreadable `.env` must not be swallowed
// as "no file": the run would silently continue on whatever the ambient environment holds.
try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch (err) {
  if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
}

// The test gets its own database when one is offered. `TEST_DATABASE_URL` is substituted
// into `DATABASE_URL` here — before `env.ts` and `db/client.ts` are imported — so there is
// exactly one connection string in the process and nothing downstream needs to know that a
// test is running. This is a convenience, never a way around the refusal: the disposability
// guard reads the *result*, so a `TEST_DATABASE_URL` aimed at the dev database is refused
// exactly as loudly as a `DATABASE_URL` aimed at it.
if (process.env.TEST_DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL.trim();
}

// Two thresholds the golden depends on, pinned here rather than inherited. Both are
// calibration knobs a developer may legitimately change in their own `.env`, and both
// silently rewrite the golden if they do: `SOURCE_MIN_TEXT_CHARS` decides the
// `source_class: 'text'` the whole fixture rests on (raise it past the fixture's 459
// collapsed characters and the run turns `visual`, killing every T4/T6 assertion), and
// `RUN_STALE_AFTER_MS` decides the derived `state` and the 409 gate. The test asserts a
// frozen payload, so it must fix the inputs that payload is a function of.
process.env.SOURCE_MIN_TEXT_CHARS = '200';
process.env.RUN_STALE_AFTER_MS = '180000';

// `env.ts` answers a bad environment with `process.exit(1)`, which inside a Vitest worker
// reads as a crash with no test report and no reason. Fail here instead, with the remedy.
const REMEDY =
  'Set it in the repo-root .env — `cp .env.example .env` carries working defaults — then:\n' +
  '  docker compose up -d --wait && npm run -w server db:migrate';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !(databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
  throw new Error(
    'No postgres URL to test against: TEST_DATABASE_URL is unset and DATABASE_URL is missing or is not a ' +
      `postgres URL (got: ${databaseUrl ?? 'unset'}).\n${REMEDY}`,
  );
}
if (!process.env.OPENAI_API_KEY?.trim()) {
  // Nothing in this test calls OpenAI — the seam is mocked — but `env.ts` requires the
  // variable, and a placeholder is enough.
  throw new Error(`OPENAI_API_KEY is unset. The test never calls OpenAI, but env.ts requires it.\n${REMEDY}`);
}
