---
title: 'Story 1.8 — The One Test: Golden-Master + CI Complete'
type: 'feature'
created: '2026-08-22'
status: 'ready-for-dev'
review_loop_iteration: 0
baseline_commit: '3ea07f4'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/deferred-work.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The whole promise — contract → acquisition → model seam → triage → persistence → read — is verified today only by runs a human drove by hand. CI runs typecheck and a secret scan; `server/test/` holds a `.gitkeep`. R8 ("exactly one meaningful automated test, and justify the choice") is a hard submission requirement and Epic 1's exit gate, and it is currently at zero.

**Approach:** One Vitest golden-master. It builds the app with the model seam mocked (`buildApp({ extract })`), POSTs a fixture through the real HTTP surface via `app.inject()`, polls the run to completion against real Postgres, and asserts the normalized payload against one committed golden. The mock is crafted so **every rule T1–T6 fires at least once and one row stays fully `reliable`**, so the golden fails naming the rule if any of them ever stops firing. CI's `checks` job gains a Postgres service container and runs it.

**The R8 line, drawn explicitly:** one test means one end-to-end test of the one path, not one file with a suite hiding inside it. Assertions about **that run's own observable payload** belong in it. Anything that would need a different fixture, a different entry point or a different failure injection is not smuggled in — it is recorded in DECISIONS.md as verified by the logged manual runs, with the argument written down.

## Boundaries & Constraints

**Always:**
- **Exactly one test file**, `server/test/golden-master.test.ts`, containing **exactly one `test()` call and zero `describe`/`it` calls**. This is mechanically checkable and it is checked (see Verification): one `*.test.ts` file in the repo, one `test(` occurrence, no `describe(`, no `it(`, no `test.each`, no `test.for`, no second runner config with a wider glob. No unit tests for `core/*` (AC3).
- **The seam is the only mock** (AD-12): `buildApp({ extract })` receives a function returning a fixed `ExtractionResult`. Nothing else is stubbed — real Fastify, real routes, real pipeline, real arbiter, real Drizzle, real Postgres. No network, no OpenAI, no cost.
- **The fixture is a text-class HTML upload or URL-free path that needs no outbound fetch.** The run must reach `done` without the network — acquisition reads what the test provides, and the mocked `extract` returns the signals.
- **The mock's signals fire every rule** (AC2): T1 (an `inferred` allergen and a row with an empty list), T2 (a price with no unambiguous value), T3 (a non-EUR marker), T4 (a name absent from the source text), T5 (`self_flag`), T6 (a `declared` allergen whose quote is absent ⇒ downgraded to `inferred`), **and** one row with a verified quote, a clean price and a traceable name that stays `reliable`.
- **The golden is one committed file**; ids and timestamps are normalized out (or frozen), rows compared in `position` order. A rule regression must fail the assertion *naming the rule*, not just diffing a blob.
- **Folded into the same run's assertions** — these are claims about the payload the one test already produces, and each is a deferral this story owns: the evidence offsets slice back to the quoted substring (`acquired_text.slice(start, end)`), including one accented row; `price_value` and currency for each fixture price; the `GET /api/runs` list row for the same run (a second derivation of `state` / `dish_count` / `review_progress` the detail cannot see); one `confirm` and one `followup` with a note through `POST /api/runs/:id/reviews`, then a forged batch with an unknown `dish_id` asserting the 400 envelope **and** that neither decision applied.
- **CI (AC4):** the `checks` job gains a Postgres service container, exports a dummy `OPENAI_API_KEY` (the migration runner imports `env.ts`, whose fail-fast schema requires it), runs `db:migrate`, then `npm test`. `server/tsconfig.json`'s `include` widens to cover `test`.
- **DECISIONS.md gets the R8 argument**: why a golden-master over unit tests or a component test, what was folded in and why it is still one test, and the explicit list of behaviours that stay verified by logged manual runs — the SSRF refusal table, the adapter's retry/timeout/usage semantics (the seam is mocked *above* it), the env fail-fast branch, and the `saving` transaction's forced-failure rollback.
- Vitest is the only new dependency, dev-only, in the `server` workspace.

- **The schema-drift guard lands in CI** (ratified by Pablo at Checkpoint 1, 2026-08-22): `checks` runs `npm run -w server db:generate` followed by `git diff --exit-code server/drizzle`, so a `schema.ts` edit without a generated migration fails the build. It is a **check, not a test**, and DECISIONS.md must carry that argument in full — see Design Notes.

**Ask First:**
- A second test file or a second `test()`; mocking anything besides `extract`; a CI matrix; coverage thresholds.

