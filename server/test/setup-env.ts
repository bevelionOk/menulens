import { fileURLToPath } from 'node:url';

// The golden-master talks to a real Postgres, so it needs the same environment the server
// boots with (`env.ts` fails fast otherwise). Locally that is the repo-root `.env` — the
// same file `npm run dev` and `db:migrate` read via `--env-file-if-exists`. In CI there is
// no file and the workflow exports the variables directly, so a missing file is not an error.
try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch {
  // No .env — the ambient environment is the source of truth (CI).
}
