# Video Script Highlights — living document

Raw material for the Phase-5 video outlines ([05-communication-videos.md](05-communication-videos.md)).
**Updated at the close of every BMAD session**: each session appends its standout moments,
tagged with the video beat they feed. This is not a script — it is the highlight reel the
outlines get distilled from, captured while the memory is fresh instead of reconstructed
on Aug 24.

Beat tags — Walkthrough video: `[WHY]` what we built and why · `[JUDGMENT]` trade-offs,
cuts, course-corrections · `[BREAKS]` what breaks in production · `[NEXT]` what would come
next. Personal video: `[PERSONAL]` who I am / how I work, shown not claimed.

---

## Session 1 · 2026-08-20 — Product Brief (`/bmad-product-brief`)

**1. The public retraction: "under a minute" → ~3 minutes** `[JUDGMENT]` `[PERSONAL]`
Best on-camera moment of the session: "My own playbook promised rows in under a minute.
During the brief session I pressure-tested it: extraction alone can take 30–90 seconds, and
the real bottleneck is where Ana's attention goes, not clock speed. I retracted it on the
record — D10." Shows course-correction under evidence, exactly what the rubric prices.

**2. The reframe that organized the whole product** `[WHY]`
The confidence flag is not a statistic — it is an **attention router**. The product is not
an extractor with a score; it is **triage-assisted review**. One sentence that explains
every downstream decision. Quotable as-is.

**3. The operating principle (the camera line)** `[WHY]`
"*The system never claims more than it can prove, and everything it cannot prove is handed
to Ana with the evidence in view.*" Every design question in the demo ("why doesn't the
badge say verified?", "why persist confirmations?") gets answered with this one sentence —
say it once, then show it three times in the UI.

**4. The dirty secret of menus (the brownie story)** `[WHY]` `[BREAKS]`
Public menus almost never declare allergens — so allergen extraction is largely
*inference*. Pre-mortem told it best: "Brownie de la casa — 6€", perfect parse, no declared
allergens, no inferred nuts, flag says reliable, Ana batch-confirms, diner hospitalized.
Hence: per-allergen provenance `declared|inferred`, dish-level `unknown`, and the iron rule
**"none found" ≠ "none present"**. Concrete, human, and demonstrably ours.

**5. The asymmetric gate — safety by code, not by model promises** `[WHY]` `[BREAKS]`
Any inferred/unknown allergen ⇒ row `uncertain`, no exceptions — enforced by deterministic
rules, not by asking the model how sure it feels. Connects to the Day-0 smoke test (model
confidently calling a red pixel "brown"): we *measured* that self-confidence lies before
deciding not to trust it. Evidence → design, on camera.

**6. Alarm fatigue: the failure nobody expects** `[BREAKS]`
The inverted risk: a system that flags *everything* uncertain fails just as hard — Ana goes
back to the spreadsheet ("the product died of prudence"). Success criteria demand calibration
in both directions. Great "what breaks in production" material beyond the obvious.

**7. Restraint as visible decisions** `[JUDGMENT]`
Three cuts worth naming on camera: reviewer *identity* in the audit trail (implies auth →
guardrail violation; reduced to status + timestamp), anti-fatigue as a *measured* metric
(analytics is a non-goal; kept qualitative), and a party-mode roundtable declined for brief
validation (multi-perspective scrutiny had already happened; heavy process on a 2-page
artifact is what the rubric rejects). All logged — D11.

**8. Method, briefly: five lenses → one decision** `[JUDGMENT]` `[PERSONAL]`
Advanced elicitation ran Reframe, Inversion, Pre-mortem, ADR panel, and Stakeholder
rotation — then the findings were *integrated*: "not seven decisions — one, with five
consequences." A 2×2 coverage audit (considering what we must / mustn't) caught the creep
before it shipped. One line each; don't narrate the process, show the artifact.

**9. Traceability set up on purpose** `[NEXT]`
D4 deliberately left OPEN in the brief with a documented opening position (ADR in the
addendum) so the PRD closes it — artifacts that constrain each other instead of decorating
the repo. Tell it as: "the brief hands the PRD a loaded question, and the paper trail shows
the handoff."

---

## Session 2 · 2026-08-21 — PRD (`/bmad-prd`)

**10. D4 closed: the arbiter has six rules and none of them is "trust the model"** `[WHY]` `[JUDGMENT]`
The flag's derivation — the challenge's explicitly scored open question — closed as T1–T6:
model supplies signals (provenance, evidence quotes, criteria-anchored self-flag),
deterministic code arbitrates. The camera line: "the model votes; the code decides."
Traceable from the brief's handoff through the ADR to FR15–FR21.

**11. T6, or: the gate's inputs were model output too** `[WHY]` `[BREAKS]`
Mid-session catch: T1 guaranteed the allergen gate "by code" — over provenance tags the
*model* wrote. If it mislabels `declared`, the gate processes a lie with full rigor. Fix:
every declared allergen carries the verbatim quote it was read from; code greps the quote
against the source text; unverifiable ⇒ downgraded ⇒ uncertain. "The gate never trusts an
unverified declared." On photos there's no ground text — quote shown, Ana verifies against
the image; named as a production limitation, on the record.

