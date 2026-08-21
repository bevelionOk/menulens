---
title: 'Story 1.5 — Extraction Adapter: the OpenAI Seam'
type: 'feature'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: '57ac771864c3410e159ac31b5e5a97214553b961'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Runs acquire a source and a class (1.4) but nothing reads the menu: no model call exists, no prompt, no seam for the golden-master to mock, and every run still ends `interrupted` at `fetching_source`.

**Approach:** Make `extracting` real through exactly one injected boundary. An extraction adapter receives the OpenAI client, builds the input by source class (text prompt for `text`, vision image / native PDF `input_file` for `visual`), enforces the `shared` model-signal schema with `zodTextFormat` strict structured outputs, retries invalid output exactly once, maps every failure to the closed E7 reasons, and logs token usage. The pipeline transitions to `extracting`, calls the seam, ends `empty` on zero dishes (E9), and — because triage + saving belong to 1.6 — stops after a successful non-empty extraction with the validated signals logged, leaving the run `processing` at `extracting` (→ `interrupted` via the staleness net) until 1.6 appends `validating`/`saving`. The runtime prompt is a versioned file in `prompts/`.

## Boundaries & Constraints

**Always:**
- The seam is a function type, not the SDK: `ExtractFn = (input: ExtractionInput, log) => Promise<ExtractionResult>`. `buildApp(deps?: { extract?: ExtractFn })` threads it to `runPipeline`; the default adapter is created in `index.ts` from env. Exactly one file imports `openai`: `server/src/pipeline/extraction-adapter.ts` (AC1). 1.8 mocks `extract`, never the SDK.
- The OpenAI client is constructed with `maxRetries: 0` and the per-call `timeout: env.MODEL_TIMEOUT_MS` (default 120 000) — the SDK's own retries would silently violate "exactly one retry" and "one technical timeout" (FR6).
- Structured outputs: `client.responses.parse({ model, input, text: { format: zodTextFormat(modelExtractionOutputSchema, 'menu_extraction') } })`; the result is re-validated with `modelExtractionOutputSchema.safeParse` — a refusal, a null `output_parsed`, or a schema miss is "invalid output". Hand-parsing JSON is forbidden (AD-12).
- Input by class (AD-6/AD-12): `text` → system prompt + the acquired text as user input; `visual` + image content type → `input_image` with a base64 data URL of the stored bytes (`detail: 'high'`); `visual` + `application/pdf` → `input_file` (`filename`, base64 `file_data`). A `text`-class PDF sends its text, never the file.
- Failure mapping (closed enum, no additions): timeout (`APIConnectionTimeoutError`) → `model_timeout`, no retry; any other `APIError`/connection error → `model_error`, no retry; invalid output → retry once with the same input; second invalid → `model_invalid_output`. Retry and failure each log one line with `run_id` and `attempt`.
- Before the retry, `transitionStage(log, runId, 'extracting')` runs again (`attempt: 2` in the log) — a real event that bumps the staleness anchor, so two attempts never read as `interrupted` mid-flight (closes 1.3's deferral without raising the 3-min threshold).
- Token usage is logged after every completed call: `{ run_id, model, attempt, input_tokens, output_tokens, total_tokens, prompt_version }` — the measured cost that feeds BUSINESS.md (NFR2). The model id comes from `OPENAI_MODEL` (default `gpt-5.6-luna`, D3).
- The runtime prompt lives at `prompts/runtime/extraction-v1.md` (version in the name), is read once at adapter creation, and carries in plain language: FR9 fields; FR11 one row per variant with dish-level info copied, never re-inferred; FR14 names/descriptions verbatim in the menu's language; FR10 `price_raw` exactly as printed; FR13 EU-14 canonical ids with `declared` (+ verbatim `evidence_quote`) vs `inferred` provenance, dish with no information = empty `allergens`; FR21 "gluten-free" and similar claims create nothing; FR12 `description_provenance` `extracted`/`generated`; FR18 self-flag criteria (ambiguous price, doubtful legibility, unclear dish boundaries, allergen not literal) with "when in doubt, flag".
- Pipeline continuation in `run-pipeline.ts`: after the acquisition write → `transitionStage('extracting')` → `extract` → zero dishes ⇒ `finishRun({ status: 'empty' })` (E9); ≥1 dish ⇒ `log.info({ run_id, dish_count }, 'extraction complete; triage not wired (1.6)')` and return. `ExtractionError` ⇒ `finishRun({ status: 'failed', failure_reason })`. Unexpected throws keep 1.4's behaviour (logged, run left `processing`).
- Every stage/status write still goes through the 1.3 primitives; no new table, column, or enum value.

**Ask First:**
- Any env var beyond `OPENAI_MODEL` and `MODEL_TIMEOUT_MS`; sending `text`-class PDFs as files; any model parameter beyond `model`/`input`/`text.format` (temperature, reasoning, max tokens); a second prompt file; persisting signals before 1.6.

**Never:**
- The arbiter, T6, price parsing, `validating`/`saving`, dish persistence (1.6); web changes (1.7); test files (R8 — 1.8); chat-completions API or `response_format: json_object`; hand-rolled JSON parsing or repair; more than one retry; image resizing/transcoding; prompt templating libraries; any SDK import outside the adapter.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Text-class URL/PDF run | `source_class='text'`, `acquired_text` set | stage `extracting`; one call with system prompt + text; ≥1 dish ⇒ signals validated, `extraction complete` + usage logged, run stays `processing` (→ 1.6) | N/A |
| Visual image run | `source_class='visual'`, artifact `image/jpeg` bytes | `input_image` data URL; same completion path | N/A |
| Visual PDF run (scanned) | `source_class='visual'`, `application/pdf` bytes | `input_file` with `file_data`; same completion path | N/A |
| Zero dishes | model returns `dishes: []` | `finishRun(empty)` ⇒ `status='empty'`, `failure_reason=null`; usage still logged (E9) | N/A |
| Invalid output once | first parse fails (schema miss / refusal), second valid | `extracting` re-transitioned (`attempt: 2`), second result used; two usage lines | retry logged `warn` |
| Invalid output twice | both attempts invalid | `failed(model_invalid_output)` | both attempts logged |
| Timeout | call exceeds `MODEL_TIMEOUT_MS` | `failed(model_timeout)` — no retry | logged `warn` with elapsed ms |
| API error | 401/429/5xx / connection refused | `failed(model_error)` — no retry | logged `warn` with status |
| Run lacking ground input | `text` class with null `acquired_text`, or `visual` with no bytes | throws a plain `Error` ⇒ logged, run left `processing` (data-integrity state, unreachable via 1.4) | `error` log |
| Seam injected (1.8) | `buildApp({ extract: mock })` | pipeline uses the mock; no `openai` import executes in the test path | N/A |

</frozen-after-approval>

## Code Map

- `server/src/pipeline/run-pipeline.ts:31-48` -- the acquisition write + `source acquired` log; append the `extracting` block after it. `runPipeline(log, runId)` gains a third param `extract: ExtractFn`.
- `server/src/pipeline/run-lifecycle.ts:9-22` -- `transitionStage` / `finishRun` (`RunOutcome` already allows `status: 'empty'` with `failure_reason` null). Reuse verbatim.
- `server/src/pipeline/acquisition-error.ts` -- the error-class pattern to mirror: `ExtractionError(reason: Extract<StoredFailureReason, 'model_timeout' | 'model_error' | 'model_invalid_output'>, message, details)` in `extraction-error.ts`.
- `server/src/routes/runs.ts:87` -- `void runPipeline(request.log, created.id)`; the plugin receives `extract` via Fastify plugin options (`app.register(runsRoutes, { extract })`) and passes it through.
- `server/src/app.ts:8` -- `buildApp()` → `buildApp(deps: { extract?: ExtractFn } = {})`; default = `createExtractionAdapter(new OpenAI({ apiKey: env.OPENAI_API_KEY, maxRetries: 0 }), { model: env.OPENAI_MODEL, timeoutMs: env.MODEL_TIMEOUT_MS })` built lazily in `index.ts` and passed in — `app.ts` must not import the adapter module (keeps the `inject` seam SDK-free for 1.8). Read `server/src/index.ts` for the listen-only entry.
- `server/src/env.ts:4-14` -- add `OPENAI_MODEL: z.string().min(1).default('gpt-5.6-luna')`, `MODEL_TIMEOUT_MS: z.coerce.number().int().positive().default(120000)`; document both in `.env.example`.
- `server/src/db/source-artifacts-repo.ts` -- `getArtifact(runId)` returns `bytes` + `content_type` + `acquired_text`; `run-pipeline.ts:18` already fetches it for uploads — fetch it for every run now (URL runs have a row after 1.4).
- `shared/src/model-signals.ts:5` -- `modelExtractionOutputSchema` (`{ dishes: modelDishSignalSchema[] }`), strict-output safe (`.nullable()` only, no optional/default); `shared/src/dish.ts:34` `modelDishSignalSchema`; `shared/src/allergen.ts:20` `allergenSignalSchema`; `shared/src/enums.ts:7` `allergenIdSchema` (the 14 ids the prompt lists verbatim).
- `openai@7.5.0` (spine snapshot; `zodTextFormat` + Zod 4 verified by execution 2026-08-21 in `reviews/review-versions.md`) -- `import OpenAI, { APIConnectionTimeoutError, APIError } from 'openai'`, `import { zodTextFormat } from 'openai/helpers/zod'`, `client.responses.parse(...)` → `output_parsed`, `usage.{input_tokens,output_tokens,total_tokens}`; per-request `{ timeout }` as the second argument. Verify all four names against the installed tarball before use (R-13 practice) and note any deviation in the report.
- `prompts/README.md:17` -- phase-folder table; add a `runtime/` row ("versioned runtime prompts the server loads — not session prompts") so the folder stays a first-class deliverable.
- Read-only constraints: AD-6/AD-12/AD-13/AD-14 (spine), PRD FR6/FR9–FR14/FR18/FR21, NFR2, E7/E9; D3 (model tiers); `deferred-work.md:29` (the 1.3 extracting-budget deferral this story closes).

## Tasks & Acceptance

**Execution:**
- [x] `server/package.json` -- add `openai` (^7.5.0) -- the only new dependency.
- [x] `server/src/env.ts` + `.env.example` -- `OPENAI_MODEL`, `MODEL_TIMEOUT_MS` -- model tier and the single technical timeout are config (D3, FR6).
- [x] `prompts/runtime/extraction-v1.md` + `prompts/README.md` -- the versioned runtime prompt (content per Boundaries) and its index row (R11).
- [x] `server/src/pipeline/extraction-error.ts` -- `ExtractionError` with the three E7 reasons.
- [x] `server/src/pipeline/extraction-adapter.ts` -- `ExtractionInput` (`{ run_id, source_class, content_type, acquired_text, bytes }`), `ExtractionResult` (`{ dishes, usage, attempts }`), `ExtractFn`, `createExtractionAdapter(client, { model, timeoutMs, prompt })` → `ExtractFn`: build input by class, `responses.parse` with `zodTextFormat`, re-validate, one retry on invalid output, error mapping, usage logging per attempt. The only `openai` import.
- [x] `server/src/pipeline/run-pipeline.ts` -- accept `extract`; load the artifact for every run; append `extracting` → `extract` → `empty` / `extraction complete` / `ExtractionError` → `finishRun(failed)`; re-transition before the retry is the adapter's job via a `onRetry` callback, or the adapter receives `transitionStage` — choose the former (adapter stays DB-free: `createExtractionAdapter` takes no db; `ExtractFn` gets `{ onRetry?: () => Promise<void> }` in its input).
- [x] `server/src/routes/runs.ts` + `server/src/app.ts` + `server/src/index.ts` -- thread `extract` (plugin options → `runPipeline`); `index.ts` builds the default adapter from env; `app.ts` never imports `openai` or the adapter.

**Acceptance Criteria:**
- Given a real `gpt-5.6-luna` key and a text-class run from a scratchpad HTML menu with ≥5 dishes, variants, a declared allergen line and a "sin gluten" claim, when the pipeline runs, then GET shows `stage: 'extracting'`, the log carries one `model usage` line with non-zero tokens, `extraction complete` with `dish_count ≥ 5`, each variant is a separate dish in the logged signals, and no allergen entry was created from the "sin gluten" claim (AC2, AC5, AC6).
- Given the same source with the model forced to fail once (scratchpad-only wrapper that corrupts the first `output_parsed`), then the log shows `attempt: 2`, a second `run stage changed` for `extracting`, and the run completes; forced twice ⇒ `failed(model_invalid_output)` (AC4).
- Given `MODEL_TIMEOUT_MS=1`, then the run ends `failed(model_timeout)` with no second attempt; given a wrong API key, `failed(model_error)` (AC4).
- Given an uploaded photo of a menu and a scanned PDF, then both take the visual path (`input_image` / `input_file` visible in a debug log of the input shape — never the bytes) and extract ≥1 dish (AC2).
- Given a scratchpad HTML page that is text but not a menu (a news article), then the run ends `status='empty'`, `failure_reason=null` (AC7).
- Given `grep -rn "from 'openai'" server/src`, then the only match is `pipeline/extraction-adapter.ts`; `buildApp` imports neither (AC1); `npm run typecheck` green on all workspaces.

## Spec Change Log

## Design Notes

**Why `done` lands in 1.6, not here** — AC8 says a non-empty extraction completes `done`, but dishes can only be written with a flag and reasons, which the arbiter (1.6) produces, and 1.3's deferral requires `done` + dishes in one transaction. Writing `done` with zero rows would be the theatrical state D23 rejected; persisting raw signals would need a column the ER does not have. So this story ends a successful non-empty run at `extracting` with the validated signals logged — the same honest partial pattern 1.4 used — and 1.6 appends `validating` + `saving` + `done` in `run-pipeline.ts`. `empty` is fully real here (no dishes to write).

**Seam = function, not SDK** — the golden-master (AD-13) mocks "the model's answer", not HTTP. `ExtractFn` is the narrowest thing that carries that answer; `createExtractionAdapter` is the only producer of a real one. Mocking the SDK would couple the single test to the Responses API shape.

**SDK retries off** — openai-node retries 2× by default on 408/409/429/5xx with backoff; left on, a 429 could cost ~3 attempts and the run's "one timeout" would silently stack. `maxRetries: 0` makes the story's retry the only retry.

**Retry re-transition** — `transitionStage('extracting')` again before attempt 2 writes the same stage and bumps `stage_changed_at`; the log line carries `attempt: 2` so it reads as the real event it is (the model is being asked again), not a theatrical sub-stage.

**Post-review amendments (3 layers, ~45 raw findings → 7 patch / 1 defer / rest rejected):** the "invalid output" retry bucket is now exactly "the SDK rejected the model's text" (`OpenAIError` non-`APIError`, `SyntaxError`, `ZodError`) — programming errors reach the outer catch instead of wearing `model_invalid_output`; SDK errors travel as `cause`; the invalid-output warn line names `status` / `incomplete_reason` / refusal text; `elapsed_ms` joins `model usage` (NFR1 calibration for the "30–90 s" copy); empty prompt file fails boot; `OPENAI_MODEL` trimmed; prompt v1 disambiguates "marisco" (`crustaceans` vs `molluscs`, generic → both `inferred`), rewords the empty-description rule, and states that headings/legends are not dishes while priced drinks and set menus are. Two deviations from the Code Map accepted: `createOpenAIClient` lives in the adapter so `index.ts` never imports `openai` (AC1 literal) and `extract` is required in `buildApp` (compiler-enforced seam for 1.8). Deferred (1.8): the adapter's retry/mapping/usage semantics run only in logged real runs — the golden mocks above the adapter. Rejected under the guard: skipping the retry on `max_output_tokens` (AC4 says exactly one retry), a cross-attempt deadline, `developer` role, `max_output_tokens`, a prompt-version env, tests (R8) — the production-relevant ones are rows B6–B9, B11–B12 in `plan/production-breaks.md`.

**Measured cost (gpt-5.6-luna, prompt v1):** text run ≈ 2.7k tokens (1.6k in / 1.1k out, ~8 s); visual image ≈ 3.4k; visual PDF ≈ 3.8k; a retried run doubles it. At $0.20/$1.20 per M that is ≈ $0.002 per menu — inside NFR2's envelope with margin; feeds BUSINESS.md at the epic close.

## Verification

**Commands:**
- `npm install` then `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `grep -rn "from 'openai'" server/src` -- expected: only `server/src/pipeline/extraction-adapter.ts`.
- Scratchpad `tsx` snippet (never committed) importing the installed `openai` to confirm `zodTextFormat(modelExtractionOutputSchema, 'menu_extraction')` yields `strict: true` with no `optional` leaks, and that `responses.parse` + `APIConnectionTimeoutError` exist as named.
- `docker compose … up -d --wait` + `db:migrate` + `PORT=3100 npm run -w server dev` with the real key -- expected: boot OK; `OPENAI_MODEL`/`MODEL_TIMEOUT_MS` absent ⇒ defaults.
- Scratchpad fixture server (reuse the 1.4 pattern on a non-refused address) serving: a Spanish HTML menu (variants, "contiene gluten y lácteos", "sin gluten" claim, a price range), a news article, plus uploads of a menu photo and a scanned PDF -- expected per matrix/ACs; inspect `psql` for `status`/`stage`/`failure_reason` and the Pino lines for `model usage` / `attempt`.
- `MODEL_TIMEOUT_MS=1` restart → `failed(model_timeout)`; `OPENAI_API_KEY=sk-wrong` → `failed(model_error)`.
- `git diff --stat main` -- expected: only files named in Tasks (+ `package-lock.json`).

## Suggested Review Order

**The seam: one function, one file imports the SDK**

- `ExtractFn` is what the pipeline calls and what 1.8 mocks — the adapter is its only real producer.
  [`extraction-adapter.ts:110`](../../server/src/pipeline/extraction-adapter.ts#L110)

- `buildApp(deps)` threads the seam; this module never imports `openai`.
  [`app.ts:13`](../../server/src/app.ts#L13)

- The listen-only entry builds the real adapter from env; `maxRetries: 0` lives with the client.
  [`index.ts:7`](../../server/src/index.ts#L7)
  [`extraction-adapter.ts:49`](../../server/src/pipeline/extraction-adapter.ts#L49)

**One retry, one timeout, closed reasons**

- Timeout before `APIError` (it is a subclass) → `model_timeout`; other API errors → `model_error`; neither retries.
  [`extraction-adapter.ts:132`](../../server/src/pipeline/extraction-adapter.ts#L132)

- Only the SDK rejecting the model's text is "invalid output" (review patch) — everything else escapes.
  [`extraction-adapter.ts:58`](../../server/src/pipeline/extraction-adapter.ts#L58)

- Attempt 2 waits for `onRetry` — the pipeline re-writes `extracting` so the staleness anchor moves.
  [`extraction-adapter.ts:121`](../../server/src/pipeline/extraction-adapter.ts#L121)
  [`run-pipeline.ts:67`](../../server/src/pipeline/run-pipeline.ts#L67)

- Re-validation against the `shared` schema; second miss → `model_invalid_output`.
  [`extraction-adapter.ts:164`](../../server/src/pipeline/extraction-adapter.ts#L164)

**Input by class (AD-6)**

- `text` sends the acquired text (a text-class PDF included); `visual` sends bytes — vision or native `input_file`.
  [`extraction-adapter.ts:76`](../../server/src/pipeline/extraction-adapter.ts#L76)

**The pipeline's honest partial**

- `extracting` → seam → `empty` (E9) is real; a non-empty result is logged and left for 1.6's `saving`.
  [`run-pipeline.ts:54`](../../server/src/pipeline/run-pipeline.ts#L54)
  [`run-pipeline.ts:83`](../../server/src/pipeline/run-pipeline.ts#L83)

- `ExtractionError` is the only path to `failed`; anything else keeps 1.4's crash behaviour.
  [`run-pipeline.ts:75`](../../server/src/pipeline/run-pipeline.ts#L75)

**The prompt (R11, 20% of the score)**

- Allergen ids, `declared` + verbatim quote vs `inferred`, negative claims create nothing (FR13/FR19/FR21).
  [`extraction-v1.md:19`](../../prompts/runtime/extraction-v1.md#L19)

- Variants as rows with dish-level info copied (FR11); self-flag criteria with "when in doubt, flag" (FR18).
  [`extraction-v1.md:15`](../../prompts/runtime/extraction-v1.md#L15)
  [`extraction-v1.md:34`](../../prompts/runtime/extraction-v1.md#L34)

**Peripherals**

- Cost line per attempt with `elapsed_ms` — the measured number BUSINESS.md needs.
  [`extraction-adapter.ts:161`](../../server/src/pipeline/extraction-adapter.ts#L161)

- Model tier and the single technical timeout are config.
  [`env.ts:15`](../../server/src/env.ts#L15)

- One deferral for 1.8 (adapter semantics outside CI); production-failure rows B6–B12.
  [`deferred-work.md:49`](deferred-work.md#L49)
  [`production-breaks.md`](../../plan/production-breaks.md)
