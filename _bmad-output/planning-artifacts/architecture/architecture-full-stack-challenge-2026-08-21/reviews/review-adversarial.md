# Adversarial Review — ARCHITECTURE-SPINE.md

- **Target:** `ARCHITECTURE-SPINE.md` (architecture-full-stack-challenge-2026-08-21)
- **Method:** construct pairs of story-level units that each obey every AD and convention to the letter yet build incompatibly. Only holes plausibly hit by THIS build (two builders cutting epics from one spine) are listed; theoretical holes a solo build can't reach were discarded.
- **Date:** 2026-08-21
- **Verdict: pass-with-fixes.** The spine's load-bearing choices (persist-first, pure core, one seam, shared-owns-contract) are sound and most classic divergence points are already pinned. But the run read-model, the review contract, and the T6 matching function each have a concrete two-compliant-builders failure mode that will bite during integration of separately built epics. Seven holes, ranked; the first five are the ones that matter.

---

## Hole 1 (HIGH) — The run read-model is undefined: `stage` vs `status`, and where dishes travel

Every epic consumes `GET /api/runs/:id` (submit page polls it, review screen renders it, history links into it, the golden asserts it), yet the spine never defines what it returns — and the ER diagram quietly declares **both** a `stage` and a `status` column with no split of duties.

**Compliant construction A (pipeline epic):** `stage` is the progress enum (`fetching_source…saving`), `status` is a second persisted column written once at the end (`done | failed | empty`). Mid-run, `GET /api/runs/:id` returns the run row only; dishes are "artifact-isolated" reads the review epic should fetch elsewhere. Obeys AD-4, AD-8.

**Compliant construction B (review/history epic):** reads AD-5 ("derived state is computed at read, never stored") and FR29's state list (`processing / interrupted / failed / done / empty`) and expects a single **derived** `status` in the payload — including `interrupted` — plus `dishes: [...]` inline, because the conventions route table contains no `/api/dishes`-list route to fetch them from. Obeys AD-5 and the conventions table.

Result: A stores a status column B believes must not exist (AD-5 arguably forbids it — `done` for a menu *is* listed as derived); B expects dishes and `interrupted` in a payload A never puts them in. Also unpinned: what the polling GET returns **mid-run** (dishes absent? empty array?) and which endpoint's payload the golden freezes.

**Fix (tighten AD-4 + AD-5, amend ER):**
> Drop the `status` column from `runs` — the only persisted lifecycle field is `stage` (`fetching_source | extracting | validating | saving | done | failed | empty`) plus `failure_reason` and a `last_transition_at` timestamptz. `status` is **derived at read, never stored**: `done|failed|empty` map from terminal stage; otherwise `interrupted` when `now − last_transition_at >` threshold, else `processing`. `GET /api/runs/:id` returns the single Run resource defined in `shared`: run fields + derived `status` + `review_progress {resolved, total}` + `dishes: Dish[]` (always present; `[]` until `saving` completes). `GET /api/runs` returns the same shape minus `dishes` and minus artifact text. The golden-master (AD-13) asserts the final `GET /api/runs/:id` payload — no other endpoint.

## Hole 2 (HIGH) — "Active" is undefined: the crashed-run 409 deadlock

AD-10: "while a run is active, `POST /api/runs` returns 409." AD-14 admits a run can die with nothing persisted (Postgres-down / process crash), caught only by the staleness net **at read**.

**Compliant construction A (server epic):** active = `stage` is non-terminal. A run that crashed mid-`extracting` stays non-terminal forever ⇒ every subsequent `POST /api/runs` — including the retry — returns 409 **permanently**. Fully obeys AD-10.

**Compliant construction B (web epic):** per FR8/FR30, the UI shows "interrupted — retry available" after 3 minutes and enables the submit/retry control (AD-10 says the UI "mirrors" server state, and the derived status *is* `interrupted`, not `processing`). Ana clicks retry; the server 409s; the app is wedged with no recovery path and no delete endpoint (AD-9) to clear it.

**Fix (tighten AD-10):**
> *Active* is defined as: `stage` non-terminal **and** `now − last_transition_at ≤` the staleness threshold. An interrupted run is not active; retrying it is always accepted. The 409 body uses the error envelope with code `run_active` and includes the active run's id.

## Hole 3 (HIGH) — The review contract: is the route table exhaustive, and what does batch mean on the wire?

Conventions pin exactly four routes, including per-dish `/api/dishes/:id/review`. FR22/FR26 mandate **batch** resolution ("confirm all auto-checked", free multi-row selection). The spine never says whether the route list is exhaustive, never names the HTTP verb, and never shapes the payload.

**Compliant construction A (server epic):** treats the table as illustrative (nothing says otherwise), ships `POST /api/runs/:id/review` accepting `{dish_ids: [...], action: 'confirm' | 'followup', note?}` because FR26's one-click batch "obviously" wants one atomic call. Obeys every AD.

