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

## D16 · 2026-08-21 — The single test (R8): integration golden-master, superseding the unit-arbiter front-runner

**Context**: the PRD left the single-test choice open with the pure T1–T6 arbiter unit
test as front-runner. During architecture, Pablo challenged it: with a budget of exactly
one test, breadth of *meaningful* coverage is the variable to maximize.
**Options**: (a) unit test over the pure arbiter — sharpest signal on the core promise,
but blind to every boundary (API contract, persist-first lifecycle, Zod at the LLM
boundary, the Drizzle/JSONB round-trip); (b) Playwright E2E — the company's tool, but it
rides the real OpenAI API: uncontrollable non-determinism, a flaky test in a challenge
repo; (c) **integration golden-master** — POST a fixture through the real API with the
OpenAI client mocked at its injected seam and a real Postgres, poll to completion, assert
the normalized final payload against one golden.
**Decision**: (c), with discipline that keeps the arbiter's coverage embedded: the mocked
model response is crafted to fire **every rule T1–T6 including the T6 downgrade, plus one
fully reliable row**; golden normalization is pinned (ids/timestamps frozen, ordering by
`position`); **one scenario, one fixture, one golden** — it reads as one test because it
is one. CI runs it against a Postgres service container (still D12-minimal).
**Why**: the one-test budget rewards crossing every critical boundary at once; the fixture
*is* the arbiter test in disguise, and the golden's diff still names the rule that broke.
A visible course-correction in the D10 style. Spine: AD-13.

## D17 · 2026-08-21 — PDF path: hybrid by source class; E6 retired

**Context**: web verification confirmed OpenAI's native PDF input (Responses API
`input_file`) — but revealed the PRD's "a yes eliminates E6" was not free: sending PDFs
natively leaves no local ground text, which would silently kill T6 machine-verification
and the FR23 "what the system read" tab on the most common menu format.
**Options**: (a) text-layer extraction only (PRD literal — E6 stands); (b) native-only
(zero deps, but the gate weakens on *all* PDFs); (c) **hybrid by class**: pdfjs-dist
extracts the text layer (ms-scale, negligible vs the 30–90 s model call); a PDF with
usable text is a **text-class** source (text to the model, T6 verifies, tab complete); a
scanned PDF joins the **visual class** that photos already occupy (native PDF to the
model, Ana verifies against the original).
**Decision**: (c). The invariant got *cleaner*: T6 scope, model input, and the evidence
tab all key on **class (usable ground text), never file type** — and E6 disappears as a
failure state instead of being "supported" by weakening the gate. Coherence note argued
at the gate: accepting pdfjs while having cut the HEIC lib is consistent — deps are
allowed on *required* input paths (R5), not on speculative edge cases with a free OS
fallback. Caveat verified by execution: pdfjs-dist v6 needs its prebuilt optional
`@napi-rs/canvas` in Node (npm-only holds; never install with `--omit=optional`; Node
≥22.13). Also recorded: **structured outputs (`zodTextFormat`, strict JSON schema) are
the current form of the brief's "JSON mode"** — same guarantee, stronger contract;
verified working with Zod 4 by execution. Spine: AD-6, AD-12; PRD amended in place.

## D18 · 2026-08-21 — Architecture session gate: ratified under attack, rectified by addition

**Context**: per session plan, the full decision set went through a 5-method advanced
elicitation pass (Assumption Audit, Critical Perspective, Second-Order, Cascading
Failure, Boundary Sweep) plus the spine Reviewer Gate — 6 bounded subagents (3 input
reconcilers + rubric walker + web-verification lens + adversarial two-units lens),
heartbeat-watched per R-11.
**Outcome**: 6/6 pass-with-fixes, zero critical, zero over-engineering findings, zero
contradictions. The set was **ratified** (no decision reversed) and **rectified by
addition**: 9 seam-closing rules from elicitation (class threshold, pinned T6
normalization, content-type-decides-source, schema-family derivation, artifact isolation,
server-side seriality, test/prompt discipline, SSRF residual named, failure containment +
PRD-update sequencing), then ~20 gate fixes. The adversarial lens caught a **real
specification bug**: "strip diacritics" *after* NFKC is a no-op — the pinned order is now
NFKC → lowercase → NFD → remove combining marks → collapse whitespace; without it, two
builders would produce different confidence flags on identical Spanish menus. Other
notable closures: pre-run rejections (E1/E4/E5) never create run rows; "active run" for
the 409 is bounded by the staleness threshold (deadlock fix); one review-mutation
endpoint (single = batch of one, reopen included); T6 match offsets persisted so the
frontend never re-implements matching; acquired text served `text/plain` (stored-XSS).
New risk logged as R-13 (fresh-major toolchain convergence). Full reports:
`_bmad-output/planning-artifacts/architecture/architecture-full-stack-challenge-2026-08-21/reviews/`.

## D19 · 2026-08-21 — Epics & stories: 3 value epics, 13 priority-pure stories, tag-safe cut ladder

