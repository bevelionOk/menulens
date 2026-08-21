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

## D4 · 2026-08-20 — **CLOSED 2026-08-21**: confidence flag derivation (reliable / uncertain per dish)

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

**Resolution (2026-08-21, PRD session) — CLOSED.** The hybrid ratified and hardened:
the model supplies *signals only* (per-allergen provenance `declared|inferred`, an
**evidence quote** for every declared allergen, a self-flag raised against explicit
prompt criteria); **deterministic rules T1–T6 are the final arbiter** — T1 allergen gate
(any inferred/unknown ⇒ uncertain, dominant), T2 unparseable price, T3 non-EUR/mixed
currency, T4 empty/untraceable name, T5 self-flag, **T6 evidence verification** (a
declared allergen whose quote is missing — or, on text sources, not found in the source
text — is downgraded to inferred, firing T1: the gate never trusts an unverified
"declared", closing the hole where the gate's own inputs were model output). T4/T6
verification is scoped to text sources; on images the quote is shown and verified by Ana
against the photo — a documented limitation. A menu with no allergen info going 100%
uncertain is **correct behavior**, softened by a menu-level notice, never by the flag.
Full spec: PRD FG3 (FR15–FR21); mechanics: PRD addendum. T1–T6 is the leading candidate
for the single test (R8) — formal justification lands in the architecture phase.

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

## D12 · 2026-08-21 — GitHub setup: one minimal CI workflow, nothing else

**Context**: GitHub Actions is **not** in the challenge's hard requirements — it appears in
JOB.md only as part of the company's infra stack ("Docker, GitHub Actions, Datadog"). So:
does CI map to the lighthouse at all, and if so, how much of it?
**Options**: (a) no CI — defensible, it isn't required; (b) minimal CI — a secret scan over
full git history now, plus a typecheck + single-test job once the scaffold exists; (c) a
full pipeline — build matrix, caching, deploy workflow, branch protection, Dependabot.
**Decision**: (b). One workflow (`.github/workflows/ci.yml`); over the repo's life, two
jobs: `secret-scan` (gitleaks, full history, on every push/PR) from day one; `checks`
(typecheck + the one test) added when code lands — adding it today would just fail on a
repo with no `package.json`.
**Why**: the secret scan directly guards an auto-reject tripwire ("secrets in repo", R12) —
and §7 requires a history scan before submission anyway, so automating it turns a one-shot
manual check into a continuous guarantee. The workflow also demonstrates the company's own
infra stack (alignment signal, stack row) at ~20 lines of YAML. (c) is deployment infra for
an app with no deployment target — the over-engineering the brief names as auto-reject.
**Cut**: branch protection rules, CODEOWNERS, PR/issue templates, Dependabot, release
workflows, environments — solo repo, 4-day window; each is process ceremony with no rubric
row behind it.
**Verified during setup (2026-08-21)**: `.env` never entered git history; local `main` in
sync with origin; upstream challenge repo unchanged (HEAD `6be4b93`, still no public Q&A);
`gh` authenticated with `workflow` scope. First local gitleaks run flagged 1 finding —
a **false positive**: BMAD's install manifest (`_bmad/_config/files-manifest.csv`) stores
sha256 content checksums per installed file, which trip the generic-api-key entropy rule.
Allowlisted that one path in `.gitleaks.toml`; re-scan of all 15 commits: no leaks.

## D13 · 2026-08-21 — Extraction processing model: persist-first + polling, one technical timeout

**Context**: the playbook's opening position was "synchronous request with visible
progress, timeout ~60 s". Pablo distrusts timeouts from experience and asked whether the
process could be durable without queue infrastructure (a guardrail). Explored in the PRD
session via advanced elicitation — five methods run and integrated.
**Options**: (a) pure sync; (b) persist-first: the menu row is created at submit
(status + stage columns), extraction continues as an in-process promise, the client polls;
(c) SSE/WebSocket progress; (d) a real queue.
**Decision**: (b). One technical timeout in the whole system — the OpenAI call (~120 s);
staleness (>3 min without a stage transition) is derived at read time; retry = a new
cheap run. The waiting UI obeys the operating principle: real stages, measured elapsed
time, a static calibrated expectation — no percentage bars, no dynamic ETAs.
**Why**: two inherited assumptions fell under first principles — the guardrail bans queue
*infrastructure*, not in-process async; and a 60 s timeout would fail exactly the large
menus that most need the tool. "Durability" split in two: durability-as-resumability was
**cut** (it protects ~$0.003 and a minute of waiting with auto-reject machinery);
durability-as-honest-state is in and costs a status column plus polling. The browser
watches state; it does not hold the process.
**Cut**: queue/worker, SSE/WebSocket, dynamic ETA, percentage bars, resumable extraction,
idempotency keys, background reaper. Full ADR: PRD addendum.

## D14 · 2026-08-21 — Descriptions: from "never generated" to provenance-labeled

**Context**: Pablo's opening position was extractive-only — the model never writes a
description; absence is reported as absence. A party-mode roundtable countered with R6
evidence: the challenge requires a one-line description per dish, and most real menus
describe nothing — the required column would sit empty on most rows.
**Decision**: reuse the allergen-provenance pattern — a description is `extracted` when
the menu provides one, `generated` (visibly labeled) when the model wrote it. Description
provenance never touches the confidence gate: triage asymmetry belongs to allergens alone.
**Why**: the system may say things the menu doesn't *only by confessing it* — a labeled
`generated` is more honest than an empty cell, which can't distinguish "the menu has none"
from "nobody looked". A visible position change under evidence, adopted because the
counter-argument used the product's own pattern.

## D15 · 2026-08-21 — PRD finalize gate: 8 bounded subagents, heartbeat-watched (R-11)

**Context**: the PRD's Finalize step prescribes reviewer/reconciler subagents. D2 keeps
multi-agent orchestration out of the critical path, and this machine has a history of
stalled agents (R-11); Pablo's standing rule: tooling like this must be documented in the
files, never tacit.
**Decision**: run the gate as 8 bounded, single-purpose subagents (5 input reconcilers +
rubric walker + over-engineering hawk + BMAD-fluency auditor), watched by a 5-minute
active heartbeat that stats each worker's transcript and resumes any that stall
(mitigation now recorded in RISKS.md R-11). D2 stands: the planning conversation itself
remains single-threaded; these are BMAD's own finalize reviewers, not a parallel build
swarm. Also recorded: web/market research was deliberately omitted this session — the
product is fixed by the challenge and domain research earns nothing (INTERPRETATION.md).
**Outcome**: verdicts strong / pass-with-fixes / pass-genuine; the gate caught real
issues — T4/T6 assumed source text that photos don't have (fixed by scoping), the scanned
PDF cut (E6) lacked a recorded justification (now here: native system deps endanger the
5-minute README; a zero-dep OpenAI native-PDF input is queued for verification in
architecture — a yes eliminates E6), and two speculative mechanisms (image downscaling,
a HEIC conversion-lib fallback) were cut. A Build Priority ladder (P0 = the challenge's
letter; P1 = what makes it a product; P1 falls entirely before P0 loses a line) now feeds
the D8 deadline policy.
