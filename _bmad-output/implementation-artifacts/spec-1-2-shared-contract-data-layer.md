---
title: 'Story 1.2 — Shared Contract & Data Layer'
type: 'feature'
created: '2026-08-21'
status: 'done'
review_loop_iteration: 0
baseline_commit: '41794ac7b2386556ff25793cc205d03e1e23068b'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No shape exists yet for `Run`/`Dish`/allergens/failures — front, back, pipeline, and the golden test would each invent their own — and the challenge's "real migration" (R2) has no home.

**Approach:** `shared` becomes the contract (one base Zod schema per entity, variants only derived, closed enums); `server/src/db` gets the Drizzle schema for the three spine tables, a committed generated SQL migration, a programmatic migrate runner, and minimal repos that embody the two read invariants (server-assigned `position` order; artifact `bytes` never in list queries).

## Boundaries & Constraints

**Always:**
- One base `z.object` per entity; variants only via `.pick()/.extend()/.omit()`; `shared` depends on Zod alone and is consumed as TS source (AD-2).
- Keys on the wire and in the DB are snake_case exactly as the ADs/ACs spell them (`price_raw`, `dish_id`, `confidence_reasons`); TS identifiers camelCase. Enum columns are `text`; Zod is the enum truth.
- Model-signal schemas stay strict-structured-output compatible for 1.5's `zodTextFormat`: `.nullable()` never `.optional()`, no `.default()`, closed enums only.
- Migration produced by `drizzle-kit generate`, committed verbatim (SQL + `meta/`); applied by `server/src/db/migrate.ts` through the same env path as `dev`.
- `timestamptz` columns, Drizzle `mode: 'date'`; the wire carries ISO-8601 strings (`z.iso.datetime`).
- No PII columns (NFR4); the only free-text column is `followup_note` (menu text is verbatim source, not PII).

**Ask First:**
- Any table/column beyond the spine ER + the Design Notes list; any enum value absent from AD-14 / PRD FR13–FR17.
- `pgEnum` types, check constraints, or indexes beyond `unique(run_id, position)`.

**Never:**
- Routes, pipeline, arbiter, fetcher, OpenAI, web changes (1.3–1.7); any test file (R8 — 1.8 owns the one test); migrations at server boot; Drizzle `casing` auto-mapping; seed data; a second DB driver.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fresh migrate | empty `menu_extraction`; `npm run -w server db:migrate` | `runs`, `dishes`, `source_artifacts` + drizzle journal created; re-run is a no-op | DB unreachable → non-zero exit, pg error printed |
| Dish order | dishes inserted as rows [c, a, b] | `insertDishes` assigns `position` 0..n-1 from array index; `getRunWithDishes` returns ascending `position` | duplicate `(run_id, position)` → unique violation |
| List never loads bytes | `listRuns()` with a multi-MB artifact stored | generated SQL selects `runs` columns only — no join, no `bytes` | N/A |
| Derivation | `modelDishSignalSchema` vs `dishSchema` | model variant has `self_flag`/`self_flag_reason`, lacks id/position/flag/review fields; `allergenSignalSchema` lacks `match` | Zod issue names the path |
| Closed enums | `failureReasonSchema.parse('ssrf_refused')` | rejected | Zod issue |

</frozen-after-approval>

## Code Map

- `shared/src/index.ts` -- stub const from 1.1; replace with re-exports.
- `shared/src/{enums,allergen,dish,run,model-signals,api}.ts` -- new; the contract (kebab-case files).
- `server/src/env.ts:4` -- `DATABASE_URL` already validated; reuse, never re-read `process.env`.
- `server/package.json` -- add `drizzle-orm`, `pg` (deps), `drizzle-kit`, `@types/pg` (dev); scripts `db:generate`, `db:migrate`.
- `server/drizzle.config.ts`, `server/src/db/{schema,client,migrate,runs-repo,source-artifacts-repo}.ts` -- new; drop `.gitkeep` in `src/db/` and `drizzle/`.
- `server/drizzle/0000_*.sql` + `meta/` -- generated output, committed (the real migration).
- `docker-compose.yml` -- add `pg_isready` healthcheck (consumes deferred-work item 2).
- Verified on drizzle-orm 0.45.2 tarball: **no native `bytea` in pg-core → `customType`**; `numeric({ mode: 'number' })`; `uuid().defaultRandom()` emits `gen_random_uuid()`; migrator at `drizzle-orm/node-postgres/migrator`; `pg` 8.23 ships an ESM entry.
- Read-only: spine ER + AD-2/5/7/8/9/14; PRD FR9–FR21, FR29; epics 1.3–1.6, 2.1, 3.1 consume these shapes.

