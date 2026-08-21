---
title: 'Story 1.1 — Project Scaffold & Foundations'
type: 'chore'
created: '2026-08-21'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'a3f2e35e338fe6a1d1da98680d023fa287519400'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo has planning artifacts and CI secret-scanning but zero application code; every later story needs the ratified monorepo structure, pinned stack, and CI typecheck to land on.

**Approach:** Build the runnable skeleton from official scaffolds only: plain npm workspaces `server/` + `web/` + `shared/`, Compose Postgres 16, Fastify booting with native Pino and fail-fast Zod env validation, Vite React SPA shell with Tailwind + shadcn/ui init and `/api` proxy, and a CI `checks` job running the workspace typecheck.

## Boundaries & Constraints

**Always:**
- Official-scaffold defaults as-is; majors are whatever the scaffolds pin today (spine Stack table = reference snapshot) — never hand-upgrade/downgrade.
- Node engine ≥ 22.13 at root; plain npm workspaces; layout matches the spine structural seed exactly: `server/src/{core,pipeline,routes,db}`, `server/drizzle`, `server/test`, `web/src`, `shared/src`; files kebab-case.
- `shared`'s only runtime dependency is Zod, consumed as TS source.
- `.env.example` is the complete env reference, placeholders only. File output in English.

**Ask First:**
- Config beyond scaffold defaults to make fresh majors cooperate (R-13) — default answer is "resolve toward the default"; ask before customizing.
- Any deviation from the structural seed or plain npm workspaces.

**Never:**
- Nx/Turbo/pnpm, starter templates, monorepo tooling.
- Drizzle schema/migrations (1.2), business routes, TanStack Query/react-router wiring (1.7), the golden-master test (1.8).
- Custom Tailwind tokens, config polishing, deploy configs, secrets in committed files.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Full dev boot | `.env` from `.env.example`; `docker compose up -d`; `npm install`; `npm run dev` | Postgres 16 up; Fastify boots under tsx watch logging via Pino; Vite serves the SPA shell | N/A |
| Proxy check | `GET <vite-origin>/api/health` while dev is running | 200 JSON served by Fastify through the Vite `/api` proxy | N/A |
| Missing env var | Boot server without a required var | Process exits non-zero immediately; Zod error names the variable | fail-fast, no partial boot |
| Malformed env var | Required var present but invalid (e.g. non-URL `DATABASE_URL`) | Same fail-fast exit naming the variable | same |
| CI push | Push / PR to repo | Existing `secret-scan` job still passes; new `checks` job runs workspace typecheck | job fails on type errors |

</frozen-after-approval>

## Code Map

