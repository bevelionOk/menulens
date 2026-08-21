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

<!-- Session 4 (epics/stories) appends here -->
