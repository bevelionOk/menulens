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

<!-- Session 2 (PRD) appends here -->
