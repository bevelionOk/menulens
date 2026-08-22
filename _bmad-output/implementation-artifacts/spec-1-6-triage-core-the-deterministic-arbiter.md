---
title: 'Story 1.6 — Triage Core: the Deterministic Arbiter'
type: 'feature'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'a4694091182b1ad19a3b7717d35638f05b0281d6'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The model's signals reach the pipeline (1.5) but nothing judges them: no flag, no reasons, no evidence verification, no price value, and no dish is ever persisted — every non-empty run still ends `interrupted` at `extracting`.

**Approach:** Close the loop with pure code. `server/src/core` gains the pinned normalization, the price parser, T6 evidence verification (with persisted match offsets) and the arbiter T1–T5 — all pure, importing only `shared`. The pipeline runs `validating` (triage every dish, log every fired rule) then `saving` (all dishes + `status='done'` in **one transaction**), so a run finally ends `done` with rows Ana can review. `reliable` means exactly "no rule fired".

## Boundaries & Constraints

**Always:**
- `core/*` stays pure: no `node:` imports, no `db`/`pipeline`/`env` imports; inputs typed structurally; core imports only `shared` (AC1). The shell measures and persists; core decides.
- **Pinned normalization** (AD-7), one function used by T4 and T6 and nothing else: Unicode NFKC → lowercase → NFD → strip combining marks (`\p{M}`) → collapse whitespace (runs → one space, trimmed). Applied identically to quote/name and to the acquired text. Match offsets are persisted as indices into the **original** `acquired_text` (what the web highlights), so normalization carries an index map from normalized chars back to original code points.
- **T6 runs before triage** (AC4): a `declared` allergen with a null/blank `evidence_quote` ⇒ `inferred` on every class; on `text`-class runs a quote not found in the normalized acquired text ⇒ `inferred`; a found quote gets `match: { start, end }` (original offsets, `end` exclusive). On `visual`-class runs quotes pass through unverified with `match: null` (AC6). Each downgrade appends a T6 reason and — because the entry is now `inferred` — fires T1.
- **Price (FR10, AC2)**: `price_value` is set only for exactly one numeric token in `price_raw` with no non-EUR currency marker and no range/"from" marker (`desde`, `from`, `a partir`, `-`, `/`, `…`); decimal comma or dot; a token carrying both separators, two or more numeric tokens, or any non-EUR marker (`$`, `£`, `USD`, `GBP`, `CHF`, …) ⇒ null. A bare number is EUR by the platform assumption (PRD FR10: working currency EUR) — `€`/`EUR`/`euro(s)` is confirmation, not a requirement. Currency detection returns `eur | other | mixed | none`.
- **Rules (AC3)**, each fired rule appending `{ rule, detail }` to `confidence_reasons`, evaluated in order T6 → T1 → T2 → T3 → T4 → T5: T1 any allergen `inferred` or `allergens` empty; T2 `price_value` null; T3 currency `other` or `mixed`; T4 name blank, or on `text`-class runs the normalized name not found in the normalized acquired text; T5 `self_flag` true (detail = the model's `self_flag_reason` or "model self-flag"). `flag = uncertain` iff at least one reason; else `reliable` (AC7). Description provenance never enters the gate.
- **Pipeline (AC8)**: after a non-empty extraction → `transitionStage('validating')` → triage every dish in extraction order → one Pino line per dish `{ run_id, position, flag, rules: ['T1', …] }` (names stay out of logs) → `transitionStage('saving')` → **one transaction**: `insertDishes` (position = index) + `setTerminal(tx, { status: 'done' })` + the `run finished` log — `finishRun` gains an optional `tx` so the primitive stays the single writer. Zero dishes still ends `empty` straight after `extracting` (nothing to validate). The 1.5 interim log (`extraction complete; triage not wired`) and the `dishes` dump go away.
- Triage is total: it never drops or merges rows; variants stay separate rows (FR11); a menu with no allergen information yields 100 % `uncertain` — correct behaviour, not a failure.
- No new table, column, enum value, dependency, or env var. `dishes.price_value` is `numeric(10,2)`; round to 2 decimals before insert.

**Ask First:**
- Any rule beyond T1–T6 or any change to their firing conditions; a currency list beyond the obvious symbols/ISO codes; fuzzy/approximate quote matching; thousands-separator heuristics; logging dish names or quotes.

**Never:**
- Model calls or prompt changes (1.5); the web (1.7); tests (R8 — 1.8); the review endpoint or `reviewed_at`/`followup_note` writes (2.1); `GET /api/runs` list (3.1); the artifact endpoint (2.4); re-inferring anything per variant; using the model's self-confidence as a signal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fully reliable row | text-class; name in text; `12,50 €`; `declared` gluten with quote found; `self_flag=false` | `price_value=12.5`, `match` offsets set, `confidence_reasons=[]`, `flag=reliable` | N/A |
| T6 no quote | `declared` milk, `evidence_quote=null` | entry → `inferred`, `match=null`; reasons `[T6, T1]`; `uncertain` | N/A |
| T6 quote not found (text) | quote `"contiene lacteos"`, text has `"contiene lácteos"` | NFD+strip marks makes them equal ⇒ **found**; `match` spans the original accented substring | N/A |
| T6 quote not found (text), real miss | quote absent after normalization | → `inferred`; `[T6, T1]` | N/A |
| T6 on visual | visual-class; `declared` with quote | unchanged, `match=null`; no T6; T1 only if another allergen is `inferred`/list empty | N/A |
| T1 unknown | `allergens: []` | `[T1]` detail "no allergen information"; `uncertain` | N/A |
| T2 absent / range / multiple | `price_raw` null / `"desde 10 €"` / `"9 / 14 €"` / `"10-12"` | `price_value=null`; `[T2]` | N/A |
| T3 non-EUR / mixed | `"$12"` / `"12 € (14 $)"` | `price_value=null`; `[T2, T3]` | N/A |
| T2 ambiguous separators | `"1.250,00 €"` | null (both separators); `[T2]` | N/A |
| Bare number | `"12"` | `price_value=12`, currency `none` treated as EUR; no T2/T3 | N/A |
| T4 empty / untraceable | `name=""`; or text-class name not in text (`"Pizza (chica)"` when text says `"Pizza chica"`) | `[T4]` — punctuation is **not** stripped by the chain, so this is a real miss (documented) | N/A |
| T4 on visual | visual-class, name not blank | no T4 (no ground text) | N/A |
| T5 | `self_flag=true`, reason `"price unreadable"` | `[T5]` with that detail | N/A |
| All rules | a crafted menu | each of T1–T6 fires on at least one row and one row stays `reliable` — the 1.8 fixture's shape | N/A |
| Save | 11 triaged dishes | `validating` → `saving` → one tx: 11 rows `position 0..10` + `status=done`; GET returns them ordered with `state: 'done'` | tx failure ⇒ no rows, run left `processing` (→ interrupted) |
| Crash after `validating` | Postgres drops before `saving` | logged; no partial rows (nothing written before the tx) | N/A |

</frozen-after-approval>

## Code Map

- `server/src/pipeline/run-pipeline.ts:52-89` -- the `extracting` block; replace the `extraction complete; triage not wired` tail with `validating` → triage → `saving` → the transaction. `extracted.dishes` is `ModelDishSignal[]`; `acquired.source_class` and `stored.acquired_text` are in scope.
- `server/src/pipeline/run-lifecycle.ts:18-22` -- `finishRun(log, runId, outcome)` → add optional `tx: Db | Tx = db` and pass it to `setTerminal`; `transitionStage` unchanged.
- `server/src/db/runs-repo.ts:13,85-88` -- `NewDish` (insert shape minus id/run_id/position) and `insertDishes(tx, runId, rows)` — reuse as-is; `setTerminal(tx, …)` at `:46`.
- `server/src/db/schema.ts:45-68` -- `dishes` columns: `price_value numeric(10,2) mode number`, `allergens jsonb AllergenEntry[]`, `confidence_reasons jsonb ConfidenceReason[]`, `flag`, `review_status` default `pending`. No migration.
- `shared/src/dish.ts:6-10,34-45` -- `confidenceReasonSchema { rule, detail }`, `modelDishSignalSchema` (the arbiter's input); `shared/src/allergen.ts:6-21` -- `allergenEntrySchema` with `match {start,end} | null`, `allergenSignalSchema` (no match); `shared/src/enums.ts:92` -- `ruleIdSchema` T1–T6.
- `server/src/core/run-state.ts`, `core/class-decision.ts`, `core/html-to-text.ts` -- the core style: pure, structural inputs, doc comment naming the AD. `collapseWhitespace` in `html-to-text.ts:61` is the same whitespace rule — reuse it as the chain's last step.
- `server/src/pipeline/extraction-adapter.ts:26-31` -- `ExtractionResult.dishes: ModelDishSignal[]`.
- Read-only constraints: AD-5/7/8 (spine), PRD FR10–FR21, FR24, NFR5; D4 (closed: arbiter over signals), D20 (golden asserts each T-rule by id — shape the reasons so 1.8 can), `deferred-work.md:33-36` (atomic done + dishes — closed here).

## Tasks & Acceptance

**Execution:**
- [x] `server/src/core/normalize.ts` -- `normalizeForMatch(text): { normalized: string; originOffsets: number[] }` (the pinned chain; `originOffsets[i]` = original code-point index of normalized char `i`, one extra entry for the end) and `findNormalized(haystack, needle): { start, end } | null` (normalizes both, `indexOf`, maps back to original offsets) -- one implementation for T4 and T6.
- [x] `server/src/core/price.ts` -- `parsePrice(price_raw: string | null): { value: number | null; currency: 'eur' | 'other' | 'mixed' | 'none' }` per Boundaries.
- [x] `server/src/core/t6-verify.ts` -- `verifyEvidence(allergens: AllergenSignal[], sourceClass, acquiredText: string | null): { allergens: AllergenEntry[]; reasons: ConfidenceReason[] }` -- downgrades + offsets; visual pass-through.
- [x] `server/src/core/arbiter.ts` -- `triageDish(signal: ModelDishSignal, ctx: { source_class; acquired_text }): TriagedDish` (`name, price_raw, price_value, allergens, description, description_provenance, confidence_reasons, flag`) composing T6 → T1…T5; `TriagedDish` is exactly `NewDish` minus nothing the DB defaults — assert assignability with a type-level check in the pipeline, not a runtime one.
- [x] `server/src/pipeline/run-lifecycle.ts` -- `finishRun(..., tx?)` -- the terminal write can join the dishes transaction (1.3 deferral).
- [x] `server/src/pipeline/run-pipeline.ts` -- `validating` (triage + per-dish rule log) → `saving` (one tx: `insertDishes` + `finishRun(log, runId, { status: 'done' }, tx)`); delete the interim tail.

**Acceptance Criteria:**
- Given the 1.5 Spanish fixture menu (variants, "contiene gluten y lácteos", "sin gluten", a range, "según mercado") posted through the real API on `gpt-5.6-luna`, when the run completes, then `status=done`, `stage=saving`, GET returns the rows ordered by `position` with `state: 'done'`, at least one row is `reliable`, and every `uncertain` row's `confidence_reasons` names its rules; the Pino log has one `validating`/`saving` transition each and one rule line per dish with `run_id` (AC7/AC8).
- Given a scratchpad `tsx` script (never committed) calling `triageDish` with crafted signals per matrix row, then each row's expected `price_value`, provenance, `match`, reasons and flag hold — including the accented-quote match and the offsets pointing at the accented original substring (AC2–AC6).
- Given `psql` on the completed run, then `select count(*) from dishes where run_id=…` equals the extracted count and `runs.status='done'` — and a forced failure inside the transaction (scratchpad: temporarily violate the unique `(run_id, position)`) leaves zero rows and the run `processing` (AC8 atomicity).
- Given the diff, then `grep -rn "node:\|from '\.\./pipeline\|from '\.\./db\|from '\.\./env" server/src/core` has no matches; `npm run typecheck` green on all workspaces; nothing exists beyond the Tasks.

## Spec Change Log

## Design Notes

**Offsets into the original, matching on the normalized** — NFKC/NFD change string length (ligatures expand, marks are removed), so an index into the normalized text is useless to the web. The chain therefore emits, per normalized char, the original code-point index it came from; `findNormalized` searches normalized-vs-normalized and maps `start`/`end` back. One function, both sides, offsets the evidence panel (2.4) can highlight without re-matching (AD-7).

**Bare numbers are EUR** — FR10 says "a numeric value is derived only when unambiguous" and fixes EUR as the working currency; most Spanish menus print `12,50` without a symbol. Treating a bare number as ambiguous would fire T2 on nearly every row and turn the flag into noise (the alarm-fatigue failure the PRD names). Explicit non-EUR markers are the real ambiguity and fire T3 + T2.

**Punctuation is not normalized** — the pinned chain is the invariant (D20); adding punctuation stripping would be a second chain. A name with parenthesised variant text that the source prints differently fires T4 honestly — Ana sees "name not traceable" and the row goes to review. Calibrate from real menus later; never widen the chain silently.

**`done` + dishes atomically** — `finishRun` accepts the transaction; a crash between rows and status can no longer leave dishes on a `processing` run or a `done` run with zero rows (closes 1.3's deferral).

**Post-review amendments (3 layers, ~34 raw findings → 23 unique: 6 patched / 7 deferred / 10 rejected):** the offset map now carries one entry per **UTF-16 code unit**, not per code point — `indexOf` counts units, so a single emoji before a match desynchronized the map and either shifted the highlight or threw `RangeError` and killed the whole run (reproduced: `findNormalized('🌶 Picante — contiene lácteos', 'contiene lacteos')`); `findNormalized` now refuses instead of emitting a half-computed offset, and extends `end` over trailing combining marks so a decomposed (NFD) source highlights `café`, not `cafe`. `parsePrice` refuses values ≥ 10^8: `numeric(10,2)` would have raised inside the `saving` transaction and discarded every dish in the run over one junk price. The pinned chain now runs **once per run** over the ground text (a `Normalized` travels in the triage context) — it is linear in a source that may be 10 MB, and at a measured ~112 ms/MB the per-quote version blocked the single-process event loop for tens of seconds while the UI polled. NUL is dropped exactly as `collapseWhitespace` drops it, so the trailing call stays the no-op the offsets depend on; a blank `self_flag_reason` no longer produces a T5 with an empty detail. Deferred (7): three 1.8 assertions the golden-master needs — the evidence offsets themselves, `parsePrice`'s returned value, and the forced-rollback atomicity, each demonstrably invisible to every acceptance criterion this story states — plus two Ask-First calls (thousands separator `"1.250 €"` → `1.25`; default-ignorable characters like the `&shy;` this pipeline decodes itself) and two lifecycle items (`finishRun` logs `run finished` inside the transaction; `setTerminal` never reports its guarded rowcount). Rejected under the guard: allergen dedupe, length caps, NUL sanitizing of model text, insert chunking, an aggregate triage log line, a re-run idempotency guard, per-char vs whole-string folding semantics — the production-relevant ones are rows B13–B18 in `plan/production-breaks.md`.

**Measured (gpt-5.6-luna, live fixture run):** 11 dishes, `done`/`saving`, 9.4 s in `extracting`, 2 ms in `validating`; 4 rows `reliable`, 7 `uncertain` (T1 on every row without a verifiable declaration, T4 on the four variant rows, T2+T5 on `"según mercado"` and `"4 – 6 €"`); every persisted `match` slices back to the exact accented quote.

## Suggested Review Order

**The pinned chain — one function, and the offsets the web will highlight**

- The chain itself (NFKC → lower → NFD → strip marks → collapse), one offset entry per UTF-16 code unit.
  [`normalize.ts:24`](../../server/src/core/normalize.ts#L24)

- Normalized-vs-normalized `indexOf`, mapped back to the ORIGINAL text; refuses rather than guessing.
  [`normalize.ts:61`](../../server/src/core/normalize.ts#L61)

**T6 before the gate (AC4/AC6)**

- No quote ⇒ `inferred` on every class; quote not found on a `text` run ⇒ `inferred`; `visual` passes through.
  [`t6-verify.ts:16`](../../server/src/core/t6-verify.ts#L16)

**The arbiter (AC3/AC7)**

- T6 → T1 → T2 → T3 → T4 → T5, each fired rule appending `{ rule, detail }`; `reliable` = no reason.
  [`arbiter.ts:29`](../../server/src/core/arbiter.ts#L29)

- Price: one numeric token, one separator, no range/"from", no non-EUR marker — and a magnitude the column accepts.
  [`price.ts:29`](../../server/src/core/price.ts#L29)
  [`price.ts:42`](../../server/src/core/price.ts#L42)

**The pipeline closes the loop (AC8)**

- `validating`: ground text normalized once, triage in extraction order, one log line per dish (ids, never names).
  [`run-pipeline.ts:95`](../../server/src/pipeline/run-pipeline.ts#L95)

- `saving`: all dishes + `done` in ONE transaction — `finishRun` joins it through its new `tx`.
  [`run-pipeline.ts:109`](../../server/src/pipeline/run-pipeline.ts#L109)
  [`run-lifecycle.ts:20`](../../server/src/pipeline/run-lifecycle.ts#L20)

**Peripherals**

- Seven deferrals (three of them the 1.8 golden-master's assertions) and production rows B13–B18.
  [`deferred-work.md`](deferred-work.md)
  [`production-breaks.md`](../../plan/production-breaks.md)

## Verification

**Commands:**
- `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `grep -rn "node:\|from '\.\./pipeline\|from '\.\./db\|from '\.\./env" server/src/core` -- expected: no matches.
- Scratchpad `tsx` arbiter script over the matrix rows -- expected: every assertion prints OK; print the `match` offsets and `acquired_text.slice(start, end)` for the accented case.
- `docker compose … up -d --wait` + `db:migrate` + `PORT=3100 npm run -w server dev` (real key); POST the 1.5 fixture HTML menu via the 100.64.0.7 fixture server, poll GET -- expected: `done`, rows ordered, reasons per row; `psql` counts match.
- Forced tx failure (scratchpad only, e.g. pre-insert a conflicting `(run_id, position)` row during `saving` via a breakpoint/`setTimeout`, or run the script against a copy) -- expected: zero rows, run `processing`.
- `git diff --stat main` -- expected: only files named in Tasks.