**Compliant construction B (web epic):** treats the table as the contract, implements batch as a fan-out of `PATCH /api/dishes/:id/review` with `{review_status: 'confirmed'}` per row. Obeys every AD.

Result: 404s or two overlapping mutation paths for the same rows (AD-9's "review mutates verdicts" now has two owners). Sub-ambiguities with the same shape: verb (PUT/PATCH/POST all "comply"); payload spelling (`action` vs `status` vs `review_status`); and FR27 reopen — is it a third action, a `status: 'pending'`, or (someone will try) a DELETE that AD-9 forbids? Does reopening clear the note and timestamp?

**Fix (new convention row):**
> The conventions route table is **exhaustive** — no other `/api` routes exist. Review mutation: `PUT /api/dishes/:id/review`, body (Zod in `shared`) `{ status: 'confirmed' | 'followup' | 'pending', note?: string }`. `note` is only valid with `followup`; `pending` reopens the row and clears `followup_note` and `decided_at`; otherwise `decided_at` is set server-side. Batch actions (FR26) are a client-side fan-out of per-dish PUTs — idempotent, order-free, no batch route. "Done" and review progress remain read-derived (AD-5).

## Hole 4 (HIGH) — T6 matching has two forced implementers, and the pinned normalization order is a no-op reading

Two independent problems that multiply:

**(a) Structural: the web must reimplement the match.** AD-3 puts T6 verification in `server/src/core/`; the dependency rule says web imports only `shared`. But FR23 requires the web to render "the extracted source text with **T6-verified quotes highlighted**" — i.e., to *find the quote in the source text again*. The web builder literally cannot import the core function, so a second matcher gets written from the AD-7 prose. Any divergence (see (b), or plain substring-vs-token matching, or raw-vs-normalized search for computing highlight offsets) yields the worst UI outcome: a quote the server verified that the panel fails to highlight — the evidence panel visibly disagreeing with the flag it explains.

**(b) The pinned order is ambiguous at the letter.** "NFKC → lowercase → collapse whitespace → strip diacritics": after NFKC, `é` is the *composed* code point U+00E9 with no combining mark present. Builder A implements step 4 as "remove combining marks" (`/\p{M}/gu` → removes nothing; `crème` ≠ `creme`); Builder B knows the idiom and interposes NFD first (`crème` → `creme`). Both followed the four steps in the stated order. On a Spanish menu ("crustáceos", "frutos de cáscara") this is not an edge case — it decides whether T6 downgrades fire at all, i.e., different flags on identical data, the exact failure AD-7 exists to prevent. Also unpinned: does "collapse whitespace" include newlines and trimming, and is the comparison substring containment or equality?

**Fix (tighten AD-7 + AD-8):**
> T6 normalization, exactly: (1) Unicode NFKC; (2) lowercase; (3) NFD then remove all code points in Unicode category M (this *is* "strip diacritics" — it is only defined after decomposition); (4) replace every maximal run of Unicode whitespace (newlines included) with one space; trim ends. Verification = the normalized quote is a **substring** of the normalized source text. This function has exactly one implementation and the web never re-matches: at verification time the server maps each verified quote back to its **raw-text character span** and persists `[start, end)` offsets with the allergen's evidence in the dish row; the FR23 panel highlights those persisted spans and computes nothing.

## Hole 5 (MED-HIGH) — The failure_reason enum: membership, spelling, and the E6 contradiction

AD-14 and the error-envelope convention both defer to "the `shared` enum mapping the PRD's E-states" — but the spine never lists its members, and the two source documents disagree.

**Compliant construction A (shared/enum author):** transcribes the PRD's FG6 table: nine literal codes `E1`–`E9`, E6 included, all storable in `failure_reason`. **Compliant construction B (pipeline author):** per AD-6 "E6 is eliminated", ships a pipeline that can never emit E6 and treats scanned PDFs as successful `visual` runs; also never *stores* E1/E4/E5 (those reject pre-run as HTTP 400s — no run row exists) nor E8 (derived, AD-5) nor E9 (that's stage `empty`, "distinct from failure" per the PRD). Now the frontend's switch statement, built against A's enum, has dead branches and — worse — no agreement on spelling (`'E2'` vs `'unreachable_url'`): both are "codes from the shared failure-reason enum."

**Fix (add to AD-14):**
> The `shared` enum's members, verbatim and closed: **request-reject codes** (HTTP 400, never stored — no run exists): `invalid_url` (E1), `unsupported_type` (E4), `file_too_large` (E5). **Storable `failure_reason`** (run ends `failed`): `source_unreachable` (E2), `no_usable_text` (E3), `model_failure` (E7). **Never codes:** E6 does not exist (scanned PDFs are `visual`-class successes, AD-6); E8 is the derived status `interrupted` (never stored, Hole 1); E9 is terminal stage `empty` (not a failure). Snake_case names are the wire truth; `E*` numbers are documentation aliases only. Error-envelope `code` and stored `failure_reason` draw from this one enum.

