# Reconciliation — brief addendum → PRD

**Input:** `_bmad-output/planning-artifacts/briefs/brief-full-stack-challenge-2026-08-20/addendum.md`
**Against:** `prds/prd-full-stack-challenge-2026-08-21/prd.md` + its `addendum.md`
**Date:** 2026-08-21 · **Verdict: 1 gap** (everything else closed, guarded, or deliberately cut with a record)

The brief addendum was the designated opening position for this PRD; its central hand-off
(D4 must close in the PRD) is honored. The trace below covers the four mandated checks.

## 1 · Commitments handed to the PRD — closed?

| Hand-off from brief addendum | Where it closed | Status |
|---|---|---|
| D4: hybrid A→B — model supplies criteria-anchored signals, deterministic rules arbitrate | FG3 whole; FR16 (hybrid, deterministic arbiter), "Decisions closed in this PRD" declares D4 CLOSED | Closed |
| Per-allergen `declared\|inferred` tagging | FR9, FR13 (plus `unknown` dish state) | Closed |
| Allergen gate enforced by code, not model promises | FR17 T1 (dominant, no exceptions) + T6 downgrade of unverified "declared" — a strengthening beyond the opening position | Closed, strengthened |
| Option B's candidate rules (price missing/ambiguous, name empty, allergen inferred/unknown) | T2, T4, T1 — plus new T3 (currency), T5 (self-flag), T6 (evidence verification) | Closed, expanded |
| Option A's self-flag criteria (ambiguous price, allergen not literal, doubtful OCR) | FR18 — all three, plus "unclear dish boundaries"; doubt resolves toward `uncertain` | Closed |
| B as prime candidate for the single test | PRD Open items + PRD addendum (FG3 closure notes): T1–T6 arbiter incl. T6 downgrade named leading candidate; formal justification deferred to architecture (R8) | Tracked deferral, not a drop |
| Evolution of "self-reported confidence: not used" → DECISIONS.md | Root `DECISIONS.md` D4 entry records the evolution, the smoke-test evidence, and the C/D cuts; PRD states formal close lands at session close | On track (see observation below) |
| Retraction: ~3 min/menu target, course-correction → DECISIONS.md | Context, Success Measures, NFR1 (cites D10) | Closed |

## 2 · Inversion failure paths → requirements?

- **Raw LLM self-confidence as sole source** → FR16: raw self-confidence never used as a signal. Guarded.
- **"Reliable" rendered as "verified/safe"** → FR15 ("auto-checked"/"needs review", never "safe"/"verified") + NFR3 disclaimer. Guarded.
- **Inferred allergens visually identical to declared** → **GAP — see below.** Stored provenance (FR13) and the T1 trigger exist, but no FR requires the UI to render the distinction.
- **Over-flagging → alarm fatigue** → Success Measure 3 (qualitative health condition), FR20 notice, FG3 closing note (100%-uncertain is correct behavior; fight fatigue with FG4 speed, never by loosening). Guarded.
- **Empty allergen list indistinguishable from "unknown"** → FR13: no-info dish is `unknown`; "none found" is not "none present". Guarded.
- **Uncertain rows without adjacent evidence** → FR23 (evidence panel, Original-first) + FR24 (fired rules + quotes inline). Guarded.

## 3 · Pre-mortem root causes → guarded?

- **Reliability from parse completeness, not allergen certainty** → FR15 says it verbatim ("does not measure parse quality"); T1 dominance encodes it. Guarded.
- **UI language implying safety** → FR15 + NFR3. Guarded.
- **No persisted review trail** → FR27 (last decision + timestamp), FR29–FR31 (visible, live, no-delete history), NFR5 (rule firings in logs). Guarded — and correctly held to the brief's "status + timestamp, no identity" reduction (no creep back toward confirmer identity).

## 4 · Cut rows (C: dual extraction, D: per-field logprobs) — crept back?

No. Neither dual extraction/agreement, cross-run consistency, nor logprobs appears in the PRD
or its addendum; FR16 keeps the model to input signals from the single call. Both cuts are
recorded in root `DECISIONS.md` D4 with reasons, as the brief addendum required.

## Coverage-audit spot checks (all clean)

Creep items stayed removed (identity → FR27; anti-fatigue stays qualitative → Success
Measures; flag derivation at PRD altitude → FG3). Filled gaps all landed: failure states
(E1–E9, FR33), visible history (FR29), menu-level done concept (FR22), non-goals list
(Scope Out), cost envelope (NFR2). "Correctly avoided" items stayed avoided: no auth/queues
(Out list), no headless browser (E3 documents the limitation instead), shadcn/ui not a
custom design system, allergen regulation held at EU-14 vocabulary (FR13).

## The gap

### G1 — Per-allergen provenance is stored but never required to be *visible*

The Inversion analysis named "inferred allergens visually identical to declared" as a
failure path that became a requirement. The PRD guards it only indirectly: an inferred
allergen fires T1 (row goes `uncertain`), FR24 shows the fired rules, and declared
allergens carry quotes (FR19). But no FR states that the review UI renders each allergen's
`declared`/`inferred` provenance visibly (label, style — anything). The tell: FR12
*explicitly* requires visible labeling for generated descriptions "reusing the
allergen-provenance pattern" — the derivative pattern got the explicit UI requirement while
the original did not. Concrete hole: a row with declared "gluten" and inferred "milk" is
`uncertain` with reason "T1", and nothing obliges the UI to show *which* allergen is the
inferred one; presence/absence of an evidence quote is the only implicit cue.
**Fix:** one sentence in FR13 or FR24 — inferred allergens are visibly distinguished from
declared ones in the dish table (the same "confess it" labeling FR12 already mandates for
descriptions).

## Observation (not a gap)

Root `DECISIONS.md` still heads D4 as **OPEN** while the PRD declares it CLOSED. The PRD
explicitly says formal entries land at session close and the PRD is `status: draft`, so
this is a tracked pending step, not a silent drop — but the flip must not be forgotten at
session close (D4 → CLOSED, plus the processing-model and description-policy evolutions the
PRD's "Decisions closed" section promises).