**Never:**
- Unit tests for `core/*`; component or browser tests for `web/`; snapshot files beyond the one golden; a test that calls OpenAI; test-only branches in production code; loosening an assertion to make the suite pass (fix the code, or halt).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| The run | fixture POSTed, `extract` mocked | polls to `done` at stage `saving`; dish rows in `position` order | a run left `processing` fails the test with the last stage |
| Every rule | crafted signals | T1–T6 each appear in at least one row's `confidence_reasons`, asserted **by rule id** | a missing rule fails naming that rule |
| The reliable row | verified quote, clean price, traceable name | `confidence_reasons: []`, `flag: 'reliable'` | N/A |
| T6 downgrade | `declared` allergen, quote absent from the text | entry becomes `inferred`, `match: null`, T6 **and** T1 fire | N/A |
| Evidence offsets | the verified quote, one accented row | `acquired_text.slice(start, end)` equals the original quoted substring | N/A |
| Prices | the fixture's price strings | `price_value` + currency per row, not merely which rule fired | N/A |
| List derivation | `GET /api/runs` after completion | the fixture run's row matches the detail's `state`, `dish_count`, `review_progress` | N/A |
| Review round-trip | one `confirm`, one `followup` with a note | only review fields change; progress advances | N/A |
| Forged batch | one valid decision + one unknown `dish_id` | 400 envelope; **neither** decision applied | N/A |
| Golden drift | any payload change | the diff names the field | never edit the golden to match the code without understanding why |
| CI | the `checks` job | typecheck + migrate + the test, green against the service container | a missing `OPENAI_API_KEY` fails `db:migrate` before the test runs |

</frozen-after-approval>

## Code Map

- `server/src/app.ts:13` -- `buildApp(deps)` with `extract` **required** — the seam this test exists to use; `app.inject()` needs no port.
- `server/src/pipeline/extraction-adapter.ts:26-31` -- `ExtractFn` / `ExtractionResult` (`dishes: ModelDishSignal[]`, `attempts`, `usage`): the exact shape the mock returns.
- `server/src/pipeline/run-pipeline.ts` -- fire-and-forget from the route: the test must **poll** `GET /api/runs/:id` until `state !== 'processing'`, never `await` the pipeline.
- `server/src/routes/runs.ts` -- the four routes, the accept list, the 409 gate, and the review endpoint's 400 envelope.
- `server/src/core/run-state.ts` -- `toRunSummary` / `toRunDetail`: the one derivation both the list and the detail assertions cover.
- `server/src/db/migrate.ts`, `server/src/env.ts` -- the migration runner imports `env`, whose schema requires `OPENAI_API_KEY`; CI must export a dummy.
- `shared/src/run.ts`, `shared/src/dish.ts`, `shared/src/allergen.ts` -- the payload shape the golden freezes; `ruleIdSchema` is the T1–T6 enum the per-rule assertion iterates.
- `.github/workflows/ci.yml:37-45` -- the `checks` job to extend; its comment already says the golden joins here.
- `docker-compose.yml` -- Postgres already has a healthcheck (`up -d --wait` returns Healthy), so the CI service container mirrors it rather than inventing one.
- `_bmad-output/implementation-artifacts/deferred-work.md` -- twelve entries name this story; the spec's Boundaries say which fold in and which become a DECISIONS record.

## Tasks & Acceptance

**Execution:**
- [ ] `server/package.json` -- add `vitest` (dev) and a `test` script; root `package.json` gets a `test` script delegating to the workspace.
- [ ] `server/tsconfig.json` -- widen `include` to cover `test`.
- [ ] `server/test/fixtures/` -- the source text the run acquires and the mocked `ExtractionResult` whose signals fire T1–T6 with one clean row.
- [ ] `server/test/golden-master.test.ts` -- one `test()`: build, POST, poll, assert the normalized payload against the golden, assert each of T1–T6 by id, assert the offsets slice back, assert prices, assert the list row, run the review round-trip and the forged batch.
- [ ] `server/test/golden-master.json` -- the committed golden.
- [ ] `.github/workflows/ci.yml` -- Postgres service container, dummy `OPENAI_API_KEY`, `db:migrate`, `npm test`, and the schema-drift guard (`db:generate` then `git diff --exit-code server/drizzle`) as a step distinct from the test step, so a failure reads as "you changed the schema without a migration", never as a failing test.
- [ ] `DECISIONS.md` -- the R8 argument and the explicit manual-only list (SSRF table, adapter semantics, env fail-fast, forced-rollback atomicity).

