# Phase 3 — Implementation via BMAD Build Loop (Aug 22–23)

**Goal**: working app, story by story through `/bmad-build`
(clarify → plan → implement → review → present), committed per story.

## Expected story shape (final list comes from Phase 2)

| # | Likely story | Notes / guardrails |
|---|---|---|
| 3.1 | Scaffolding: Fastify+TS backend, Vite+React+TS+Tailwind+shadcn/ui frontend, Docker Compose for Postgres only | No monorepo tooling; two plain workspaces |
| 3.2 | DB schema + **real Drizzle migration** (menus, dishes tables) | Migration file committed — R2 is explicit |
| 3.3 | Input intake: URL submit + PDF/image upload endpoint | Size/type limits; no queue — direct handling (guardrail) |
| 3.4 | Extraction service: OpenAI JSON mode (+ vision for images), Zod-validated output, confidence derivation per D4 resolution | Model per D3; retry policy simple (1 retry max) |
| 3.5 | Frontend: submit form, results table with confidence badges, TanStack Query | Stock shadcn components; loading + error states |
| 3.6 | Pino structured logging + the **one** test | Test type fixed in Phase 2; justification already in DECISIONS.md |
| 3.7 | README (install/run < 5 min) draft | Verified for real in Phase 4 |

## Standing rules for this phase

- Every `/bmad-build` session prompt → `prompts/04-implementation/`.
- Idiomatic-stack checklist while coding: Zod schemas shared FE/BE, Drizzle query style,
  Fastify plugins/hooks properly, no `any`, shadcn composition not custom CSS.
- Assemble a small **test-menu set** (2 real menu URLs, 1 PDF, 1 photo, 1 hostile case:
  a non-menu page) — used manually here, and by the walkthrough video later.
- Anything not mapping to a story → not built (log the temptation in DECISIONS.md if
  it was seriously considered).

**Exit criteria**: all stories done via build loop; app runs end-to-end locally
(URL + PDF + image paths); one test green; artifacts + prompts committed.
