# DECISIONS.md — Decision Log

Trade-offs, alternatives considered, and cuts — recorded as they happen, not reconstructed
at the end. Format per entry: context → options → decision → why. Open questions are
marked **OPEN** and resolved by a later entry or a BMAD artifact.

---

## D1 · 2026-08-20 — Prompt logging from day zero, verbatim

**Context**: prompts are a first-class deliverable (20% of rubric) and must let a reviewer
follow the thought sequence.
**Options**: (a) reconstruct the log at the end; (b) log every prompt verbatim as it happens.
**Decision**: (b) — `prompts/` with phase folders, one file per prompt: metadata → verbatim
text → outcome. Typos and Spanish/English mixing preserved.
**Why**: a log rebuilt afterwards reads as fabricated; the sequence *is* the evidence.

## D2 · 2026-08-20 — BMAD front and center; custom multi-agent orchestration out of the critical path

**Context**: we have a working multi-agent orchestration setup, but BMAD fluency is 25% of
the rubric and "BMAD as decoration" is an auto-reject.
**Options**: (a) drive the build with our own orchestration and use BMAD artifacts on top;
(b) BMAD drives everything, single-threaded, deliberate prompts; multi-agent reserved for
one adversarial code-review pass at the end, documented as such.
**Decision**: (b).
**Why**: parallel agent swarms generate prompt volume that destroys the reviewer-facing
thought sequence, and heavy process on a deliberately small app reads as over-engineering.
Knowing when *not* to deploy machinery is the judgment being scored.

## D3 · 2026-08-20 — Model strategy: budget tier for development, stronger tier for final passes

**Context**: OpenAI SDK is mandatory. Current pricing (verified 2026-08-20):
gpt-5.6-luna $0.20/$1.20 per M tokens, gpt-5.6-terra $2/$12, gpt-5.6-sol $5/$30.
**Decision**: develop and iterate on `gpt-5.6-luna` (~$0.003 per menu extraction); evaluate
`gpt-5.6-terra` (~$0.032) for final extraction quality; final model choice will be made on
measured extraction quality, not assumption. Flagship tier (sol) excluded — cost without
proportional benefit for structured extraction.
**Why**: total projected spend stays under $5 while keeping a quality upgrade path;
unit cost per extraction feeds BUSINESS.md pricing directly.

## D4 · 2026-08-20 — **OPEN**: confidence flag derivation (reliable / uncertain per dish)

**Context**: the brief leaves the derivation to us — it is an explicitly scored judgment call.
**Evidence captured during infra smoke test**: sent a locally generated 1×1 pure-red PNG to
`gpt-5.6-luna` (JSON mode + vision); it answered `{"color":"brown","ok":true}` — a confidently
wrong answer on ambiguous input. Conclusion: the model's own expressed certainty is not a
trustworthy confidence signal.
**Candidate signals to evaluate in the PRD/architecture phase** (favoring verifiable checks
over model self-assessment): field completeness (missing price/description), price parsing
sanity (numeric, plausible range, currency consistency), allergens explicitly present in
source text vs inferred, source-text traceability of the dish name, and — if worth the extra
cost — cross-run consistency.
**Resolution**: deferred to PRD (needs product framing: what does "uncertain" mean to the
user reviewing a menu?).

**Progress (2026-08-20, product-brief session)** — still OPEN, but the product framing now
exists and an opening position is on the table. The brief fixed the *principle*: the flag is
an attention router ("uncertain" = inspect with evidence in view; "reliable" = eligible for
batch confirmation — never rendered as "safe/verified"), and allergen certainty dominates
the row via an asymmetric gate (any `inferred` or `unknown` allergen ⇒ row cannot be
reliable), guaranteed by deterministic code, not model promises. An ADR-style elicitation
pass produced the opening position for the PRD: **guided self-assessment as input**
(explicit uncertainty criteria in the prompt, per-allergen `declared|inferred` provenance
tags) **+ deterministic post-hoc rules as final arbiter**. This *evolves* the earlier
"self-reported confidence: not used" stance: raw self-confidence remains untrusted (the
smoke-test evidence stands), but criteria-anchored self-assessment is admissible as one
input when deterministic rules hold final authority. Considered and **cut**: dual
extraction + agreement (2× cost/latency — over-engineering for this slice) and per-field
logprobs (impractical with JSON mode). Full options table: the brief workspace addendum
(`_bmad-output/planning-artifacts/briefs/brief-full-stack-challenge-2026-08-20/addendum.md`).