## Hole 6 (MED) — The artifact endpoint for URL runs, and how `acquired_text` travels

The ER pins `source_artifacts` strictly 1:1 with runs (`||--||`) holding "uploaded bytes + acquired text"; `/api/runs/:id/artifact` serves "artifact bytes." URL runs have no uploaded bytes — and FR23 says URL sources show an *external link*, not embedded bytes.

**Compliant construction A (pipeline epic):** honors 1:1 by storing the **fetched HTML as `bytes`** and serving it from `/artifact` with its content-type — same-origin delivery of arbitrary fetched HTML (a stored-XSS door AD-8's `nosniff` does not close, since the declared type *is* `text/html`). **Compliant construction B (web epic):** per FR23 renders an external link for URL runs and treats `/artifact` as 404-normal — while sourcing the "what the system read" tab by fetching `/artifact?text=1` or expecting `acquired_text` inline in the run payload; the spine pins neither transport. Two epics, four combinations, one of them a security hole.

**Fix (tighten AD-8):**
> A `source_artifacts` row exists for every run; `bytes`/`content_type` are null for URL sources. `/api/runs/:id/artifact` serves **upload bytes only**, MIME allow-list `application/pdf, image/jpeg, image/png, image/webp` — never `text/html` or fetched web content; for URL runs it returns 404 with envelope code `artifact_not_available` and the UI shows FR23's external link. `acquired_text` travels **inline on the run detail payload** (it feeds the FR23 tab and Hole-4 highlighting), never through the artifact endpoint. List queries continue to touch neither column.

## Hole 7 (MED) — Dish ordering: nobody owns it, and the golden's "stable ordering" hides that

No AD or column gives dishes an order. UUIDs are random; same-transaction `created_at` ties.

**Compliant construction A (pipeline epic):** inserts dishes in model output order with no position column. **Compliant construction B (review/history epic):** needs *some* deterministic order for the table and sorts by name — destroying menu order, which review depends on (evidence-matching against the original, and FR11 variant rows sitting together). Meanwhile AD-13's "stable ordering" invites the test author to sort the payload inside the test, which makes the golden green while the two epics still disagree in the UI.

**Fix (amend AD-8 + AD-13):**
> `dishes` carries `position` (integer, 0-based extraction order, source order preserved; FR11 variant rows adjacent). Every read orders by `position`; the golden asserts `position` values and performs **no sorting of its own** — "stable ordering" means the API's ordering is already deterministic.

---

## Notes on attacks that did NOT land (checked and dismissed)

- **`source_class` ownership:** the ER pins it as a stored `runs` column, AD-6 pins the decision to one moment ("classified once", by ground text after fetch) and AD-3 pins the decision function to core. The only residual — that AD-5 could be misread as forbidding storing it — is closed as a side effect of Hole 1's wording (AD-5's derived set becomes the explicit list: `status`, menu `done`, review progress). No separate fix needed.
- **Two computers of `price_value`:** FR10 + AD-3 place parsing in core and T2 reads the stored emptiness; the web renders `price_raw`. No compliant second owner found.
- **Mock/real divergence at the OpenAI seam:** AD-12's single injected adapter plus AD-13's mocking *at that seam* closes the classic hole where the mock bypasses validation. Held up under attack.
- **Polling cadence/backoff divergence:** TanStack `refetchInterval` while active is pinned; the exact interval is UI-local with no cross-unit coupling. Not a spine matter.

## Summary of required wording changes

| Hole | Where | Change |
| --- | --- | --- |
| 1 | AD-4/AD-5 + ER | Drop `status` column; add `last_transition_at`; define the one Run resource (derived `status`, inline `dishes`, `review_progress`); golden targets `GET /api/runs/:id` |
| 2 | AD-10 | Define *active* (non-terminal AND not stale); interrupted runs never 409; envelope code `run_active` |
| 3 | Conventions | Route table declared exhaustive; `PUT /api/dishes/:id/review` `{status, note?}`; `pending` = reopen; batch = client fan-out |
| 4 | AD-7/AD-8 | Exact normalization (NFD before mark-stripping), substring semantics; server persists verified-quote raw spans; web never re-matches |
| 5 | AD-14 | Enumerate the enum: 3 request-reject codes, 3 storable reasons; E6 nonexistent, E8 derived, E9 = `empty`; snake_case names are wire truth |
| 6 | AD-8 | Artifact row 1:1 with null bytes for URLs; endpoint = upload bytes only, MIME allow-list, never `text/html`; `acquired_text` inline on run detail |
| 7 | AD-8/AD-13 | `dishes.position` column; all reads ordered by it; golden asserts it unsorted |
