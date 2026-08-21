# Reconciliation — Brief → PRD (+ Addendum)

- **Input:** `briefs/brief-full-stack-challenge-2026-08-20/brief.md` (ratified product brief, final 2026-08-20)
- **Against:** `prds/prd-full-stack-challenge-2026-08-21/prd.md` + `addendum.md`
- **Date:** 2026-08-21
- **Question asked:** what does the PRD+addendum *silently* drop, contradict, or water down? Deliberate, documented cuts do not count.

## Verdict

**1 gap (minor).** Coverage is otherwise exceptionally faithful — the PRD quotes the brief's
qualitative material verbatim in the places where an FR structure usually flattens it, and
every cut I could trace is documented with reasoning in the PRD's Out list, the addendum,
or a named decision. The single finding is a routing omission, not a distortion.

## Gap 1 (minor) — The Vision's value framing has no landing spot; only the cost half of the business case is routed

The brief's **Vision** section makes a specific claim about what the business case rests on:

> "the product's value would be Ana's time and her defensibility — … where 'reviewed by a
> human with evidence' is the platform's answer to allergen liability. **That framing, not
> the extraction itself, is what a customer would pay for.**"

The brief routes the *cost* side of the unit economics to BUSINESS.md explicitly
(Constraints: "the unit economics of a single menu extraction feed the business case"),
and the PRD carries that faithfully — NFR2 says the measured cost "feeds BUSINESS.md
pricing — it is an input, not decoration."

The *value* side gets no equivalent. The PRD has no Vision section (defensible — "this PRD
projects the brief into requirements; it does not restate it"), and defensibility does
appear as Ana's need (Users, FR31). But nothing in the PRD or addendum routes the
"reviewed-by-a-human-with-evidence is the sellable thing, not the extraction" framing to
BUSINESS.md the way NFR2 routes cost. A BUSINESS.md written downstream from the PRD alone
would have its cost input handed to it and its value proposition silently missing — the
exact half the brief says the customer pays for.

This is silent in the precise sense: the blanket "does not restate the brief" line covers
it, but unlike every other omission there is no specific documented cut, and the asymmetry
with NFR2 (cost routed, value not) suggests oversight rather than decision.

**Suggested fix (one line):** add a row to Open items — or a sentence to NFR2 — routing
the brief's Vision framing to BUSINESS.md as the value-side input, e.g. *"BUSINESS.md's
value proposition inherits the brief's Vision framing: Ana's time + defensibility
('reviewed by a human with evidence'), not extraction itself."*

## Qualitative material examined and found intact

Because FR structures tend to flatten exactly this material, each item below was checked
individually. All are preserved, most verbatim:

- **Operating Principle** — quoted whole in the PRD preamble, and *used*, not decorative:
  FR5 bans percentage bars/ETAs/spinners "by the Operating Principle"; the addendum's
  Map-Is-Not-the-Territory section extends it to the waiting UI ("a progress claim is a
  claim").
- **"Attention proportional to doubt" — including the "not merely look-only-at-uncertain"
  nuance.** FR15 keeps the flag's meaning verbatim ("whether it is safe for Ana not to
  look closely"); FR24 puts the doubt's reasons inline; FR26's free multi-row selection
  "not filtered by flag" plus "the system routes her attention; it does not handcuff her.
  The accountable reviewer is Ana, not the flag" is the brief's point 3 restated, not
  flattened. The "if Ana must reopen the PDF, the 3-minute target dies" constraint lands
  as FR23's one-screen evidence panel.
- **Honest-failure language** — "never a silent empty table" carried into FG6's preamble;
  E9 preserves "'I couldn't' is itself a claim the system can prove" with attribution to
  the brief; FR29 even extends the stance to an empty history list.
- **Asymmetry stances** — "no exceptions" allergen dominance → T1 (dominant, no
  exceptions); "deterministic rules in code, not the model's self-assessment" → FR16 (raw
  self-confidence never used, with smoke-test evidence); "none found is not none present"
  → FR13 verbatim; "never 'safe' or 'verified'" → FR15 verbatim + NFR3.
- **Accountability framing** — "legal responsibility … made executable and defensible" →
  NFR3 ("allergen accountability is Ana's"), FR26, FR31 ("erasing runs is exactly what her
  defensibility cannot afford"); Ana's quote "I can show what I checked and why I trusted
  it" carried verbatim into Users.
- **Shadow stakeholders** — both present in Users; the diner's "protected only by the
  pipeline's asymmetry" kept; the restaurant's tolerable/intolerable error asymmetry is
  structurally embodied (T1 dominant vs. T2/T3 as ordinary triggers).
- **All four success criteria** — carried and strengthened with counter-measures.
- **All five Handoffs** — closed: D4 (FG3, exactly along the brief's opening position),
  evidence-in-view (FR19/FR23), error inventory + copy (FG6/FR33), sync-vs-async UX
  (addendum ADR), history scope (FR29–32).

## Reframings checked and cleared as documented (not gaps)

- **"A system that flags everything as uncertain has failed" vs. the PRD's "100%-uncertain
  is correct behavior."** Looks like a contradiction; isn't a silent one. The PRD scopes
  the reframe to menus that *declare nothing* and states the resolution in Success
  Measures (reliable rows come only from declared evidence; fatigue fought via FG4 speed
  and FR20's notice, never by loosening the gate); the addendum attributes the stance to
  Pablo in-session ("Fatigue stance"). Documented, deliberate, and arguably the only
  reading consistent with the brief's own zero-false-reliables criterion.
- **"Marking doubtful" → "mark for follow-up"** — renamed with load-bearing rationale
  (FR25); a strengthening of the brief's intent, argued in the open.
- **"Each resolution is persisted" → last-decision-plus-timestamp, no change journal**
  (FR27) — "change journals" is an explicit Out item, reasoned against the brief's
  single-operator cut.
- **"Uncertain rows demand inspection" vs. FR26 allowing batch resolution of uncertain
  rows** — a softening of "demand" into routing-not-enforcement, but the position is
  stated and defended in FR26 itself ("the accountable reviewer is Ana, not the flag"),
  not slipped in.
- **"Reliable rows are skimmed and confirmed in batch" vs. one-click confirm-all** — the
  skim survives in FR15's semantics ("not look closely" ≠ "not look at all") and NFR3's
  verify-before-publishing disclaimer; too thin to count as a finding.
- **The large Out list** (SSE, queues, ETAs, idempotency keys, deletion, search, negative
  declarations, i18n, currency handling…) — every item traced to the addendum's ADR cut
  list, the brief's non-goals, or an in-PRD rationale. None silent.

## Bottom line

The PRD is an unusually faithful projection of the brief — it preserves the qualitative
spine verbatim and documents its deviations. The one real finding is that the brief's
Vision framing (the value half of the business case) is the only routed-nowhere material;
one sentence in NFR2 or Open items closes it.