## D5 · 2026-08-20 — Repo private during development, public at submission

**Context**: this is an **open competition** with a public deadline; the deliverable is a
public repo (or granted access).
**Decision**: develop in a private GitHub repo; flip to public just before submitting.
**Why**: a public work-in-progress leaks approach and prompts to competing candidates for
zero benefit; the full commit history remains intact and visible once public.

## D6 · 2026-08-20 — OBS + unlisted upload instead of Loom for the two required videos

**Context**: walkthrough video must be 5–10 min; Loom's free tier caps recordings at 5 min.
**Decision**: record with OBS (screen + camera), host as unlisted link.
**Why**: no length cap, no paid dependency, same reviewer experience.

## D7 · 2026-08-20 — Both videos in English

**Context**: candidate's native language is Spanish; the role is async written/spoken
communication in English with an English-speaking reviewer.
**Options**: (a) record in Spanish (maximum comfort); (b) record in English.
**Decision**: (b), approved by Pablo.
**Why**: the videos double as evidence for the Communication rubric row — recording in
the role's working language is the signal itself; accent or minor slips cost nothing,
a language the reviewer can't follow costs everything.

## D8 · 2026-08-20 — Deadline policy: ship with documented gaps, never slip

**Context**: hard deadline 2026-08-25 in an open competition; 5-day window.
**Decision**: submission goes out mid-afternoon Aug 25 regardless of state; anything
unfinished ships as-is with the gap named in DECISIONS.md. Approved by Pablo.
**Why**: a documented gap demonstrates judgment (Critical Thinking row); a missed
deadline scores zero on every row.

## D9 · 2026-08-20 — Submission front door: thin Notion landing page over the repo

**Context**: the brief accepts "a single link (repo or Notion page) that contains
everything". Pablo has Notion and proposed using it for presentation quality.
**Decision**: yes — strictly as a **thin landing page**: a short personal intro, both
videos embedded, a "reviewer's 5-minute tour" and a deliverables map, all linking into
the repo. The repo remains canonical for every artifact. Approved by Pablo; built in
Phases 5–6 once videos exist (task 6.6b). The Notion URL becomes the single submission link.
**Why thin**: reviewers are engineers and every rubric item is a repo artifact; a Notion
mirror would drift and double maintenance during the tightest days. A landing layer adds
communication polish (10% row) at near-zero risk; a content mirror adds risk with no points.

## D10 · 2026-08-20 — Retraction: "menu → rows in under a minute" → "~3 minutes per menu"

**Context**: the playbook (§2) framed the job-to-be-done as "reviewable rows in under a
minute". During the product-brief session this was pressure-tested: LLM extraction of a
large menu can alone take 30–90 s, and the real bottleneck is not clock speed but where
Ana's attention goes (the uncertain rows).
**Decision**: target retracted to **~3 minutes per menu end-to-end** — realistic, with
margin, still ~10× better than the 15–30 min status quo. The success metric shifts from
raw speed to triage calibration (see brief: Success Criteria).
**Why**: a brief that promises a number its own demo can't hit contradicts itself in front
of reviewers scoring critical thinking; a visible, reasoned course-correction is worth more
than an ambitious round number.

## D11 · 2026-08-20 — Brief-session cuts and restraint (recorded per R-06/R-07)

**Cut — reviewer identity in the audit trail**: persisting *who* confirmed each row implies
user accounts → violates the no-auth guardrail (REQUIREMENTS §4). Reduced to review status +
timestamp per row; single-operator context.
**Cut — anti-alarm-fatigue as a measured metric**: tracking flag-rates over time is
analytics infrastructure (a stated non-goal). Kept as a qualitative health condition in the
brief's success criteria.
**Restraint — party-mode roundtable declined for brief validation**: the elicitation pass
already provided multi-perspective scrutiny (ADR panel, stakeholder rotation, pre-mortem,
inversion) plus a 2×2 coverage audit against all challenge docs; convening a multi-agent
roundtable on an already-audited 2-page brief is heavy process on a small artifact (D2's
rationale). Party mode stays available for a genuinely stuck PRD decision, if one appears.