**Context**: decomposing PRD FR1–FR36 + the 14-AD spine into implementable stories
(`_bmad-output/planning-artifacts/epics.md`). With both upstream artifacts final and
gate-audited, the epic-design principle is fewer/larger epics cut only at genuine value
boundaries — organized by user value, never technical layers.
**Options considered**: (a) epic per PRD feature group (6 — file churn: FG2/FG3 build one
pipeline, FG6 lives inside every path); (b) 2 epics merging History into Review; (c) a
separate failure-states epic; (d) **3 epics mirroring the loop**: Extract & Triage /
Review & Confirm / History.
**Decision**: (d). History stays separate on Pablo's UX argument: it is not a
post-processing phase but *the other view of runs in any state* — mixing unprocessed runs
into the review flow would confuse the operator (finding/resuming/defending work vs doing
it). A failure-states epic was rejected on principle: honest failure is an acceptance
criterion of each pipeline story — an epic that ships without its failure states ships
dishonest, and a later "failure epic" re-churns the same files. Story compression was
bounded by one rule (Pablo's): **no story mixes P0 and P1**, so the D8 ladder can cut P1
stories whole (2.3 batch/reversibility/notice, 2.4 evidence panel) without touching P0;
the single exception is one tagged `[P1]` AC (FR5 expectation copy) inside Story 1.7.
Result: 13 stories (E1: 8 · E2: 4 · E3: 1), each sized for one dev-agent session, no
forward dependencies (a 1.3 run with no pipeline yet ends honestly as `interrupted`).
**Ladder fix**: FR30 (open a run from History) was absent from the PRD's P0/P1 lists;
ratified **P0** — FR3's promise ("the run is found in History") is useless if the found
run can't be opened, and the deep link costs a route, not a feature.
**Restraint (D11 style)**: Party Mode and per-story elicitation declined — both upstream
artifacts already carried 8- and 6-reviewer gates, and story-level risk is
verification-shaped, not vision-shaped. One advanced-elicitation pass over the *complete*
story set instead; per-story ceremony would burn the 4-day window for marginal return.

## D20 · 2026-08-21 — Story-hardening closures from the epics session

Small decisions closed while writing stories, recorded so none becomes tacit:
**SSRF failure code**: a runtime SSRF refusal reuses `unreachable_url` with an honest
message instead of adding an `ssrf_refused` code — AD-14's enum is closed, a new code
would require a spine amendment, and E2's actionable copy (retry / switch to PDF-photo)
fits. **Fetcher scope guard** (anti-over-engineering, now an explicit AC in Story 1.4):
the URL fetch is one plain GET per submitted URL via Node's built-in `fetch` — no
crawling, no JS rendering/headless browser, no retry loops, no third-party HTTP client;
a page that yields no text gets the honest E3 answer, never more machinery. **Golden
per-rule guarantee** (Story 1.8): the golden asserts each fired rule *by id* in
`confidence_reasons`, so the single test fails naming the rule if any of T1–T6 stops
firing — the per-rule guarantee is what makes one test carry the arbiter's coverage
(strengthens D16). **Review contract whole** (Story 2.1): the endpoint implements the
full AD-9 action enum including `reopen` even though the reopen *UI* is P1 — splitting a
closed contract across stories fragments it; marginal cost ≈ zero. **UX-3 accessibility**:
no custom a11y workstream — the stock shadcn/ui (Radix) baseline (keyboard operability,
ARIA semantics) is the decision; single named desktop operator, not requested by the
challenge, and a custom a11y epic would violate the over-engineering guard. (Completes
the session-start UX audit: visual identity = stock shadcn, desktop-first — both already
decided upstream.)

## D21 · 2026-08-21 — Build session 1 (Story 1.1): scaffold-pin resolutions and review triage

**Context**: first `bmad-build` session (worktree `bmad/build-1-1`) — official scaffolds
on the fresh-major stack (R-13), then the workflow's three-layer adversarial review.
**Scaffold-time resolutions (R-13 applied: toward the default, never custom)**:
TypeScript landed **6.0.3** (create-vite's pin), not the spine snapshot's 7.0.2 — the
snapshot is a reference, never a target; `baseUrl` dropped from the shadcn guide snippet
(TS 6 hard-errors on it, `paths` alone suffices); `import.meta.dirname` over `__dirname`
(Vite 8 deprecates it for its native config loader). Two official scaffolds collided —
the Tailwind/shadcn init replaces `index.css`, orphaning the Vite demo's CSS variables —
resolved by **deleting** the demo remnants, not configuring around them.
**Review triage (18 findings → 7 patch / 3 defer / 8 reject)**: patches all
correctness-shaped (phantom `zod` dep caught by all three layers, `--env-file-if-exists`
so a fresh clone reaches the Zod message instead of ENOENT, env-schema tightening
(postgres scheme, trimmed key, bounded port), loopback-only Postgres bind, `@types/node`
aligned to runtime 22, demo trim, proxy-coupling comment). Deferred with owners in
`_bmad-output/implementation-artifacts/deferred-work.md`: the env fail-fast branch has
**no automated observer** and even 1.8's golden-master (valid env only) will never
execute it — Story 1.8 must either fold a sub-assertion into the single test file or
record the branch as manual-only here (the sharpest finding of the session); compose
healthcheck waits for the first DB consumer (1.2); `server/test` tsconfig include widens
when the test lands (1.8). Rejected under the guard, each naming its rule: engine-strict/
.nvmrc, CI boot/build steps beyond AC5, oxlint wiring, a synthetic `shared` import (1.2
exercises the seam for real), `--kill-others-on-fail` (a no-op under tsx watch — the
suggested fix doesn't do what it promises), compose port parametrization for a
machine-local conflict, credential-drift machinery.
**Name ratified post-audit**: the close-out 2×2 flagged `<title>MenuLens</title>` as an
unratified naming decision smuggled into a review patch. Verified against the challenge
docs: naming is nowhere a requirement (BRIEF's "name" is a dish field; the task is
"deliberately unrelated to our actual product"), and the repo was already `menulens`.
Pablo ratified keeping it (2026-08-21).

## D22 · 2026-08-21 — Build session 2 (Story 1.2): contract conventions, the envelope-code gap, review triage

**Context**: second `bmad-build` session (worktree `bmad/build-1-2`, from main `41794ac`).
The story turns the spine's shapes into code: `shared` as the single contract, the
Drizzle schema with the challenge's "real migration" (R2), and the repos that embody the
two read invariants (server-assigned `position`; artifact bytes never in list queries).
**Conventions closed while writing the contract**:
- **Keys are snake_case on the wire and in the DB; TS identifiers are camelCase.** Data
  keys are contract, not identifiers — every AD and AC already spells them that way
  (`price_raw`, `dish_id`, `confidence_reasons`), so the DB row, the API JSON, and the
  1.8 golden carry one shape with zero mapping layer. Drizzle's `casing` auto-mapping is
  banned: a column is spelled once. Timestamps are the one declared boundary: `Date` in
  rows, ISO-8601 strings once Fastify serializes — the `shared` schema describes the wire.
- **Model-signal schemas are strict-structured-output compatible** (`.nullable()` never
  `.optional()`, no defaults, closed enums) so 1.5's `zodTextFormat` consumes them as-is.
- **Dish-level `unknown` = empty `allergens` array** (FR13/FR21) — no column, no tri-state.
- **`bytea` via `customType`**: verified against the drizzle-orm 0.45.2 tarball that
  pg-core ships no native bytea; R-13 practice — check the artifact, not the docs.
- **Migrations run by an explicit script, never at boot** (`db:migrate`, programmatic
  migrator, folder resolved from the file so CI's cwd is irrelevant).
**The envelope-code gap (a real spine seam)**: the conventions table says error-envelope
codes come from the AD-14 enum, but AD-14 has no code for a 409 (active run, FR35), a
404, or a malformed review body (2.1). Resolution, checked against the over-engineering
guard (each code maps to a *required* behavior; three literals, no error taxonomy):
`apiErrorCodeSchema = pre-run reasons ∪ run_active | not_found | invalid_request`. The
run's `failure_reason` enum stays closed (AC3). **Course-corrected by the review**: the
first cut spread the *whole* AD-14 enum into the envelope; a reviewer pointed out that
stored reasons travel in `runs.failure_reason` via GET and never in an envelope, so the
wider type claimed codes no endpoint can emit. Narrowed — Pablo's call: "the value is in
being stricter" — the contract now draws AD-14's two failure channels exactly.
**Review triage (3 layers, ~47 raw findings → 5 patch / 3 defer / rest reject)**:
patches were containment- and robustness-shaped — a `pg.Pool` with **no `error`
listener crashes the process on an idle-client error** (Postgres restart; AD-14 says the
failure path never throws — "what breaks in production" material), a cwd-relative
migrations folder, a `returning()` row guard, the serialization-boundary comment, a
healthcheck made consumable (`up -d --wait`, `start_period`/`retries`). Deferred with
owners: a schema↔SQL drift guard in CI (decide in 1.8 against R8 — build-time check,
not a test, but the distinction must be argued), `connectionTimeoutMillis` (DB down =
hang forever; 1.3), a dummy `OPENAI_API_KEY` for `db:migrate` in CI (1.8). Rejected
under the guard: check constraints, indexes, cascades, `pgEnum`, reconnect logic,
UUID validation inside repos (the route's job), `.refine()`s that would break the
model-signal path (T6 must *accept* a `declared` allergen without a quote in order to
downgrade it), "no tests" (R8). One correct rejection worth recording: `getRunWithDishes`
reads run and dishes in two statements — a poll landing mid-`saving` can see
`processing` with dishes for one tick; the next poll heals it, a transaction would be
machinery for a flicker.
**Local-environment note (not a repo change)**: port 5432 was held by another project's
Postgres on the dev machine; the session ran the challenge DB on 5433 through a compose
override kept outside the repo. Compose stays on 5432 — an evaluator with a local
Postgres hits the same clash; recorded as a known limitation for the README, not
parametrized (D21's rejection stands).