**Acceptance Criteria:**
- Given `npm test` against a fresh migrated database, then Vitest's own summary reads **`1 passed (1)`** for tests — the runner's count, not a file count, is the evidence — and the repo-wide grep for `describe(`, `it(`, `test.each` and `test.for` returns nothing (AC1, AC3).
- Given the mocked signals, then each of T1–T6 appears in at least one row's `confidence_reasons` and one row has none; deleting any rule from `arbiter.ts` fails the test with that rule's id in the message (AC2).
- Given a deliberate mutation — change `Math.round(value * 100) / 100` to `Math.round(value)`, or replace the offset mapping with normalized indices — then the test fails; both are changes the story-1.6 acceptance criteria could not see.
- Given CI on this PR, then `checks` runs typecheck, migrations and the test against the Postgres service container and passes (AC4).
- Given the diff, then no production file gained a test-only branch, and nothing exists beyond the Tasks.

## Spec Change Log

- **2026-08-22, Checkpoint 1 (human renegotiation of a frozen Ask-First item).** Pablo ratified the schema-drift guard for CI and asked for the check-versus-test distinction to be argued rather than assumed. Moved from **Ask First** to **Always**, added as its own CI step and as a DECISIONS.md obligation. Known-bad state avoided: adding a second automated check while R8 caps the repo at one *test*, without a written basis for calling it something else.

## Design Notes

**Why a golden-master, and why one.** The brief asks for one meaningful test *and* the justification. The riskiest thing in this repo is not any single function — it is the seam-to-seam path: a contract shared by three workspaces, a fire-and-forget pipeline, a deterministic arbiter, and a transaction that must land dishes and the terminal status together. A unit test on `parsePrice` proves the least interesting part; a golden-master over the whole path is the one test that fails when any of it drifts. That argument goes in DECISIONS.md, because the brief asks for it in writing.

**One test, not one assertion.** R8 bounds the *number of tests*, not the number of things the one test may observe about the run it drives. The folded assertions all describe the same fixture run's payload. The line holds where a claim would need its own fixture, its own entry point or its own failure injection — the SSRF table, the adapter's retry semantics, the env fail-fast branch and the forced-rollback are all in that category, so they stay manual with the reasoning recorded rather than quietly dropped.

**A check is not a test, and the difference is not semantics.** A test executes the system and asserts something about its behaviour: it needs a fixture, an entry point, and a claim that can be right or wrong about a running program. The drift guard runs no application code and has no fixture. It regenerates a migration from `schema.ts` and asserts that two **committed artifacts agree with each other** — nothing more. It can fail for exactly one reason: someone edited the schema without generating the migration. That is the same category as `tsc --noEmit`, which nobody would call a test and which has sat in `checks` since story 1.1 without anyone claiming the repo has two tests. R8 caps the number of automated tests because a candidate who writes forty of them is answering a different question than the one asked; it does not forbid the build from checking its own consistency. The risk is concrete rather than theoretical: a schema edit without a migration leaves a fresh clone booting against a database that does not match the code — and a timed fresh-clone run by the reviewer is exactly how this repo gets evaluated. The guard is one step and it names its own failure. If the distinction ever stops being defensible, the honest move is to delete the guard, not to redefine "test".

**The golden must accuse, not just differ.** A blob diff tells you something changed. Asserting each fired rule by id means a regression says *which* rule stopped firing — the property story 1.6's review showed to be load-bearing, since flags, counts and status stay identical while the evidence offsets silently rot.

## Verification

**Commands:**
- `npm test` -- expected: one test, green, against the local Postgres on 5433.
- `npm test` (or `npm test -w server -- --reporter=verbose`) -- expected: the summary line reads `Tests  1 passed (1)`. Run it through the workspace script: a bare `npx vitest run` from the repo root skips `server/vitest.config.ts` and the env setup, and fails in `db/client.ts` before any test loads. **This is the AC3 evidence**: Vitest counts what actually ran, so a suite hidden behind `describe`, `test.each` or a second file cannot pass it.
- `find . -name "*.test.ts" -o -name "*.spec.ts" | grep -v node_modules | wc -l` -- expected: `1`.
- `grep -rnE "\b(describe|it|test\.each|test\.for)\s*\(" server/test` -- expected: no matches.
- `grep -rcE "\btest\s*\(" server/test/golden-master.test.ts` -- expected: `1`.
- `npm run typecheck` -- expected: green in all three workspaces, now including `server/test`.
- Mutation checks (revert each): drop T4 from `arbiter.ts`; change the price rounding; replace the offset mapping with normalized indices -- expected: the test fails, and the message names the rule or the field.
- `npm run -w server db:generate` then `git diff --exit-code server/drizzle` -- expected: clean, and a deliberate `schema.ts` edit makes it fail with a non-zero exit naming the generated file.
- `gh pr checks` -- expected: `checks` and `secret-scan` both pass, with the test running against the service container.
