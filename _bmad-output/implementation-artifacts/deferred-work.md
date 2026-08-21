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