## Tasks & Acceptance

**Execution:**
- [x] `shared/src/enums.ts` -- `z.enum`s + types: allergen ids (EU-14: `gluten crustaceans eggs fish peanuts soybeans milk nuts celery mustard sesame sulphites lupin molluscs`); failure reasons as three enums (pre-run / stored / derived) + union; run status; stage; source type `url|pdf|image`; source class; allergen provenance; description provenance; flag; review status `pending|confirmed|followup`; review action; rule ids `T1…T6`.
- [x] `shared/src/allergen.ts` -- base `allergenEntrySchema` `{ id, provenance, evidence_quote: string|null, match: { start, end }|null }`; `allergenSignalSchema = .omit({ match })`.
- [x] `shared/src/dish.ts` -- base `dishSchema` (columns per Design Notes; `confidence_reasons: { rule, detail }[]`); `modelDishSignalSchema` = `.pick` name/price_raw/description/description_provenance `.extend` allergens (signal variant), `self_flag: boolean`, `self_flag_reason: string|null`.
- [x] `shared/src/run.ts` -- base `runSchema` (columns per Design Notes; `failure_reason` = stored subset); `runSummarySchema = .extend({ state, dish_count, review_progress: { resolved, total } })` (derived at read, AD-5); `runDetailSchema = runSummarySchema.extend({ dishes })`.
- [x] `shared/src/model-signals.ts` -- `modelExtractionOutputSchema = { dishes: modelDishSignalSchema[] }`.
- [x] `shared/src/api.ts` -- `apiErrorCodeSchema` (see Design Notes), `errorEnvelopeSchema { error: { code, message } }`; `createRunResponseSchema = runSchema.pick({ id, status })`; `runListResponseSchema { runs: runSummary[] }`; `reviewRequestSchema { decisions: { dish_id, action, note: string|null }[] }` (AD-9).
- [x] `shared/src/index.ts` -- re-export all modules.
- [x] `server/package.json` -- deps + `db:generate` = `drizzle-kit generate`; `db:migrate` = `tsx --env-file-if-exists=../.env src/db/migrate.ts`.
- [x] `server/drizzle.config.ts` -- `defineConfig({ dialect: 'postgresql', schema: './src/db/schema.ts', out: './drizzle' })`.
- [x] `server/src/db/schema.ts` -- three tables per Design Notes; jsonb/enum-text columns typed with `$type<>` from `shared`.
- [x] `server/src/db/client.ts` -- `Pool` from `env.DATABASE_URL`; `drizzle(pool, { schema })`; export `db` + `Db` type.
- [x] `server/src/db/migrate.ts` -- `migrate(db, { migrationsFolder: 'drizzle' })`; exit 0/1; closes the pool.
- [x] `server/drizzle/` -- run `db:generate` once; commit the SQL and `meta/` untouched.
- [x] `server/src/db/runs-repo.ts` -- `createRun(tx, input)`, `listRuns()` (explicit `runs` columns, newest first, never joins artifacts), `getRunWithDishes(id)` (dishes `orderBy(position)`), `insertDishes(tx, runId, rows)` assigning `position = index`.
- [x] `server/src/db/source-artifacts-repo.ts` -- `insertArtifact(tx, …)`, `getArtifact(runId)` — the only reader of `bytes`.
- [x] `docker-compose.yml` -- `healthcheck: pg_isready -U postgres -d menu_extraction`, 5 s interval.

**Acceptance Criteria:**
- Given `shared/src`, when searched, then each entity has exactly one base `z.object` and every other shape is derived from it (AC1).
- Given a fresh DB, when `db:migrate` runs, then the three tables exist with uuid defaults, `timestamptz`, integer `position`, jsonb allergens/reasons, `bytea` bytes, and no PII column (AC4).
- Given the repos, then dish reads order by `position` and no list query's SQL mentions `bytes` (AC5).
- Given the diff, then nothing exists beyond these tasks, and `npm run typecheck` is green on all workspaces.

## Spec Change Log

## Design Notes

**Columns** — `runs`: `id uuid pk default gen_random_uuid()`, `source_type`, `source_ref` (URL or original file name — FR29 needs it), `source_class?`, `status`, `stage?`, `failure_reason?`, `created_at timestamptz default now()`, `stage_changed_at timestamptz default now()` (AD-10 staleness anchor). `dishes`: `id`, `run_id fk`, `position int`, `name`, `price_raw?`, `price_value numeric(10,2)?`, `allergens jsonb`, `description`, `description_provenance`, `confidence_reasons jsonb`, `flag`, `review_status default 'pending'`, `followup_note?`, `reviewed_at?`, `unique(run_id, position)`. `source_artifacts`: `run_id uuid pk fk`, `content_type`, `bytes bytea?` (URL runs store none), `acquired_text?`.

