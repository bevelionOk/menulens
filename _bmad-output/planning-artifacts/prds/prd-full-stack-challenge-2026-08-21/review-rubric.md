# PRD Quality Review — Menu Extraction & Review

Reviewed: `prd.md` + `addendum.md` (2026-08-21), against the upstream brief
(`briefs/brief-full-stack-challenge-2026-08-20/brief.md`, final) and the repo's
REQUIREMENTS.md / DECISIONS.md / plan/RISKS.md. Context weighed: deliberately small
hiring-challenge app, judgment-scored, over-engineering auto-rejects, chain-top PRD
(feeds architecture → stories).

## Overall verdict

This is a genuinely strong PRD: it has a thesis (the Operating Principle), every FR is
traceably a projection of it, trade-offs are stated with what was given up, and the
cut list is as explicit as the build list — exactly the judgment profile the challenge
scores. The one substantive risk is the image-ingestion path: T4's "traceable to the
source text" and FR23's "What the system read" tab are both defined against source text
that image sources don't have (FR19 says so itself), leaving the core triage gate
underdetermined on one of three first-class input paths. Fix that plus two smaller
ambiguities and this is ready for architecture.

## Decision-readiness — strong

Decisions read as decisions, not considerations. FR28 ("Editing would falsify the
extraction record") and FR35 (serial operation) state the choice and the reason;
the addendum's processing-model ADR is a model of the form — four options, explicit
verdicts, and the accepted cost named out loud ("in-flight work dies with a server
crash (accepted: a run costs ~$0.003 and ~1 min — redo, don't resume)"). The
"Decisions closed in this PRD" section records supersessions ("Supersedes the earlier
'synchronous request, ~60 s timeout' position") rather than smoothing them away, and
the Open items table gives each open item an owner and a closing point — none of the
five blocks starting architecture. No `[NOTE FOR PM]` callouts exist, which is correct
here: the operator is his own PM, and the open tensions are carried by the Open items
table instead.

## Substance over theater — strong

Nothing reads as furniture. Two personas plus two shadow stakeholders, and each earns
its keep — the allergic diner is the stated justification for the asymmetric gate, not
decoration. NFRs are product-specific and numbered (cost envelope $0.003–0.032 feeding
BUSINESS.md, ~120 s single timeout, Pino logs required to record which T1–T6 rules
fired), and the "Deliberately absent" list (SLA targets, browser matrices, i18n) turns
the usual NFR boilerplate into an explicit anti-boilerplate stance. Vision is not
restated from the brief — the PRD says so and points upstream, which is the right call
for a chain with the brief checked in beside it.

## Strategic coherence — strong

The thesis is stated in the first ten lines and quoted verbatim from the brief ("never
claims more than it can prove"), and the feature groups mirror the loop
(Ingestion → Extraction → Triage → Review → History → Failure) rather than a backlog
ordering. Success Measures each carry a named counter-measure ("the allergen gate never
relaxes to hit it"; "achieved only through declared evidence…, never by loosening
rules") — the exact structure this rubric looks for and rarely finds. The
100%-uncertain-menu-is-correct stance (end of FG3) is the thesis defended at its most
uncomfortable point, which is what coherence looks like.

### Findings
- **low** No stated check for the ~3-minute target (Success Measures; NFR1) — the
  measure governs the product ("governed by triage calibration") but measurement
  infrastructure is a non-goal, and unlike the batch-confirmation measure it carries no
  "(qualitative)" caveat, so nothing says how anyone will know it's met. *Fix:* one
  sentence — validated by a manually timed dry-run on the dev test menus before
  submission; no instrumentation.

## Done-ness clarity — adequate

Most FRs are unusually testable for a PRD: closed vocabularies (FR13's EU-14 enum),
verbatim UI copy (FR20's notice text), enumerated deterministic rules (T1–T6 with the
T6 downgrade path), a bounded failure-state inventory (E1–E9) that FR33 declares
exhaustive, and named bans (FR5: "percentage bars, dynamic ETAs, and uninformative
lone spinners"). The staleness threshold and expectation copy are correctly tagged as
open calibration items rather than smuggled in as facts. What keeps this from strong
is that the image path — one of three first-class sources — falls outside the
definitions the triage and evidence sections are written in.

### Findings
- **high** Image-source triage and evidence-panel semantics underdetermined (FG3 T4;
  FR23) — T4 fires when a dish name is "not traceable to the source text", and FR23's
  second tab shows "the extracted source text with T6-verified quotes highlighted",
  but FR19 states that for image sources "there is no ground text". Read naively, T4
  fires on every image row (nothing is traceable) and the photo path goes 100%
  uncertain, killing batch confirmation exactly where vision extraction is the selling
  point; read generously, T4 silently doesn't apply to images — the PRD doesn't say
  which. FR19 makes this carve-out explicit for T6 but not for T4, and FR23 doesn't say
  what the "What the system read" tab shows for an image. *Fix:* add one line to FR17
  (T4 applies only to sources with acquired text; for images the name-traceability
  check is not performed — same documented limitation as T6) and one to FR23 (for
  images the tab shows the model's transcription, labeled unverified, or is absent).
- **medium** Server-side image downscaling has ambiguous requirement status (FR2;
  addendum "Upload cap") — FR2 carries it only inside a rationale clause ("optimizing
  what reaches the model (server-side downscaling) is the system's job, not hers") and
  the concrete commitment ("server downscales images before the vision call") lives in
  the addendum, whose framing is "mechanism notes", not requirements. An engineer
  extracting FRs could ship the 10 MB cap without downscaling and still satisfy every
  numbered requirement, while NFR2's cost envelope quietly depends on it. *Fix:*
  promote it to a sentence with requirement force in FR2 (or an FR2a), leaving the
  how to architecture.
- **low** FR32 defers pagination on an unstated trigger ("basic pagination only if
  volume demands it") — no one owns deciding when volume demands it, and it isn't in
  Open items. *Fix:* fix v1 as no pagination (consistent with the single-operator,
  days-long usage window), or name a threshold.

## Scope honesty — strong

The Out list is longer and more specific than the In list, and says why that is ("Each
cut is deliberate; the reasoning lives in the addendum and DECISIONS.md"). Cuts are
recorded at the altitude they were made — the addendum's ADR cut list (queues, SSE,
idempotency keys, reaper) matches the PRD's Out list item for item. Inferences are
tagged (`[ASSUMPTION]` on the FR7 threshold, `[VERIFY AT ARCHITECTURE]` on HEIC
behavior) and land in the Open items table with owners. Open-items density (5, none
blocking) is right for a green-light PRD at these stakes. FR14's shared-language
premise is called a "working assumption, documented" in prose rather than tagged —
noted under Mechanical.

## Downstream usability — adequate

This is a chain-top PRD, so the dimension counts. Cross-references almost all resolve:
FR1–FR36 are unique and complete, FG and FR references are consistent, D3/D4/D10 exist
in DECISIONS.md, REQUIREMENTS.md §4 exists, and the PRD/addendum altitude split is
clean — each addendum section names the PRD anchor it serves. The gaps are naming-layer:
no glossary, and the core entity slides between three nouns.

### Findings
- **medium** No glossary, and the core entity drifts across "run", "menu", and
  "extraction record" — FR3 says submitting "creates the extraction record", FR22 says
  "A **menu** is **done**", History lists runs, and the addendum ADR calls the same row
  "the menu row". Since FR8 makes retry create a *new* run, run and menu are not 1:1,
  and an architect must guess which noun names the persisted aggregate (schema and API
  naming follow from the answer). *Fix:* a five-line glossary — run, dish row, flag
  (reliable/uncertain), provenance (declared/inferred/unknown), resolution
  (confirmed / marked for follow-up) — and pick "run" as the persisted entity
  throughout.
- **low** Load-bearing storage requirement carried mainly by the addendum (FR23, FR30;
  addendum "Storage implications") — that uploaded image/PDF bytes and acquired source
  text must be persisted is what makes FR30's history-with-evidence and T6 work, but in
  the PRD it appears only as FR30's parenthetical "since sources are persisted (FR23)"
  — and FR23 itself never says persisted. *Fix:* one explicit sentence in FR23: source
  artifacts (uploaded bytes, acquired text) are stored with the run.
- **low** Two near-identical reference registries with a real collision — "(R6)",
  "(R7)", "R8", "R9" resolve to REQUIREMENTS.md §1 rows, while FR1's "R-10" resolves to
  plan/RISKS.md risk R-10 (the <5-min README risk); REQUIREMENTS.md *also* has an R10
  meaning "BMAD drives planning and implementation". A downstream reader has no legend
  and will likely resolve R-10 to the wrong document. *Fix:* prefix risk IDs
  (RISK-10) or say "RISKS.md R-10" inline.

## Shape fit — strong

Right shape, explicitly argued: single-operator capability spec, no UJ inventory, with
the justification stated where a reviewer would object ("The review loop *is* Ana's
journey — a single-operator tool needs no separate journey inventory; FG1–FG6 below
follow her session in order"). Success measures are operator-outcome measures, not
DAU theater. For a challenge that auto-rejects over-engineering, the restraint is
itself load-bearing and the PRD performs it in structure, not just in claims — the
addendum absorbing architecture-altitude depth keeps the PRD readable without losing
the reasoning. The heavy reliance on sibling repo docs (REQUIREMENTS.md, DECISIONS.md,
RISKS.md) means sections don't fully stand alone, but in a repo where all of it ships
together to the same reviewer, that's the correct trade.

## Mechanical notes

- **FR numbering out of sequence:** FR35 and FR36 sit inside FG1 after FR8 (appended
  late). No gaps or duplicates in FR1–FR36; renumbering would churn cross-refs — a
  one-line note beside FR35 would do.
- **DECISIONS.md D4 still reads "OPEN"** while the PRD declares "D4 … CLOSED". The PRD
  itself says formal entries "land at session close" — fine, but if session close
  slips, the two documents contradict on the product's central decision. Worth a
  checklist line.
- **Assumptions Index roundtrip:** no index section; one inline `[ASSUMPTION]` (FR7,
  covered by Open items). FR14's shared-language premise is an untagged "working
  assumption" — tag it or add it to Open items' neighborhood so it isn't lost at
  architecture.
- **Nonstandard tag:** `[VERIFY AT ARCHITECTURE]` (FR1) isn't a house tag but is
  tracked in Open items, so it roundtrips; harmless.
- **Tilde values:** "~120 s" (FR6) is provisional like the staleness threshold but,
  unlike it, isn't in the Open items table; add it to the FR5/FR7 calibration row or
  fix the number.
- **Glossary drift:** "mark for follow-up" (UI copy) vs "doubtful" (internal term) is
  deliberate and explained in FR25 — not drift. "run/menu/extraction record" is the
  real drift; see the medium finding above.
