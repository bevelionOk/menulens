# Implementation Playbook — Phase 3 Detailed Guide

Companion to [plan/03-implementation.md](../03-implementation.md). Story list and several
technical positions below are **subject to Phase 2 outcomes** — where Phase 2 decides
differently, its artifacts win and this guide gets amended.

## 1. The build loop, concretely

Each story runs through `/bmad-build`: **clarify → plan → implement → review → present**.
Pablo's touchpoints per story:

1. **Clarify**: confirm story intent in one or two sentences; nail anything ambiguous now.
2. **Plan**: the agent proposes an implementation plan — approve or trim it. Trim is
   common: this is where dependency creep and gold-plating enter (see §7).
3. **Implement**: agent codes. No interaction needed.
4. **Review**: built-in review pass runs; read its findings, decide fix-now vs defer
   (deferrals → DECISIONS.md).
5. **Present**: agent explains what/why — this is the raw material for the walkthrough
   video; skim it and move on.

**Cadence**: one commit per story minimum (small increments — R-11). Conventional
messages: `feat(server): …`, `feat(web): …`, `test: …`, `docs: …`.

## 2. Technical baseline (pre-agreed, so build sessions don't relitigate)

> **Phase-2 sync (2026-08-21)**: the ratified canon supersedes several positions below —
> plain **npm** workspaces (no pnpm); the contract lives in the **`shared/` package**
> (AD-2), not `server/src/schemas/`; OpenAI uses **structured outputs via `zodTextFormat`**
> (AD-12), not `response_format: json_object`; CI (D12) carries a `checks` job that
> **lands with the scaffold**. The §3 story numbering predates `epics.md` (3 epics,
> 13 stories) — map rows by topic; real DoD comes from sprint-status + the story specs.

- **Layout**: plain npm/pnpm workspace — `server/` (Fastify+TS) and `web/` (Vite+React+TS).
  Shared Zod schemas in `server/src/schemas/` exported to web via workspace import or a
  small `shared/` folder — whichever the architecture session picked. No Nx/Turbo.
- **Local infra**: `docker-compose.yml` with **Postgres only**. App runs on the host
  (`pnpm dev`) — keeps README under 5 minutes (R-10).
- **Drizzle**: schema in TS → `drizzle-kit generate` → the generated SQL migration file
  is **committed** (R2 asks for a real migration file) → applied via a `migrate` script.
- **Fastify**: Zod type-provider for route schemas; `@fastify/multipart` for uploads
  (size cap ~10 MB); central error handler mapping known failures to the PRD's error
  states; **Pino** with request IDs, no default-logger shortcuts, redact anything
  resembling secrets.
- **OpenAI**: official SDK; JSON mode (`response_format: json_object`) + Zod parse of the
  content; one retry on invalid JSON, then a typed error. Vision inputs as data URLs.
  Models per D3 (luna default; terra behind an env var for the quality comparison).
- **Frontend**: shadcn/ui stock components (Table, Badge, Card, Alert, Skeleton);
  TanStack Query for the submit mutation + history query; loading/empty/error states
  for every remote call. No custom CSS beyond Tailwind utilities.

## 3. Story-by-story detail (expected shape; final ACs come from Phase 2)

| Story | Definition of done | Watch out for |
|---|---|---|
| 3.1 Scaffolding | Both apps boot; compose brings up Postgres; lint/typecheck scripts exist; README skeleton | Superseded by D12/Story 1.1 AC5: the CI `checks` job (typecheck) DOES land with the scaffold — the one test joins in 1.8; husky/commitlint still banned. **Ratified done 2026-08-21** (session 6, spec `1-1-project-scaffold-foundations`, D21) |
| 3.2 Schema + migration | Tables per architecture; generated SQL file in repo; migrate script idempotent | Hand-written SQL instead of generated = fine too, but it must be a *file*, not just `db push` |
| 3.3 Intake endpoints | `POST /api/menus` accepts `{url}` or multipart file; validates type/size; creates `menus` row with status | Reject early with typed errors; no queue — request handles it (guardrail) |
| 3.4 Extraction service | URL→text / PDF→text / image→vision paths; JSON-mode call; Zod-validated dishes; **confidence derivation per D4** with stored reasons; rows persisted | This is the core story — take the time here. Prompt text lives in one file (it's part of what reviewers read) |
| 3.5 Frontend | Input form (URL + drop zone) → progress → results table with confidence badges (+ reason tooltip) → history list | Stock components; the "clean UI" bar is tidy-and-obvious, not designed |
| 3.6 Logging + the test | Pino structured throughout; the **one** integration/golden-master test green (mocked OpenAI client, real Postgres, full route→DB path); justification already in DECISIONS.md | Resist adding "just one more" test — exactly one is the requirement (R8) |
| 3.7 README | Fresh-clone path: clone → `.env` from example → compose up → migrate → dev → open. Target < 5 min | Verified for real in Phase 4.5, but written honestly now |

## 4. Test-menu set (assemble at start of phase)

2 real menu URLs (one simple HTML, one messy), 1 text-based PDF menu, 1 menu photo
(phone-quality), 1 hostile case (a news article URL — must yield a clean "no menu found").
Stored under `fixtures/` (small files only; URLs in a README list). Used manually during
dev, by the golden-master fixture, and by the walkthrough demo.

## 5. Extraction-quality iteration protocol (when results disappoint — R-02)

1. Freeze one failing menu as the working case; keep the others as regression checks.
2. Change **one thing at a time**: prompt wording → few-shot example → input reduction
   (cleaner text) → model tier (luna→terra). Re-run all set members after each change.
3. Log each iteration in `prompts/06-implementation/` (the iteration sequence is
   exactly what "prompt quality — 20%" wants to see).
4. Timebox: ~90 min. Residual failure classes → DECISIONS.md + walkthrough material.

## 6. Cut ladder (pre-agreed — if time runs short, cut top-down, log each cut)

1. Confidence-reason tooltip in UI (keep the flag itself — it's R6)
2. History list styling → plain list
3. Terra quality comparison → ship luna-only with the comparison as "next step"
4. Hostile-case UX polish → generic error state
5. **Never cut**: any §1 hard requirement, the migration file, the test, Pino, prompt log

## 7. Scenarios during build sessions (and the move)

| Scenario | The move |
|---|---|
| Build plan proposes extra dependencies (ORM helpers, UI kits, utility libs) | Ask "¿qué requirement cubre?" — default no. Each dep is README-risk and review-surface. |
| Agent wants to add auth/rate limiting/caching "for production readiness" | Not built — but **noted**: add it to the production-failure-modes list instead (that's Phase 4.4 material, where it scores). |
| Review step flags something real but out of story scope | DECISIONS.md deferral note; fix only if it blocks the story's DoD. |
| Test is flaky (DB state, ports) | Fix determinism (fresh schema per run, random port) — a flaky single test is worse than none in review. |
| A story balloons past ~2 h | Stop, split or descope within the story, log it. Ballooning is the #1 schedule risk (R-01). |
| Tooling/API stalls mid-story (R-11) | Commit progress immediately, reopen, resume — sprint-status file keeps the loop's place. |
