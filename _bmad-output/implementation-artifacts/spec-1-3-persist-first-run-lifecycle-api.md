---
title: 'Story 1.3 — Persist-First Run Lifecycle API'
type: 'feature'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: '8dbe39233d8ebb5e42a3ce78399ca6e42fd67a43'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nothing yet turns a submitted menu source into a persistent, observable run: there is no `POST /api/runs`, no read endpoint, no stage-transition primitive, and no derived `interrupted` — so closing the tab would lose everything and seriality would be a UI promise only.

**Approach:** Add the two lifecycle routes (`POST /api/runs`, `GET /api/runs/:id`) over the 1.2 repos: pre-run 4xx rejections never touch the DB; accepted sources create the run row (+ artifact, one transaction) and return the id before any processing; active/interrupted state is one pure function evaluated at read and at the 409 gate; stage transitions go through one logged primitive that 1.4–1.6 will call.

## Boundaries & Constraints

**Always:**
- Pre-run rejections (E1/E4/E5) are plain 4xx in the `{ error: { code, message } }` envelope with no run row or artifact written (AD-4). Validation order: input → seriality (409) → insert.
- The run row is created with `status='processing'`, `stage=null` (no transition has happened yet); the first real transition (`fetching_source`) belongs to the pipeline (1.4). Upload bytes + content-type insert in the same transaction as the run (AC3).
- `active` and `interrupted` derive from `status` + `stage_changed_at` + the configured threshold — one pure function in `server/src/core`, no stored column, no background job (AD-5, AD-10). The 409 gate and the read path use the same function.
- Every stage transition persists `stage` + `stage_changed_at` and logs `{ run_id, stage }` through Fastify's Pino logger (AC7, NFR5).
- Staleness threshold is an env var validated at boot (`RUN_STALE_AFTER_MS`, default 180000), listed in `.env.example`.
- Upload accept set: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`; anything else — `image/heic`/`.heic` explicitly — is `unsupported_file`. Cap 10 MB, message states the cap.
- Envelope codes stay the closed `apiErrorCodeSchema`; a 5xx needs a code an endpoint can actually emit — add exactly one: `internal_error`.

**Ask First:**
- Any route beyond the two above; any new table/column; any change to enum values other than `internal_error`; magic-byte sniffing or an image/PDF library in the upload path.

**Never:**
- The pipeline itself (fetch, SSRF, class decision, OpenAI) — 1.4–1.6; `GET /api/runs` list (3.1); `/artifact` (2.4); reviews (2.1); web changes (1.7); any test file (R8 — 1.8); a partial unique index or lock for seriality (would deadlock after a crashed run, AD-10); request/route timeouts (FR6).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| URL run | JSON `{ "url": "https://x.y/menu" }`, no active run | 201 `{ id, status: 'processing' }`; row `source_type='url'`, `source_ref=url`, `stage=null`; no artifact row | N/A |
| Upload run | multipart `file` = 2 MB PDF | 201; row `source_type='pdf'`, `source_ref=<filename>`; `source_artifacts` row with bytes + `application/pdf`, same tx | N/A |
| Bad URL | `{ "url": "ftp://x" }` / `"not a url"` / missing field | 400 `invalid_url` | No DB access |
| HEIC / other type | `image/heic` mimetype or `.heic` name; `text/plain` | 415 `unsupported_file` (copy suggests export/screenshot) | No DB access |
| Oversize | 11 MB upload | 413 `file_too_large`, message names "10 MB" | Multipart limit error mapped; no DB access |
| Active run | run `processing`, `stage_changed_at` < threshold ago | 409 `run_active` | Nothing written |
| Stale run | run `processing`, `stage_changed_at` ≥ threshold ago | POST → 201 new run (old untouched); GET old → `state: 'interrupted'`, `status` still `processing` | N/A |
| Mid-run read | GET `/api/runs/:id` on `processing` | `runDetail` with `state: 'processing'`, `dishes: []`, `dish_count: 0`, `review_progress {0,0}` | N/A |
| Unknown id | GET with random uuid / non-uuid | 404 `not_found` (non-uuid never reaches Postgres) | N/A |
| Postgres down | any DB-touching request | 500 `internal_error` within ~5 s (pool `connectionTimeoutMillis`) — never a hang | Logged, process survives |

</frozen-after-approval>

## Code Map

- `server/src/index.ts:4` -- `fastify({ logger: true })` + `/api/health`; split into `app.ts` (`buildApp()`, also the 1.8 `inject` seam) and a listen-only entry.
- `server/src/env.ts:4` -- Zod env schema; add `RUN_STALE_AFTER_MS` (`z.coerce.number().int().positive().default(180000)`).
- `server/src/db/client.ts:7` -- `new Pool({ connectionString })`; add `connectionTimeoutMillis: 5000` (closes 1.2 deferred item).
- `server/src/db/runs-repo.ts:14` -- `createRun(tx, input)`; `:27` `getRunWithDishes(id)` already returns `dishes: []` mid-run (AC8). Add `findActiveRun(cutoff)`, `setStage(tx, id, stage)`, `setTerminal(tx, id, { status, failure_reason })` — each stage/terminal write also sets `stage_changed_at = now`.
- `server/src/db/source-artifacts-repo.ts:8` -- `insertArtifact(tx, runId, { content_type, bytes })` — reuse as-is inside the POST transaction.
- `server/src/db/schema.ts:31` -- `runs` columns (`stage_changed_at` = staleness anchor, `:42`); `source_artifacts.bytes` Buffer via `customType`.
- `shared/src/api.ts:9` -- `apiErrorCodeSchema` (add `internal_error`); `:26` `createRunResponseSchema`; add `createRunUrlRequestSchema = z.object({ url: z.string() })`.
- `shared/src/run.ts:27` -- `runSummarySchema` / `runDetailSchema` — the GET payload shape (`state`, `dish_count`, `review_progress`, `dishes`).
- `shared/src/enums.ts:53-62` -- `runStatusSchema`, `stageSchema`, `runStateSchema` (`interrupted` lives here, never in `failure_reason`).
- Read-only constraints: AD-4/5/10/14 (spine §AD), spine Conventions (envelope, logging, config); PRD FR1–FR8, FR35; DECISIONS D13, D22 (envelope narrowing rationale).
- `@fastify/multipart` 10.1.1 (spine snapshot, Fastify 5 line): `request.file()` + `part.toBuffer()`; exceeding `limits.fileSize` rejects with `RequestFileTooLargeError` (`code: 'FST_REQ_FILE_TOO_LARGE'`). Verify against the installed tarball (R-13 practice).

## Tasks & Acceptance

**Execution:**
- [x] `server/package.json` -- add `@fastify/multipart` -- the only new dependency.
- [x] `server/src/env.ts` -- add `RUN_STALE_AFTER_MS`; `.env.example` -- document it as optional with the default.
- [x] `server/src/db/client.ts` -- `connectionTimeoutMillis: 5000` -- DB down = honest 500, not a hang (AD-14).
- [x] `shared/src/api.ts` -- `createRunUrlRequestSchema`; `internal_error` in `apiErrorCodeSchema` -- the web (1.7) and the error handler share one contract.
- [x] `server/src/core/run-state.ts` -- pure: `isActive(run, now, staleAfterMs)`, `deriveState(run, now, staleAfterMs)` → `RunState`, `toRunDetail(run, dishes, now, staleAfterMs)` → `RunDetail`-shaped object (counts, `review_progress.resolved` = dishes with `review_status !== 'pending'`). Imports only `shared` types; input typed structurally (`status`, `stage_changed_at: Date`) so core never imports `db`.
- [x] `server/src/db/runs-repo.ts` -- `findActiveRun(cutoff: Date)` (`status='processing' AND stage_changed_at > cutoff`, explicit `runs` columns), `setStage`, `setTerminal` -- the writes 1.4–1.6 need, nothing more.
- [x] `server/src/pipeline/run-lifecycle.ts` -- `transitionStage(log, runId, stage)` and `finishRun(log, runId, outcome)` wrapping the repo writes with `log.info({ run_id, stage | status, failure_reason })` -- the single place a transition is persisted + logged (AC7). Delete `pipeline/.gitkeep`, `core/.gitkeep`, `routes/.gitkeep` as each dir gains a file.
- [x] `server/src/errors.ts` -- `ApiError(status, code, message)`; `errorHandler` (ApiError → envelope; multipart too-large → 413 `file_too_large` "…10 MB cap"; Fastify validation / bad JSON → 400 `invalid_request`; else `log.error` + 500 `internal_error`); `notFoundHandler` → 404 `not_found`.
- [x] `server/src/routes/runs.ts` -- Fastify plugin: `POST /api/runs` (multipart → type check by mimetype + `.heic`/`.heif` name → `toBuffer()`; JSON → `createRunUrlRequestSchema` + `new URL()` with `http:`/`https:` only → else `invalid_url`; then `findActiveRun(now − threshold)` → 409; then `db.transaction`: `createRun` + `insertArtifact` (uploads); reply 201 `{ id, status }`; `request.log.info({ run_id }, 'run created')`). `GET /api/runs/:id` (uuid regex guard → 404; `getRunWithDishes` → 404; `toRunDetail`).
- [x] `server/src/app.ts` -- `buildApp()`: logger, `@fastify/multipart` `{ limits: { fileSize: 10 * 1024 * 1024, files: 1 } }`, handlers, health route, runs plugin. `server/src/index.ts` -- `buildApp()` + `listen` only.

**Acceptance Criteria:**
- Given any 4xx in the matrix, when `SELECT count(*) FROM runs` is compared before/after, then it is unchanged (AC2).
- Given an accepted upload, when the transaction is inspected, then `runs` and `source_artifacts` rows share the run id and were written atomically — a forced artifact-insert failure leaves no run row (AC3).
- Given `setStage`/`finishRun` calls from a scratchpad script, then `stage_changed_at` advances on each and one Pino line per call carries `run_id` (AC7).
- Given the threshold lowered via env to a few seconds, when a fresh run ages past it, then GET shows `state: 'interrupted'` and POST succeeds again (AC4–AC6 end to end).
- Given the diff, then nothing exists beyond these tasks and `npm run typecheck` is green on all workspaces.

## Spec Change Log

## Design Notes

**`stage=null` at creation** — the row proves the run was born; `fetching_source` is 1.4's first real transition. A null stage while `processing` is an honest "accepted, not started" — 1.7 renders it as such. Until 1.4 lands, every run ends `interrupted` by the staleness net, exactly as the epic predicts.

**Terminal writes keep the last `stage`** — `finishRun` sets `status` (+ `failure_reason`) and bumps `stage_changed_at`; the stage where a run ended stays readable in the row and logs. No extra column.

**Seriality race (documented residual, "what breaks in production")** — check-then-insert is not atomic: two POSTs inside the same few ms can both pass `findActiveRun`. A partial unique index on `status='processing'` would be the atomic guard but turns a crashed run into a permanent lock (the exact deadlock AD-10 forbids). Single operator + UI-disabled submit makes the race theoretical; recorded, not engineered.

**HTTP status per code** — 400 `invalid_url`/`invalid_request`, 413 `file_too_large`, 415 `unsupported_file`, 404 `not_found`, 409 `run_active`, 500 `internal_error`.

**Post-review amendments (3 layers, ~55 raw findings → 6 patch / 3 defer / rest rejected):** the 409 gate now reads the newest `processing` row (`findLatestProcessingRun`, superseding the Code Map's `findActiveRun(cutoff)`) and decides with `isActive` — one encoding of the staleness rule, as the frozen intent requires; mimetype lookup via `Map` after normalization (a plain object resolved `constructor`); 0-byte uploads and credential-bearing URLs rejected pre-run; `setStage`/`setTerminal` guarded on `status = 'processing'`; the error handler tolerates non-object throws. Deferred with owners: stage-vs-staleness budget (1.5), atomic `done` + dishes (1.6), terminal-state read in the golden (1.8).

## Verification

**Commands:**
- `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `docker compose up -d --wait` + `npm run -w server db:migrate` + `npm run -w server dev` -- expected: boot log shows the server listening; `RUN_STALE_AFTER_MS` absent ⇒ default applies.
- `curl -s -X POST localhost:3000/api/runs -H 'content-type: application/json' -d '{"url":"https://example.com/menu"}'` -- expected: 201 `{ id, status: 'processing' }`; repeated immediately ⇒ 409 `run_active`.
- `curl -s localhost:3000/api/runs/<id>` -- expected: `runDetailSchema`-shaped body, `dishes: []`, `state: 'processing'`; after `RUN_STALE_AFTER_MS=5000` restart + 6 s ⇒ `state: 'interrupted'`.
- `curl -s -F file=@menu.pdf …`, `-F file=@photo.heic`, `-F file=@big-11mb.bin;type=application/pdf`, `-d '{"url":"ftp://x"}'` -- expected: 201 with artifact row / 415 / 413 naming 10 MB / 400; `SELECT count(*) FROM runs` unchanged by the 4xx cases.
- `docker compose stop` then any request -- expected: 500 `internal_error` within ~5 s; server still up.
- Scratchpad `tsx` script (never committed — R8) calling `transitionStage`/`finishRun` -- expected: `stage_changed_at` moves; log lines carry `run_id`.
- `git diff --stat main` -- expected: only files named in Tasks.

