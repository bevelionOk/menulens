---
title: 'M1 — Submit, Watch, Review (stories 1.7 + 2.1 + 2.2, history folded)'
type: 'feature'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: '0a94f317d4b961fa507997dfe5e4a87947683e07'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/DECISIONS.md (D24 — the scope cut this story implements)'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The backend extracts, triages and persists — and nobody can see any of it. `web/src/App.tsx` is `<main>MenuLens</main>`. The brief's other half ("shown in a clean UI") is unbuilt, and with it the product's thesis: Ana's verdict is the deliverable.

**Approach:** One deliverable (D24) instead of three stories. Two routes: `/` submits a URL or file and lists recent runs; `/runs/:id` watches an active run in honest language and, once `done`, is the review table — flags, fired rules, allergen provenance, and per-row confirm / mark-for-follow-up posting through one new endpoint. Server gains exactly two routes: `GET /api/runs` (the list) and `POST /api/runs/:id/reviews` (the batch verdict). Story 1.7's AC8 throwaway table is cut; story 3.1's `/history` page becomes a section of `/`.

## Boundaries & Constraints

**Always:**
- **Two new server routes, no more.** `GET /api/runs` returns `runListResponseSchema` newest first and **never selects artifact `bytes`**; `POST /api/runs/:id/reviews` takes `reviewRequestSchema` (a batch of `{dish_id, action, note}`) and applies **all decisions in one transaction** — an unknown `dish_id` or an invalid action returns a 4xx envelope with nothing applied (2.1 AC1/AC6). Only `review_status`, `followup_note`, `reviewed_at` are ever written; extracted values are immutable (2.1 AC2). No DELETE anywhere, no other mutation route (2.1 AC5).
- **Nothing derived is stored.** Done-ness and "N of M resolved" come from `toRunDetail`, which already computes them (2.1 AC4, 3.1 AC1). The list reuses the same derivation.
- **Server state lives only in TanStack Query.** `refetchInterval` while `state === 'processing'`, stopped on any terminal state. No `useEffect` polling loops, no client cache of run rows, no state library (AR26–AR27).
- **Honest waiting (FR4–FR5).** Stage copy: `fetching_source` → "Reading the menu", `extracting` → "The model is reading it — this is the slow part", `validating` + `saving` → one finishing beat ("Checking and saving"). A **measured** elapsed timer counted from `created_at`. **No percentage bar, no dynamic ETA, no lone spinner.** The static expectation copy states what was actually measured, not the epics' pre-measurement guess.
- **Every failure state is actionable (FR33, FG6).** E1 malformed URL caught inline before POST; E4 `.heic` handled by the accept list (`image/jpeg,image/png,image/webp,application/pdf` — never `image/heic`) plus the server's copy; E5 the 10 MB cap stated; E2/E3 (`unreachable_url`, `no_usable_text`) suggest the PDF/photo path; E7 (`model_*`) shows the reason with retry; E8 `interrupted` shows "interrupted — retry available"; E9 `empty` shows "I couldn't find dishes in this source — is it a menu? Try another path." — **distinct from failure**, never a mute zero-row table. No silent dead end.
- **Retry creates a new run (FR8)** through the existing POST, from either page; the old run is untouched.
- **The submit control is disabled while a run is active** — the UI mirrors the server's 409, which owns the truth (FR35). A 409 response is surfaced, not swallowed.
- **Review table copy (2.2).** Flag reads "auto-checked" / "needs review" — never "safe" or "verified". Allergen badges distinguish `declared` from `inferred`; an empty allergen list renders as a distinct dish-level "unknown", not as blank. A `generated` description carries a visible label. Every `uncertain` row renders its `confidence_reasons` details and any evidence quotes inline. The disclaimer "AI-extracted — verify before publishing" is always visible on the review screen. **No inline editing affordance anywhere** (FR28).
- **Stack:** React 19 + Vite + Tailwind v4 + stock shadcn components (already scaffolded: `components.json`, `lib/utils.ts`, the CSS layer). Two new web dependencies only: `@tanstack/react-query` and `react-router`.
- Server code stays in its existing shape: routes call repositories, repositories own SQL, `core` stays pure.

