# Reconciliation review — Spine vs PRD + Addendum

- **Artifact under review:** `ARCHITECTURE-SPINE.md` (draft, 2026-08-21)
- **References:** `prd.md` (final), `addendum.md`
- **Reviewer lens:** the spine must give every FR/NFR and addendum mechanic an
  architectural home (AD, convention, seed, or explicit Deferred entry), carry the PRD's
  quiet requirements (tone/principles), and contradict nothing. Known ratified deviations
  (E6 elimination via AD-6; single test revised to integration golden-master via AD-13)
  are checked for coherence only, not reported as contradictions.

## Verdict: **pass-with-fixes**

The spine is genuinely a spine: it does not restate the PRD, and coverage is strong —
persist-first lifecycle (AD-4), derived state (AD-5), source-class invariant (AD-6),
pinned T6 normalization (AD-7, closing the addendum's "to be defined in architecture"
item), artifact isolation (AD-8), immutable extractions (AD-9), seriality (AD-10), SSRF
(AD-11), the injected OpenAI seam (AD-12), and failure containment (AD-14) each land a PRD
requirement or addendum mechanic cleanly. The two ratified deviations are carried, one of
them incompletely (finding 2). No outright contradictions of the PRD were found. Five
fixable gaps, none critical.

---

## Findings

### 1. HIGH — Quote-highlight offset reuse has no home (two-matchers divergence risk)