- `.github/workflows/ci.yml` -- existing gitleaks `secret-scan` job (keep untouched); append `checks` job; update the header comment (lines 1–5, "add a checks job when the scaffold lands"). Typecheck only — the test joins in 1.8.
- `.env.example` -- currently only `OPENAI_API_KEY=sk-...`; extend; keep the no-secrets header.
- `.gitignore` -- already covers `.env`, `node_modules/`, `dist/`; extend only if a scaffold emits something new.
- `_bmad-output/planning-artifacts/architecture/architecture-full-stack-challenge-2026-08-21/ARCHITECTURE-SPINE.md` -- read-only reference: Stack table (2026-08-21 snapshot), Structural Seed, Conventions.
- New: root `package.json` + `docker-compose.yml`; `server/`, `web/`, `shared/` workspaces — no app code exists yet.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` (root) -- create: `"workspaces": ["server","web","shared"]`, `"engines": {"node": ">=22.13"}`, `private: true`; scripts `dev` (concurrently server+web) and `typecheck` (all workspaces); `concurrently` as root devDependency.
- [x] `docker-compose.yml` -- create: single `postgres:16-alpine` service, named volume, port 5432, credentials matching `.env.example`'s `DATABASE_URL`.
- [x] `shared/` -- create package (`zod` its only runtime dep), `tsconfig.json`, `shared/src/index.ts` minimal export so typecheck has a compilation unit.
- [x] `server/` -- create package: `fastify`, `tsx` (dev), dep on `shared`; `src/env.ts` Zod schema over `process.env`, fail-fast (`DATABASE_URL` url, `OPENAI_API_KEY` non-empty, `PORT` optional default); `src/index.ts` boots Fastify with `logger: true` (native Pino) + `GET /api/health` → `{ status: 'ok' }` (exists to make the proxy verifiable — only route this story); seed dirs `src/core|pipeline|routes|db`, `drizzle/`, `test/` via `.gitkeep`; `typecheck` = `tsc --noEmit`.
- [x] `web/` -- official `npm create vite@latest` (react-ts), then official Tailwind install + `shadcn` CLI init, defaults throughout; `vite.config.ts` gets only the `/api` proxy to the server port.
- [x] `.env.example` -- extend: `DATABASE_URL` (compose-matching placeholder), `PORT` (commented default), keep `OPENAI_API_KEY`.
- [x] `.github/workflows/ci.yml` -- append `checks` job: checkout, setup-node 22, `npm ci`, `npm run typecheck`; update header comment.

**Acceptance Criteria:**
- Given a fresh clone with `.env` copied from `.env.example`, when `docker compose up -d && npm install && npm run dev` run, then Postgres 16 starts, Fastify boots under tsx watch, and the Vite SPA shell loads with `/api` proxied.
- Given the installed tree, when versions are inspected, then majors are the official scaffolds' pins and the root engine is Node ≥ 22.13.
- Given the repo layout, then it matches the structural seed directories and kebab-case naming.
- Given a push, then CI runs `secret-scan` (unchanged) and `checks` (typecheck) green.
- Given the diff, then nothing exists beyond what these tasks name (scope guard AC7 — R-13).

## Spec Change Log

## Verification

**Commands:**
- `docker compose up -d && docker compose ps` -- expected: postgres service running (16-alpine).
- `npm install && npm run typecheck` -- expected: clean install, all workspaces typecheck green.
- `npm run dev` (background) then `curl -s http://localhost:5173/api/health` -- expected: `{"status":"ok"}` via the Vite proxy; server stdout shows Pino JSON logs.
- Boot server with `OPENAI_API_KEY` unset -- expected: non-zero exit, error output names `OPENAI_API_KEY`.
- `git diff --stat main` -- expected: only files named in Tasks (scope guard).

**Manual checks (if no CLI):**
- CI: after push, both jobs green in Actions.

## Suggested Review Order

**Boot & fail-fast contract**

- Entry point: importing `env` validates before anything boots; Fastify with native Pino (`logger: true`).
  [`index.ts:2`](../../server/src/index.ts#L2)

- The whole contract: postgres-scheme URL, trimmed non-empty key, bounded port — exit 1 naming the variable.
  [`env.ts:4`](../../server/src/env.ts#L4)

- `--env-file-if-exists` keeps a fresh clone's missing `.env` inside the Zod message, not an ENOENT.
  [`package.json:7`](../../server/package.json#L7)

**Workspace topology & contract seam**

- Plain npm workspaces + Node ≥ 22.13 engine — the ratified monorepo shape, no tooling.
  [`package.json:7`](../../package.json#L7)

- `shared` exports TS source directly; Zod its only runtime dependency (the contract home for 1.2).
  [`package.json:6`](../../shared/package.json#L6)

- Server declares every import it makes — `zod` explicit, no phantom hoisting; types match runtime 22.
  [`package.json:10`](../../server/package.json#L10)

**Dev loop: DB, proxy, env reference**

- Loopback-only bind — matches the local-only operational envelope.
  [`docker-compose.yml:11`](../../docker-compose.yml#L11)

- `/api` proxy with the PORT-coupling stated where it lives (Vite never loads `../.env`).
  [`vite.config.ts:16`](../../web/vite.config.ts#L16)

- The complete env reference; `DATABASE_URL` in lockstep with compose credentials.
  [`.env.example:5`](../../.env.example#L5)

**CI**

- New `checks` job: `npm ci` + workspace typecheck; the golden-master test joins here in 1.8.
  [`ci.yml:28`](../../.github/workflows/ci.yml#L28)

**Peripherals**

- SPA shell trimmed to a minimal component after the demo's CSS broke against the Tailwind/shadcn init; 1.7 builds here.
  [`App.tsx:1`](../../web/src/App.tsx#L1)

- Deferred review findings routed to 1.2/1.8 (fail-fast observer, compose healthcheck, test tsconfig include).
  [`deferred-work.md:5`](deferred-work.md#L5)