**Ask First:**
- Any third web dependency; any new table, column, enum value or env var; a `/history` route (D24 folded it into `/`); pagination, search or filters; optimistic updates that could show a verdict the server did not persist.

**Never:**
- Editing extracted values; a DELETE route; storing derived state; the evidence panel with source highlighting (story 2.4, cut — D24); batch selection or the menu-level honesty notice (story 2.3, cut — D24); tests (R8 — story 1.8 owns the one test).
- **A reopen affordance in the UI.** The endpoint accepts `reopen` because 2.1 AC1's contract note keeps the action enum whole ("the endpoint implements the full AD-9 action enum — `reopen` included"), and that same note assigns the *UI affordance* to story 2.3 as P1 — which D24 cut. Server yes, button no; the README records it as a known limitation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Submit URL | valid `https://…` | 201 → navigate to `/runs/:id`, polling starts | 409 → "a run is already processing", submit stays disabled |
| Submit malformed URL | `notaurl` | inline error before POST (E1); no request sent | N/A |
| Submit `.heic` | file picker | not selectable via accept list; a renamed one gets the server's 415 copy (E4) | envelope message shown verbatim |
| Submit > 10 MB | 11 MB PDF | 413 envelope, cap stated (E5) | N/A |
| Active run | `state: processing`, `stage: extracting` | stage copy + measured elapsed; submit disabled; no bar, no ETA, no lone spinner | poll error → keep last state, show "reconnecting" |
| Interrupted | `state: interrupted` (derived) | "interrupted — retry available" + retry (E8) | N/A |
| Failed | `state: failed`, `failure_reason: no_usable_text` | reason in plain language + the PDF/photo suggestion + retry (E3/E7) | N/A |
| Empty | `state: empty` | E9 copy, distinct from failure; retry offered | never a zero-row table |
| Done | 11 dishes, 4 `reliable` | review table: name, price raw + value, `generated` label where applicable, allergen badges by provenance, "auto-checked"/"needs review", reasons inline on uncertain rows | N/A |
| Confirm a row | click confirm | POST batch-of-one → row shows resolved; "N of M resolved" advances | 4xx → row reverts, message shown |
| Mark for follow-up | click + optional note | note persists; copy is "mark for follow-up", never a dead end | N/A |
| All rows resolved | every `review_status !== 'pending'` | menu shows done — **server-derived**; uncertain rows may be part of a done menu | N/A |
| Unknown dish id | forged request | 4xx envelope, **nothing applied** (transaction) | N/A |
| Recent runs | 5 prior runs | newest first: date, source, state, dish count, "N of M resolved"; deep-links to `/runs/:id`; retry on failed/interrupted | first visit → "no extractions yet" + pointer to the form |

</frozen-after-approval>

## Code Map

**Server — what to reuse, not rebuild:**
- `server/src/db/runs-repo.ts:72` -- `listRuns()` **already exists and has zero callers**; it selects run columns only (never `bytes`). Needs a dish aggregate (count + resolved count) joined per run — one grouped query, not N+1.
- `server/src/core/run-state.ts:41` -- `toRunDetail(run, dishes, now, staleAfterMs)` already derives `state`, `dish_count` and `review_progress`. The list reuses the same derivation with a count-shaped input (`DishRowLike` is just `{ review_status }`, so an array of that shape suffices).
- `server/src/routes/runs.ts:94-102` -- the `GET /api/runs/:id` handler is the pattern to copy: UUID guard → repo → `toRunDetail`. `ApiError(status, code, message)` from `server/src/errors.ts` is the only way to emit an envelope.
- `server/src/db/schema.ts` -- `dishes.review_status` (default `'pending'`), `followup_note`, `reviewed_at` already exist. **No migration.**
- `shared/src/api.ts:38-52` -- `runListResponseSchema` and `reviewRequestSchema` already written, unused. `shared/src/enums.ts:77,81` -- `reviewStatusSchema` (`pending|confirmed|followup`), `reviewActionSchema` (`confirm|followup|reopen`).
- `server/src/db/client.ts` -- `db.transaction(async (tx) => …)`; `Db | Tx` is the repository parameter convention.