- **Where:** spine AD-7 / AD-8 / Deferred (absent everywhere); addendum "FG4 roundtable"
  (line 122: *"Quote highlighting: reuse the match offsets T6 already computes — no new
  matching logic"*); PRD FR23 (line 239: system-view tab "with T6-verified quotes
  highlighted").
- **What did not land:** the addendum's explicit anti-divergence mechanic — the evidence
  panel highlights quotes using the offsets T6 already computed — appears in no AD, no
  convention, no Deferred entry. AD-7 pins the normalization but says nothing about T6's
  output carrying match offsets, and nothing persists or transports them (the ER seed's
  `confidence_reasons`/`dishes` shape doesn't mention them; the shared model-signal schema
  section doesn't either).
- **Why it matters:** this is exactly the failure mode the spine exists to prevent: a core
  builder ships T6 returning a boolean verdict, and a web builder independently
  re-implements quote matching against the acquired text — two matchers, two
  normalizations, highlights that disagree with the flag. The normalization pipeline in
  AD-7 (NFKC → lowercase → collapse whitespace → strip diacritics) makes naive re-matching
  in the frontend fail in visible ways (offsets in normalized text ≠ offsets in original
  text).
- **Fix:** one sentence in AD-7 (T6 emits match offsets against the acquired text as part
  of its result; the evidence panel consumes them, never re-matches) plus a home for the
  offsets (persisted with the dish, or recomputed server-side at read under AD-5 — either,
  but say which).

### 2. MEDIUM — E6 elimination not carried coherently through the enum references

- **Where:** spine AD-6 (E6 eliminated) vs Consistency Conventions "Error envelope" row
  (line 190: *"codes from the `shared` failure-reason enum (E1–E9 mapping)"*) and
  Capability map FG6 row (line 287: *"FG6 Failure states (FR33–FR34, E1–E9)"*); PRD E6
  (line 298).
- **What did not land:** the ratified deviation is stated once (AD-6) but two other spine
  locations still name the inventory as E1–E9. The builder of the `shared` failure-reason
  enum reads "E1–E9 mapping" and includes an E6 code; the pipeline builder reads AD-6 and
  never emits it — an unreachable state in the exhaustive inventory FR33 requires, or a
  disagreement about the enum's shape.
- **Fix:** make both references read "E1–E9 minus E6 (eliminated by AD-6)" or renumber;
  one authoritative statement of the post-elimination inventory in AD-14 (which owns the
  enum) would settle it. (AD-13's golden-master side of the deviation is coherent as
  written — mocked seam, every rule T1–T6 incl. downgrade, one reliable row, one golden.)

### 3. MEDIUM — HEIC verification (FR1 `[VERIFY AT ARCHITECTURE]`) silently dropped

- **Where:** spine — absent (no AD, no Deferred entry); PRD FR1 (lines 99–104) and Open
  items (line 368: *"HEIC auto-conversion behavior on upload (FR1) | verify at
  architecture"*); addendum "Party-mode roundtable" (line 84).
- **What did not land:** the PRD assigns this verification to the architecture phase by
  name. The spine neither verifies it, records an outcome, nor lists it in Deferred. The
  consequence is bounded — the PRD fixes the fallback (raw `.heic` → E4, no conversion
  library ever) — but an explicitly assigned open item vanishing without a trace is the
  kind of quiet drop the gate audits for.
- **Fix:** one Deferred line ("HEIC auto-conversion — verify at scaffold on a real iOS
  Safari upload; either outcome, E4 stands for raw `.heic`, no lib") or a recorded
  verification outcome.

### 4. MEDIUM — Review-surface honest-UI rules have no convention (quiet requirement dropped)

- **Where:** spine Consistency Conventions (only "Waiting UI" carries honesty copy rules,
  line 195); PRD NFR3 (line 322: *"AI-extracted — verify before publishing"* on the review
  screen), FR15 (line 187: rendered as "auto-checked"/"needs review", **never**
  "safe"/"verified"), FR12 (line 166: generated descriptions visibly labeled), FR13
  (lines 175–177: declared/inferred visually distinguished on every badge, `unknown`
  rendered distinctly), FR20 (lines 217–220: menu-level notice).
- **What did not land:** the operating principle's UI half is encoded for the *waiting*
  screen (a dedicated convention row with a ban list) but the *review* screen — where the
  principle bites hardest — has no counterpart. AD-8/AD-9 govern data and mutation, not
  presentation honesty. A web unit built from the spine alone can ship "verified ✓" badges
  without violating any stated invariant.
- **Fix:** one "Honest labels" convention row: NFR3 disclaimer present on review;
  flag copy fixed to auto-checked/needs review (banned: safe, verified); provenance and
  generated-label badges mandatory; FR20/T3 menu notices derived from row data at read
  (extends AD-5's list).

### 5. MEDIUM — Structural seed ER diagram omits the description field (FR9/FR12)

- **Where:** spine Structural Seed, `DISHES` entity (lines 253–262); PRD FR9 (line 153:
  description with provenance is a required per-dish field), FR12 (line 164).
- **What did not land:** the seed's dish row lists name, both price fields, allergens,
  confidence_reasons, flag, review_status, followup_note — but no `description` /
  `description_provenance`. Because the diagram includes minor columns (followup_note), it
  reads as the column inventory, and Deferred explicitly hands "Drizzle column details" to
  the code — a builder taking the seed as authoritative drops a required FR9 field.
- **Fix:** add the two columns to the diagram (or a one-line note that the diagram is
  illustrative and `shared`'s Dish schema — which must carry FR9's full field set — is the
  inventory).

### 6. LOW — Batch review mechanics (FR26) unaddressed by the API surface

- **Where:** spine Consistency Conventions "Naming" row (line 188: API surface ends at
  `/api/dishes/:id/review`); PRD FR26 (lines 254–257).
- **What did not land:** "confirm all auto-checked" and free multi-row resolution have no
  named route; per-row calls from the client are a fine answer, but the convention row
  presents itself as the full API surface, so the intent should be stated (per-row calls
  suffice / or add a batch route).

### 7. LOW — T4's text-source scoping not named in AD-6's class-keyed list

- **Where:** spine AD-6 (line 98: names model input, T6, and the FR23 tab as the things
  that key on class); PRD FR17 T4 (line 200: traceability check applies "on text sources")
  — a scoping the reviewer-gate fix pass added deliberately (addendum line 143).
- **What did not land:** T4 keys on class exactly as T6 does, but only T6 is listed. A
  core builder implementing T4 from the PRD will get it right; one from the spine's AD-6
  list alone might run traceability on visual sources. Add "T4/T6" to AD-6's list.

### 8. LOW — NFR2's measured cost has no capture home

- **Where:** spine Capability map (NFR2 → adapter, model ids via env) and Logging
  convention (line 193: stages + T-rules only); PRD NFR2 (lines 315–319: *"The measured
  real number feeds BUSINESS.md pricing — it is an input, not decoration"*).
- **What did not land:** nothing in the spine captures per-run token/cost usage, so the
  "measured real number" has nowhere to come from except manual dashboard reading. Cheap
  fix: log the usage object the OpenAI response already carries at the AD-12 seam (one
  line in the logging convention), or a Deferred entry naming the manual path as the plan.

## Checked and clean (for the record)

- Persist-first ADR (A2) → AD-4, including the single ~120 s timeout and E2/E3 fetch caps
  (FR6 reconciliation intact). Stage list matches FR4 + `empty` (E9).
- Derived state (FR7 interrupted, FR22/FR27 done, FR29 progress) → AD-5; no reaper.
- Price two-field representation, followup note column, source-artifact persistence,
  allergen canonical enum → ER seed + AD-2/AD-8, matching the addendum mechanics.
- T6 normalization defined (AD-7) — closes the addendum's open definition; downgrade
  ordering (before triage) carried.
- SSRF mechanics (open item) → AD-11, with the DNS-rebinding residual honestly recorded.
- Scanned-PDF open item → AD-6 (ratified elimination); AD-12's vision/native-PDF input is
  coherent with the class invariant; redirect-to-PDF edge pinned.
- One-test constraint → AD-13 (ratified revision), CI wiring named; no smuggled suite.
- Stack matches the PRD's fixed constraints; server-side pdfjs does not violate the
  "client-side PDF rendering libraries" cut (addendum confirms native embed client-side).
- No-delete (FR31/AD-9), seriality 409 (FR35/AD-10), no-PII (NFR4/AD-8), env-validated
  config, structured Pino logging of stages + fired rules (NFR5) — all present.
- Deferred list is legitimately deferred: every entry has a stated reason and none lets
  two units diverge (thresholds and copy are data; prompt content's home is fixed).

## Summary

| # | Severity | Finding |
|---|---|---|
| 1 | High | T6 match-offset reuse for quote highlighting has no home — second-matcher divergence risk |
| 2 | Medium | E6 elimination contradicted by two remaining "E1–E9" references (conventions, capability map) |
| 3 | Medium | HEIC `[VERIFY AT ARCHITECTURE]` open item dropped without a Deferred entry |
| 4 | Medium | Review-screen honest-UI rules (NFR3, FR12/13/15/20 copy) have no convention |
| 5 | Medium | ER seed omits `description`/`description_provenance` (FR9/FR12) |
| 6 | Low | FR26 batch mechanics absent from the stated API surface |
| 7 | Low | T4's class scoping missing from AD-6's key-on-class list |
| 8 | Low | NFR2 measured-cost capture has no home |

Verdict: **pass-with-fixes** — all fixes are one-line to one-row edits; nothing structural.