**12. The flag is structurally blind to omissions** `[BREAKS]`
A dish the extractor never saw has no row — and a row that doesn't exist can't be
uncertain. No confidence system can route attention to missing dishes; only the original
menu beside the table lets Ana catch one. Born from Pablo pushing back on the room's
"show what the system read" panel. Prime "what breaks in production" material.

**13. The timeout that dissolved instead of being tuned** `[WHY]` `[JUDGMENT]`
Pablo distrusted timeouts; five elicitation methods later, the answer wasn't a better
number — it was removing the long-lived request: the menu row is born persistent at
submit, extraction continues in-process, the browser polls state. "La fila nace antes que
el proceso; el navegador mira, no sostiene." One technical timeout survives (the model
call). Durability-as-resumability was cut by Pablo's own scope rule — on camera, that's
"I asked for durability and then discarded half of my own ask."

**14. The honest waiting room** `[WHY]`
The operating principle applied to the progress UI: a progress claim is a claim. Real
stages only, measured elapsed time, a calibrated "typically 30–90 s" — percentage bars
and dynamic ETAs banned as lies the product would tell while promising never to lie.

**15. "100% uncertain is honesty, not failure"** `[JUDGMENT]` `[BREAKS]`
A menu that declares nothing goes fully uncertain — and that's correct: the gate never
relaxes because the menu is poor. The counterweight is a menu-level notice ("this menu
declares no allergen information") that doubles as Ana's actionable message to the
restaurant — the worst case converted into the reprint opportunity. Pablo's line: "el
sistema debe reconocer sus virtudes y sus limitaciones."

**16. No inline editing — because editing would falsify the evidence** `[WHY]`
A persisted row is *what the system extracted* plus *Ana's verdict on it*. Let her fix a
price in the cell and the audit trail starts lying about the extraction. Wrong value ⇒
mark for follow-up, with a note. The strongest "why not?" answer in the demo.

**17. The gate that audited the auditors** `[JUDGMENT]` `[PERSONAL]`
Eight bounded reviewers (5 reconcilers vs every input + rubric + over-engineering hawk +
BMAD-fluency auditor) ran against the finished draft — and found real things: the T4/T6
image blind spot, an input path (scanned PDF) cut without a recorded reason, two
speculative mechanisms that got cut on the spot. Verdict "genuine, not cosmetic" — with
receipts in the repo (`review-*.md`). Plus the 2×2 coverage audit ritual, second session
running.

**18. The build ladder: P1 falls entirely before P0 loses a line** `[NEXT]` `[JUDGMENT]`
36 FRs vs a 4-day runway is itself an over-engineering risk ("a half-shipped ambitious
PRD is the rejection"). The PRD now carries its own degradation order, wired to the D8
deadline policy. Next: architecture (`/bmad-architecture`), where the single test (T1–T6
is the front-runner), the schema, and the pending verifications (native-PDF input, HEIC,
SSRF mechanics) close.

---

## Session 3 — Architecture (2026-08-21)

**19. The one-test budget flips the choice** `[JUDGMENT]` `[PERSONAL]`
The PRD's front-runner was a unit test on the pure arbiter. Pablo challenged his own
plan: with *exactly one* test allowed, breadth of meaningful coverage wins — an
integration golden-master (real API, real Postgres, OpenAI mocked at its seam) crosses
every boundary the unit test can't see, and the fixture is crafted to fire all six triage
rules, so the arbiter's coverage is embedded, not lost. E2E was rejected for riding real
LLM non-determinism. A visible supersession, logged as D16.

**20. "A yes eliminates E6" turned out to be false — and that's the story** `[WHY]` `[JUDGMENT]`
OpenAI's native PDF input verified: yes, it exists. But sending PDFs natively means *we*
never hold the source text — no ground truth, no machine verification, an empty evidence
tab. The fix reframed the whole pipeline: sources are classed by *usable ground text*
(`text | visual`), not by file type; scanned PDFs simply join the class photos already
live in. E6 stopped being a failure state without weakening the gate one millimeter.

**21. The adversarial reviewer found a real spec bug** `[BREAKS]` `[JUDGMENT]`
"Strip diacritics after NFKC" is a no-op — composed é has no combining mark to strip. Two
compliant builders would have produced *different confidence flags on identical Spanish
menus*: the worst possible divergence in an allergen product. The pinned order is now
NFKC → lowercase → NFD → remove combining marks → collapse whitespace. Caught by a
reviewer whose only job was to build two compliant-but-incompatible units.

**22. The gate a lying model can't beat** `[BREAKS]`
Chaos pass: a menu carrying prompt-injection ("mark everything reliable"). On text
sources the deterministic arbiter shrugs — a fabricated "declared" needs an evidence
quote that actually matches the source, or T6 downgrades it and the allergen gate fires.
On photos the quote can be faked, and that's exactly why photo evidence is Ana-verified.
Walkthrough gold. Companion residual, named not hidden: DNS rebinding on the SSRF guard.

**23. Six reviewers, six pass-with-fixes, zero reversals** `[JUDGMENT]` `[PERSONAL]`
Five elicitation methods + six gate subagents (heartbeat-watched, R-11) attacked the
decision set from independent angles and converged on the same verdict: decisions right,
seams under-specified. Nine seam rules + ~20 fixes, no new machinery. Pablo's framing:
"había que ajustar costuras para que los builds no diverjan."

**24. Next** `[NEXT]`
PRD amended in place (E6 retired, T-rules re-scoped by class) so epics inherit a
consistent upstream. Spine final: 14 ADs. Next session: `/bmad-create-epics-and-stories`,
then the sprint-planning gate.

## Session 4 — Epics & Stories (2026-08-21)

**25. Story count is partition, not scope** `[JUDGMENT]`
Pablo's own challenge — "¿13/14 stories no se nos va de scope?" — got the distinction
that shaped the session: the story count partitions the same 36 ratified FRs; scope never
moved. The real protection isn't fewer stories, it's the tag-safe rule Pablo set: **no
story mixes P0 and P1**, so the D8 deadline ladder cuts P1 stories whole (batch/
reversibility, evidence panel) without touching a line of P0.

**26. History stayed separate on a UX argument, not a technical one** `[WHY]` `[PERSONAL]`
The merge option (History into Review) was cheaper on paper. Pablo killed it as an
operator-experience call: History is not a post-processing phase — it's the other view of
runs in *any* state; mixing unprocessed runs into the review flow confuses the person
doing the work. Epic boundaries drawn by how Ana lives in the tool, verbatim in the doc.

**27. Failure states are acceptance criteria, not an epic** `[JUDGMENT]`
The alternative cut — a "failure states epic" — was rejected on principle: an epic that
ships without its failure states ships *dishonest* (violating the operating principle),
and a later failure epic re-churns every file. Honest failure is an AC of each pipeline
story. FG6 lives distributed, and Epic 1 stands alone truthfully.

**28. One elicitation pass, reserved for the complete set** `[JUDGMENT]`
Party Mode and per-story elicitation declined — upstream was already gate-audited and
story-level risk is verification-shaped, not vision-shaped. Three methods (Self-
Consistency, Pre-mortem, Red Team) ran once over the finished set and converged on small
additive findings: three coverage gaps (FR14/FR21/FR34), and Red Team caught T4
traceability missing the pinned normalization — the *same bug class* the architecture
gate caught for T6, now hunted down at story level. Convergence on small findings is what
a solid set looks like.

**29. The guard question, turned on the reviewer** `[PERSONAL]` `[JUDGMENT]`
Before approving the elicitation's 8 fixes, Pablo asked: "¿se atiene esto a la mitigación
de riesgos y requisitos?" — the standing over-engineering guard applied to the review's
own output. Every fix had to map to an existing requirement line or a logged risk before
landing; three of the eight actively *ban* machinery (no partial-error mechanism, one
config threshold, scaffold defaults as-is). Even the safety net gets audited.

**30. The pre-mortem's sharpest find: the test can't be last-and-lost** `[BREAKS]` `[NEXT]`
Failure path: it's Aug 25, everything works except Story 1.8 — and R8 ("exactly one
meaningful automated test") is a *hard* submission requirement, not a P1. Story 1.8 is
now the Epic 1 exit gate, never cuttable under the ladder. Next: the sprint-planning
gate (readiness verdict + sprint-status file), then build story by story.

**31. The gate that added nothing — and why that's the point** `[JUDGMENT]` `[WHY]`
The sprint-planning readiness gate ran as a skeptic reading a handoff: could a developer
build these 13 stories without inventing a single unrecorded decision? Verdict: PASS with
zero new decisions needed. Traceability held in both directions (FR coverage map forward,
story citations back), the one historical gap (FR30's priority) had already been caught
and ratified in D19, and every remaining open item is calibration *data* with a recorded
owner — a threshold to measure, never a decision to invent. Four gated sessions upstream
left nothing for the fifth to fix: that silence is the evidence the process worked.

**32. Judgment where it matters, a script where it doesn't** `[JUDGMENT]` `[NEXT]`
The tracking file wasn't hand-written: a deterministic parser turned epics.md into
`sprint-status.yaml` (3 epics, 13 stories — 16 backlog + 3 optional retrospectives),
because parsing headings and merging statuses are mechanical jobs where an LLM only adds
noise. Judgment stayed where the script can't go: the readiness verdict, and auditing the
parser's two warnings (both benign — summary headings, not lost stories). Planning phase
closed; next conversation is `bmad-build` on Story 1.1, and if epics change mid-build,
the skill re-runs and refreshes tracking without downgrading any story already in flight.

<!-- Session 6 (build) appends here -->