**Web — the scaffold that exists:**
- `web/src/main.tsx` -- mounts `<App/>` in `StrictMode`; add the router and `QueryClientProvider` here.
- `web/src/App.tsx` -- 5-line placeholder to replace with the route table (`/` and `/runs/:id`).
- `web/components.json` -- shadcn configured (`style: base-nova`, neutral, `@/components/ui`, lucide icons); `web/src/lib/utils.ts` has `cn`. `web/src/index.css` carries the Tailwind v4 + shadcn CSS layer.
- `web/vite.config.ts:16` -- `/api` proxies to `http://localhost:3000`; the `@` alias points at `src`.
- `shared/src/run.ts` -- `RunDetail` / `RunSummary` are the wire types; import them as types from `shared` (the web workspace has not imported `shared` before — it is a TS-source workspace dependency, already in the monorepo).

**Read-only constraints:** epics stories 1.7 (AC1–AC7), 2.1, 2.2 and 3.1; PRD E1–E9 table (`prds/…/prd.md:297-305`); `DECISIONS.md` D24 (what is cut) and D14 (description provenance); `plan/production-breaks.md` B1 (the 409 race).

## Tasks & Acceptance

**Execution:**
- [x] `server/src/db/runs-repo.ts` -- `listRunsWithCounts()`: `listRuns()` plus a grouped dish aggregate (`count(*)`, `count(*) filter (where review_status <> 'pending')`) keyed by `run_id`; and `applyReviews(tx, runId, decisions)` writing only `review_status` / `followup_note` / `reviewed_at`, returning the number of rows matched so an unknown `dish_id` can fail the transaction.
- [x] `server/src/routes/runs.ts` -- `GET /api/runs` → `{ runs: [...] }` newest first, each row through the same derivation as the detail route. `POST /api/runs/:id/reviews` → parse with `reviewRequestSchema`, 404 on unknown run, one transaction, 4xx envelope + full rollback if any `dish_id` misses; returns the updated `RunDetail`.
- [x] `web/package.json` -- add `@tanstack/react-query` and `react-router`. Nothing else.
- [x] `web/src/main.tsx`, `web/src/App.tsx` -- `QueryClientProvider` + router with `/` and `/runs/:id`.
- [x] `web/src/lib/api.ts` -- one typed client: `createRun`, `getRun`, `listRuns`, `postReviews`; parses the error envelope and throws a typed error carrying `code` + `message`.
- [x] `web/src/routes/submit.tsx` -- URL field with inline validation (E1), file input with the accept list, submit disabled while any run is active (mirrors 409), and the recent-runs list (date, source, state, dish count, "N of M resolved", deep-link, retry on failed/interrupted, "no extractions yet" empty state).
- [x] `web/src/routes/run.tsx` -- polling via `refetchInterval` while active; stage copy + measured elapsed timer; one branch per terminal state (E2/E3/E7/E8/E9) with actionable copy and retry; and the review table with per-row confirm / mark-for-follow-up.
- [x] `web/src/components/` -- the shadcn components actually used (button, input, table, badge, card, alert-ish) and the small presentational pieces: allergen badge (provenance-aware, dish-level unknown), flag badge ("auto-checked" / "needs review"), reasons list, disclaimer.

**Acceptance Criteria:**
- Given `/` with no runs, then "no extractions yet" shows with a pointer to the form; given prior runs, they list newest first with state, dish count and "N of M resolved", each deep-linking to `/runs/:id` (3.1 AC1–AC3).
- Given a submitted URL, then the UI navigates to `/runs/:id`, polls only while active, shows the stage in honest language with a measured elapsed timer, and contains no percentage bar, dynamic ETA or lone spinner anywhere in the source (1.7 AC2–AC4).
- Given each of E1, E4, E5, E2/E3, E7, E8, E9 reproduced through the real API, then each renders its own actionable copy with retry where applicable, and `empty` is visibly distinct from `failed` (1.7 AC1, AC6, AC7).
- Given a `done` run, then every dish row shows name, price raw + parsed value, description with a `generated` label where applicable, allergen badges distinguishing `declared` from `inferred` with dish-level unknown rendered distinctly, and the flag as "auto-checked"/"needs review"; every `uncertain` row shows its fired rules and evidence quotes inline; the disclaimer is visible; no inline-edit affordance exists (2.2 AC1, AC2, AC4, AC6).
- Given a confirm and a follow-up (with a note) posted from the UI, then `psql` shows only `review_status` / `followup_note` / `reviewed_at` changed on those rows, "N of M resolved" advances, and a forged batch with one unknown `dish_id` applies **nothing** (2.1 AC1–AC3, AC6; 2.2 AC3, AC5).
- Given the route table after this story, then exactly four API routes exist (`POST /api/runs`, `GET /api/runs`, `GET /api/runs/:id`, `POST /api/runs/:id/reviews`) and no DELETE (2.1 AC5).
- Given the diff, `npm run typecheck` is green in all three workspaces and `web/package.json` has exactly two added dependencies.