## Suggested Review Order

**Persist-first: the run exists before anything happens**

- Entry point — validation order input → 409 → one transaction; no DB touch before the gate.
  [`runs.ts:34`](../../server/src/routes/runs.ts#L34)

- Run row + uploaded bytes in one transaction — an artifact failure leaves no run (AC3).
  [`runs.ts:78`](../../server/src/routes/runs.ts#L78)

- `stage: null` at birth — the first real transition belongs to the pipeline (1.4).
  [`runs.ts:47`](../../server/src/routes/runs.ts#L47)

**Derived state: one pure rule for the gate and the read**

- `isActive` — the only encoding of "processing and not stale"; core imports no IO.
  [`run-state.ts:15`](../../server/src/core/run-state.ts#L15)

- `interrupted` derived at read, never stored (AD-5).
  [`run-state.ts:20`](../../server/src/core/run-state.ts#L20)

- The 409 gate asks the newest `processing` row and decides with `isActive` (review patch).
  [`runs.ts:72`](../../server/src/routes/runs.ts#L72)

- Repo returns data only — no staleness math in SQL.
  [`runs-repo.ts:24`](../../server/src/db/runs-repo.ts#L24)

- GET detail: uuid guard before Postgres, then `toRunDetail` (counts + state, `dishes: []` mid-run).
  [`runs.ts:88`](../../server/src/routes/runs.ts#L88)

**Transitions: persisted and logged in one place (AC7)**

- `transitionStage` / `finishRun` — what 1.4–1.6 call; one Pino line per write with `run_id`.
  [`run-lifecycle.ts:9`](../../server/src/pipeline/run-lifecycle.ts#L9)

- Writes guarded on `status = 'processing'` — a late write never rewrites a terminal run (review patch).
  [`runs-repo.ts:37`](../../server/src/db/runs-repo.ts#L37)

**Pre-run rejections: 4xx with no row**

- Accept set as a `Map` after mimetype normalization — a plain object resolved `constructor` (review patch).
  [`runs.ts:13`](../../server/src/routes/runs.ts#L13)

- HEIC by name when mislabeled; renamed-`.jpg` HEIC passes by design — no sniffing.
  [`runs.ts:21`](../../server/src/routes/runs.ts#L21)

- Credentials in a URL would land in `source_ref` and logs — rejected (review patch).
  [`runs.ts:63`](../../server/src/routes/runs.ts#L63)

- The envelope: `ApiError` → code; multipart cap → 413 naming 10 MB; unknown → 500 `internal_error`.
  [`errors.ts:20`](../../server/src/errors.ts#L20)

**Peripherals**

- `buildApp()` — the 1.8 `inject` seam; multipart limit 10 MB, one file.
  [`app.ts:7`](../../server/src/app.ts#L7)

- Staleness threshold is config, validated at boot; default 3 min.
  [`env.ts:10`](../../server/src/env.ts#L10)

- Postgres down = honest 500 in ≤5 s, never a hang (closes the 1.2 deferral).
  [`client.ts:8`](../../server/src/db/client.ts#L8)

- Contract: `internal_error` (the one 5xx an endpoint emits) + the URL request body.
  [`api.ts:14`](../../shared/src/api.ts#L14)

- Three deferrals with owners (1.5 / 1.6 / 1.8).
  [`deferred-work.md:29`](deferred-work.md#L29)
