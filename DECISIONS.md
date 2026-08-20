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