## Spec Change Log

## Design Notes

**Why one story.** 2.2's AC3 already says its action "posts through Story 2.1's endpoint" — one wire described twice — and 2.1's AC4 is code that shipped in 1.3. Building 1.7's AC8 table on 22 August to delete it on the 23rd is a luxury of a longer schedule. D24 records the merge.

**The expectation copy is a measurement, not a guess.** The epics wrote "typically 30–90 s" before anything ran. Six real runs on `gpt-5.6-luna` measured **~9–12 s end to end** (`elapsed_ms` in the model-usage log line). Shipping the higher number would be dishonest in the direction the whole product argues against, so the copy states the measured range and the page says the model stage is the long part. This is the story's one P1 acceptance criterion and it is satisfied by telling the truth.

**Polling belongs to the server's state, not a timer.** `refetchInterval` is a function of the query's own data: a poll interval while `state === 'processing'`, `false` otherwise. The run stops polling itself; no component needs to remember to stop.

**Two lanes, disjoint files, parallel.** They share only `shared/src/api.ts`, which is already written and needs no change.
- **Server lane** — the first two tasks: `server/src/db/runs-repo.ts` and `server/src/routes/runs.ts`. Touches nothing under `web/`.
- **Web lane** — every remaining task: `web/package.json`, `web/src/**`. Touches nothing under `server/` or `shared/`. It codes against the contract in `shared/src/api.ts` and `shared/src/run.ts`, which already describe both new endpoints exactly, so it never waits for the server lane.

**Post-review amendments (3 layers, ~50 raw findings → 30 unique: 14 patched / 9 deferred / 7 rejected):** the review write path took four: a `confirm` carrying a note used to persist it (and to leave a stale note behind on a row that already had one), so a "confirmed" badge could sit above follow-up text; `decisions: []` opened a transaction, matched 0 of 0, logged `reviews applied` and returned 200 — a no-op reported as a review, with a lying log line; the batch and the note were both unbounded on an unauthenticated POST (now 200 decisions and 2000 characters, the caps exported so the error copy names the real numbers); and `countShaped` fabricated an array of fake dish rows per run on every 2-second poll, labelling every resolved row `confirmed` even when it was `followup` — replaced by a real count-based `toRunSummary`, so list and detail now share one derivation instead of sharing it by accident. On the web: an unreadable 2xx threw a raw `SyntaxError` past the `ApiClientError` narrowing and left the form silently re-enabled — the exact dead end FG6 forbids; `interrupted` was treated as terminal though the server explicitly lets a stale run finish, so a completed run showed "interrupted" until a manual reload; `INTERRUPTED_COPY` claimed "Nothing partial was saved", which the server cannot back; and a state the bundle does not know rendered a header over an empty page. Plus label fallbacks, indexed allergen keys, honest copy for an uncertain row with no recorded reasons, a trimmed `price_raw` test, pending labels on both submit buttons, a 10 MB client-side check that no longer streams the file to earn a knowable 413, and the note textarea capped to match the schema. Deferred (9), two of them story 1.8's: the golden-master must also pin the list derivation and the review write path — deleting `eq(dishes.run_id, runId)` lets a verdict be written across run boundaries with `matched` still equal to the batch size, and nothing the test was specified to assert would see it. Rejected under the guard: pagination (Ask-First; B19), a single-transaction list read (B20), a `status !== 'done'` guard (dishes do not exist until the saving transaction commits), response-schema validation, auth and rate limiting (B24), an undo affordance (D24 cut it), filters and sorting over the table.