**Dish-level `unknown`** (FR13/FR21) = empty `allergens` array; no column.

**Error-code gap (surfaced for Pablo):** conventions say envelope codes come from the AD-14 enum, but AD-14 has no code for 409 (active run), 404, or a malformed review body. Resolution: `apiErrorCodeSchema = failureReasonSchema ∪ 'run_active' | 'not_found' | 'invalid_request'`; the run `failure_reason` enum itself stays closed (AC3). Record as a DECISIONS.md addendum at close.

**Timestamps:** repos return `Date`; Fastify serializes to ISO; the wire schema is the string — no mapping layer.

## Verification

**Commands:**
- `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `npm run -w server db:generate` -- expected: exactly one `server/drizzle/0000_*.sql`; contains three `CREATE TABLE`, `gen_random_uuid()`, `timestamp with time zone`, `jsonb`, `bytea`; no PII column.
- `npm run -w server db:migrate` then `psql … -c '\d dishes'` -- expected: tables present; a second `db:migrate` is a no-op.
- Scratchpad `tsx` script (never committed — R8): insert run + artifact + 3 dishes, read back ordered by `position`; `listRuns().toSQL()` contains no `bytes`.
- `git diff --stat main` -- expected: only files named in Tasks.

## Suggested Review Order

**The contract: one base per entity, everything else derived**

- Base dish row; the model variant below is a `.pick().extend()` — never a second declaration.
  [`dish.ts:14`](../../shared/src/dish.ts#L14)

- Model signals for 1.5's `zodTextFormat`: nullable-only, self-flag carried as a signal, never as the verdict.
  [`dish.ts:34`](../../shared/src/dish.ts#L34)

- Allergen entry persists T6's match offsets; the signal variant omits them (T6 computes, the web reuses).
  [`allergen.ts:6`](../../shared/src/allergen.ts#L6)

- Base run → summary (`state`, counts derived at read, AD-5) → detail (`dishes`); stored `failure_reason` is the closed subset.
  [`run.ts:13`](../../shared/src/run.ts#L13)

- AD-14 enum assembled from its three subsets (pre-run / stored / derived) — spelled once.
  [`enums.ts:45`](../../shared/src/enums.ts#L45)

- The error-code gap closed: failure reasons plus the three HTTP-only codes AD-14 had no word for.
  [`api.ts:7`](../../shared/src/api.ts#L7)

**Data layer: the real migration**

- Three spine tables; column keys are the wire keys; `bytea` via `customType` (none in pg-core 0.45).
  [`schema.ts:31`](../../server/src/db/schema.ts#L31)

- `unique(run_id, position)` — the only constraint beyond keys; server-assigned order is enforced, not hoped.
  [`schema.ts:67`](../../server/src/db/schema.ts#L67)

- Generated SQL committed verbatim — the challenge's "real migration" (R2).
  [`0000_pale_tana_nile.sql:1`](../../server/drizzle/0000_pale_tana_nile.sql#L1)

- Programmatic runner, never at boot; folder resolved from the file so any cwd works (review patch).
  [`migrate.ts:9`](../../server/src/db/migrate.ts#L9)

**Repos: the two read invariants**

- `position = index` at insert — where "server-assigned" actually lives.
  [`runs-repo.ts:37`](../../server/src/db/runs-repo.ts#L37)

- Explicit `runs` columns, newest first, no join — list queries can never touch `bytes`.
  [`runs-repo.ts:22`](../../server/src/db/runs-repo.ts#L22)

- Every dish read sorts by `position`; `[]` mid-run by construction.
  [`runs-repo.ts:27`](../../server/src/db/runs-repo.ts#L27)

- The only reader of `bytes` — serves the artifact endpoint and T6's ground text.
  [`source-artifacts-repo.ts:13`](../../server/src/db/source-artifacts-repo.ts#L13)

**Failure containment & peripherals**

- Pool `error` listener: an idle-client error no longer crashes the process (AD-14, review patch).
  [`client.ts:11`](../../server/src/db/client.ts#L11)

- Compose healthcheck consumable via `up -d --wait` — closes the 1.1 deferred item.
  [`docker-compose.yml:18`](../../docker-compose.yml#L18)

- Two new deferrals for 1.8 (schema-drift guard vs R8) and 1.3 (connection timeout).
  [`deferred-work.md:17`](deferred-work.md#L17)
