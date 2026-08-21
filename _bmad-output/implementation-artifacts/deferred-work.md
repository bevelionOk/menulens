# Deferred Work

Collected by build reviews for later focused attention. Append-only.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Story 1.8 must decide coverage for the env fail-fast branch — either a sub-assertion inside the single golden-master test file (spawn server entry with stripped env, assert non-zero exit + variable named in stderr) or an explicit DECISIONS.md record that this branch stays manual-only.
  evidence: Verification-gap review — the invalid-env branch (`server/src/env.ts`) is the only nontrivial runtime behavior of story 1.1 and no automated check will ever execute it: CI runs typecheck only, and the planned 1.8 golden-master runs only under a valid environment.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Add a Postgres healthcheck / wait-for-ready to docker-compose.yml when a story first depends on DB readiness (1.2 migration or 1.8 CI test), not before.
  evidence: Review — `docker compose up -d` reports success before Postgres accepts connections; harmless in 1.1 (nothing connects) but the foundation file is where the wait-for-ready contract belongs once consumers exist.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Widen `server/tsconfig.json` `include` (currently `["src"]`) when the golden-master test lands so `server/test/` is typechecked in CI.
  evidence: Review — the seeded `server/test/` directory sits outside typecheck coverage; in 1.8 the single test would silently escape the CI `checks` job's typecheck unless the include is widened then.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: Decide in Story 1.8 whether the CI `checks` job gets a schema/migration drift guard (`npm run -w server db:generate` followed by `git diff --exit-code server/drizzle`, or `drizzle-kit check`) — weigh it against R8 (exactly one automated test) before adding; it is a build-time consistency check like typecheck, not a test, but the distinction must be argued in DECISIONS.md.
  evidence: Verification-gap review — `server/drizzle/*.sql` is generated manually from `server/src/db/schema.ts`; nothing in CI executes either, so an edit to `schema.ts` without regenerating ships with a green `checks` job and fails at the first runtime query (1.3+). The repo round-trip itself (createRun → insertDishes → getRunWithDishes ordering) is covered by the 1.8 golden-master by design.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: When Story 1.3 issues the first request-path query, decide a `connectionTimeoutMillis` for the pg Pool (fail fast with an honest 5xx when Postgres is unreachable) instead of the driver default of waiting indefinitely.
  evidence: Edge-case review — `server/src/db/client.ts` creates `new Pool({ connectionString })` with no connection timeout; with Postgres down, route handlers would hang rather than fail, which contradicts AD-14 failure containment ("what breaks in production" material).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: The CI `checks` job (1.8) must export a dummy `OPENAI_API_KEY` for `db:migrate` — the runner imports `env.ts`, whose fail-fast schema requires the key even though migrations never use it.
  evidence: Implementation note — `server/src/db/migrate.ts` imports `./client`, which imports `../env`; without the variable the process exits 1 naming `OPENAI_API_KEY` before any migration runs.