**Deviation from an acceptance criterion, recorded rather than argued away:** the Boundaries say "two new web dependencies only" and the final acceptance criterion says `web/package.json` has exactly two added dependencies. It has three entries — `@tanstack/react-query`, `react-router`, and `shared`. The third is the sibling workspace whose imports are all `import type` and are erased at build; `server/package.json` has always declared it the same way, and leaving it undeclared meant resolving through the workspaces root symlink alone. The cap was meant to bound third-party surface, and it holds. The letter of the AC does not, so it is written here instead of quietly satisfied.

**Measured:** 1,692 lines across 24 files. A real run through the UI on `gpt-5.6-luna`: 11 dishes, honest stages with a measured timer, 6 `reliable` / 5 `uncertain`. Confirming rows from the browser left the md5 over every extracted column byte-identical — the same hash measured before the first review write, unchanged across every write since. A forged batch (one valid decision, one unknown `dish_id`) returned 400 and applied **neither**.

## Suggested Review Order

**The two new routes (2.1)**

- One derivation for list and detail — a count-based summary, no fabricated rows.
  [`run-state.ts`](../../server/src/core/run-state.ts)
  [`runs.ts`](../../server/src/routes/runs.ts)

- The batch verdict: one transaction, and a matched-count mismatch rolls back everything.
  [`runs-repo.ts`](../../server/src/db/runs-repo.ts)

- Only review columns are ever in the `set`, and `confirm` never carries a note.
  [`runs-repo.ts`](../../server/src/db/runs-repo.ts)

**Honest waiting (1.7)**

- Polling is a function of server state, not a timer the component has to remember to stop — and `interrupted` keeps polling, because the server lets a stale run finish.
  [`run.tsx`](../../web/src/routes/run.tsx)

- Every user-facing string in one auditable file: stages, failures, the empty state, the measured expectation.
  [`copy.ts`](../../web/src/lib/copy.ts)

- No response is unreadable and no error is silent — including a state this bundle does not know.
  [`api.ts`](../../web/src/lib/api.ts)
  [`run.tsx`](../../web/src/routes/run.tsx)

**The review screen (2.2)**

- "auto-checked" / "needs review", never "safe"; provenance on every allergen badge; dish-level unknown rendered distinctly.
  [`review-table.tsx`](../../web/src/components/review-table.tsx)
  [`allergen-badges.tsx`](../../web/src/components/allergen-badges.tsx)

- The fired rules, inline, with their recorded detail — and honest copy when an uncertain row has none.
  [`reasons-list.tsx`](../../web/src/components/reasons-list.tsx)

**History, folded into `/` (3.1)**

- Recent runs with derived state, counts and progress; retry; and the submit lock that mirrors the server's 409.
  [`submit.tsx`](../../web/src/routes/submit.tsx)

**Peripherals**

- Nine deferrals (two are what 1.8's golden must additionally pin) and production rows B19–B27.
  [`deferred-work.md`](deferred-work.md)
  [`production-breaks.md`](../../plan/production-breaks.md)

## Verification

**Commands:**
- `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `docker compose … up -d --wait` + `db:migrate` + `PORT=3100 npm run -w server dev` + `npm run dev -w web` -- expected: both up.
- Real submit of the Spanish fixture menu through the UI -- expected: navigation, stage copy, measured timer, then the review table with 4 auto-checked rows and reasons on the rest.
- Confirm one row and follow-up another with a note; `psql`: `select review_status, followup_note, reviewed_at from dishes where run_id=…` -- expected: only those three columns changed; `GET /api/runs` shows "2 of 11 resolved".
- `curl` a review batch with one bogus `dish_id` -- expected: 4xx envelope, and `select count(*) from dishes where review_status <> 'pending'` unchanged.
- Reproduce E1/E4/E5/E2/E3/E7/E8/E9 -- expected: each renders its own copy; `empty` is not styled as a failure.
- `grep -rnE "(<Spinner|animate-spin|role=\"progressbar\"|<Progress|estimated|remaining|ETA )" web/src` -- expected: no matches. (The original form of this check — `spinner|progress-?bar|eta|%` — was written before the UI existed and now returns ~20 false positives: Tailwind column widths like `w-[32%]`, the substring "eta" inside `detail`/`RunDetail`, and `oklch` alpha values. A check that cannot separate a violation from noise is not a check.)
