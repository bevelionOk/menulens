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
record — D10." Shows course-correction under evidence.

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

**33. The spec is the only thing the implementer ever saw** `[WHY]` `[JUDGMENT]`
First build session (Story 1.1, worktree `bmad/build-1-1`). The build workflow's shape:
investigation drains into a ~1.4k-token spec, the human approves it at a checkpoint, and
a fresh-context subagent implements from the spec alone — no conversation history, no
accumulated context to rot. The spec's Boundaries carried the guard explicitly ("Never:
Drizzle (1.2), router wiring (1.7), the test (1.8), config polishing") so scope was
enforced by the artifact, not by vigilance.

**34. R-13 played out on day one — and the answer was deletion, not configuration** `[JUDGMENT]` `[BREAKS]`
The fresh-majors risk logged at architecture time materialized immediately: the official
scaffold pinned TypeScript 6.0.3, not the spine snapshot's 7.0.2 (snapshot = reference,
never a target — took the scaffold's pin); TS 6 hard-errors on the shadcn guide's
`baseUrl` (dropped it, `paths` suffices); Vite 8 deprecates `__dirname`. Sharpest case:
two *official* scaffolds collided — the Tailwind/shadcn init replaces `index.css`,
orphaning the Vite demo's CSS variables, leaving a half-styled page. The fix was deleting
the demo remnants, not building config to reconcile two scaffolds' outputs.

**35. Eighteen findings, one arbiter: the guard** `[JUDGMENT]` `[WHY]` `[BREAKS]`
Three blind review layers returned 18 findings; triage split them 7 patch / 3 defer /
8 reject, every reject naming its rule. The patches were all correctness (a phantom `zod`
dependency all three layers caught independently; a fresh clone hitting Node's ENOENT
instead of the promised "Zod names the variable"). The honest one: the *only* nontrivial
runtime behavior this story ships — env fail-fast — has no automated observer, and even
1.8's golden-master (valid env only) will never execute it. Not swept: deferred as an
explicit decision Story 1.8 must make inside the one-test constraint (sub-assertion in
the single test file, or recorded manual-only). What breaks in production is exactly the
branch nobody's test runs.

**36. The close-out audit, run as a 2×2** `[PERSONAL]` `[JUDGMENT]`
Pablo closed the session with four questions: considered-and-should (ACs traced 1:1,
guard applied at plan AND triage)? considered-and-shouldn't (a product name slipped into
a patch as `<title>MenuLens</title>` — unratified naming smuggled in a cosmetic fix)?
not-considered-but-should (the upstream-repo diff habit ran late, at close instead of
session start; the web production build was never smoke-run)? not-considered-and-rightly
(no k8s, no queues, no hand-upgrade to TS 7, no machinery for a port conflict that only
exists on this machine)? The misses were small and named — which is the point of asking.

---

## Session 7 — Story 1.2: Shared Contract & Data Layer (2026-08-21)

**37. One base schema per entity — the rule that keeps three consumers honest** `[WHY]` `[JUDGMENT]`
The contract is six small files where every variant is a `.pick()/.extend()/.omit()` of
one base: the model-signal shape *is* the dish row minus what the server assigns, plus
the self-flag — which is why the model can never smuggle a verdict, only signals. The
AD-14 failure enum is assembled from its three subsets (pre-run / stored / derived)
instead of re-spelled, so the "never stored" and "derived at read" distinctions exist in
the type system, not only in prose. Keys are snake_case on the wire and in the DB on
purpose: the DB row, the JSON, and the golden are one shape, zero mapping code.

**38. The review made the contract stricter — and that was the point** `[JUDGMENT]` `[WHY]`
The first cut of the error envelope accepted every AD-14 code. A reviewer noticed what
the design already said: pipeline failures are persisted on the run and read via GET;
they never travel in an envelope. The wide enum claimed codes no endpoint can emit.
Narrowed to pre-run + three HTTP codes — Pablo's call was "the value is in being
stricter": the same principle as the product ("never claim more than provable"),
applied to a type. Also a visible spine seam closed: the conventions said envelope codes
come from AD-14, which had no word for a 409/404 — three literals, guard-checked.

**39. What breaks in production: the `error` listener nobody writes** `[BREAKS]`
A `pg.Pool` without an `'error'` handler is fine for weeks — until Postgres restarts or a
connection drops while a client sits idle: the EventEmitter throws and the process dies,
taking every in-flight run with it. AD-14 says the failure path never throws; the review
caught that the data layer violated it before a single route existed. Same family,
deferred with an owner: no connection timeout means a dead database produces hanging
requests, not honest 5xx — decided when 1.3 issues the first query. And the migration
runner inherits the env fail-fast, so CI will need a dummy API key to migrate — found by
running it, logged for 1.8.

**40. The 2×2 audit, second run** `[PERSONAL]` `[JUDGMENT]`
Considered-and-should: every AC verified by me, not only by the implementer (live `\d`,
idempotent re-migrate, the I/O matrix re-executed, a clean `npm ci` after the worker
hand-edited the lockfile). Considered-and-shouldn't: a token-count ceremony that asked
Pablo to pick between a split nobody wanted and the obvious "keep". Missed-and-should:
the CI dummy-key requirement the worker flagged and I didn't log; the 5432 clash that
isn't only this machine's; a read-race I rejected without saying why. Not-considered-and-
rightly: check constraints, indexes, cascades, reconnect logic, `.refine()`s that would
have broken T6's downgrade path, and "there are no tests" (R8). The misses were small and
named — asking the four questions is what makes them small.

## Session 8 — Story 1.3: Persist-First Run Lifecycle API (2026-08-22)

**41. A run is born before anything happens to it** `[WHY]`
`POST /api/runs` validates, checks seriality, writes one transaction (row + uploaded
bytes) and answers with an id — nothing else. The stage is `null` at birth on purpose:
the first real transition belongs to the fetcher, and a stage name with nothing behind
it would be the theatrical progress FR4 bans. Close the tab and the run is still there;
until the pipeline exists, every run ends `interrupted` by the staleness net, which is
the honest answer for a system that accepted work it cannot yet do.

**42. One rule, two callers — and the review caught the code lying about it** `[JUDGMENT]`
The spec's frozen intent said the 409 gate and the read path use the same pure function
for "active". The first implementation re-encoded the rule in SQL for the gate; both
paths agreed on every manual check, so nothing failed. A verification-gap reviewer read
the comment that claimed the route calls `isActive`, grepped, and found it didn't. Fixed
by making the repo return data and the route decide — the kind of drift that only
becomes a bug in 1.5 when someone changes stage semantics in one place and not the other.

**43. What breaks in production: `constructor` as a mimetype** `[BREAKS]`
An accept-list written as a plain object does a prototype-chain lookup: a multipart part
labeled `constructor` returns a function, skips the 415, and reaches the insert with
garbage. A `Map` fixes it in one line — the point is not the fix but that an adversarial
pass over a twelve-line validation found a hole two careful readings missed. Same family,
deferred with owners: two model attempts at 120 s each outlast the 3-minute staleness
threshold, so a live run could read as interrupted and admit a second one — a budget
1.5 has to keep, now written down instead of discovered in a demo.

**44. The 2×2 audit, third run** `[PERSONAL]` `[JUDGMENT]`
Considered-and-should: scope checked against the neighbouring stories before planning
(list → 3.1, artifact → 2.4), the four design calls surfaced at the checkpoint instead of
buried in code, the whole matrix re-run by me after the worker. Considered-and-shouldn't:
a partial unique index for the seriality race — atomic, and a permanent deadlock after
one crash. Missed-and-should: the spec told the implementer to write the gate in SQL
(Code Map) while the frozen block said "same function" — the drift was mine before it was
the worker's. Not-considered-and-rightly: response schemas, sniffing, statement
timeouts, a stage heartbeat, a second test. The drift is the lesson: the Code Map is
the implementer's map, and it has to agree with the intent above it.

---

## Session 7 · 2026-08-22 — Story 1.6 review, the scope audit (D24), and M1

**45. The bug that only an emoji could find** `[BREAKS]` `[JUDGMENT]`
The evidence offsets — the thing that lets the UI point at the exact words the model
quoted — were indexed by code point while `indexOf` counts UTF-16 code units. One emoji
anywhere before a matched quote and the highlight slides, or the lookup runs off the end
and throws: uncaught, the whole run dies and reads `interrupted`. Menus are full of 🌱 and
🌶. Reproduced on camera in one line: `findNormalized('🌶 Picante — contiene lácteos',
'contiene lacteos')` → `RangeError`. Nothing in the acceptance criteria would ever have
caught it; the flags, the reasons, the counts and the status are all identical whether the
offsets are right or wrong. Three parallel reviewers over a 300-line diff found it.

**46. Refusing is a feature: the price that would have deleted a run** `[BREAKS]`
`price_value` is `numeric(10,2)`. A model that reads a phone number as a price produces a
value the column cannot hold — and the insert happens inside the transaction that writes
all the dishes plus `done`, so one junk string discards eleven correctly triaged rows and
leaves the run `processing`. The fix is not a bigger column: an implausible number now
refuses like any other ambiguity and fires T2. The same instinct, one story later:
`"1.250 €"` parses as `1.25` and can still be marked auto-checked — that one is NOT fixed,
because widening the rule is Ask-First; it is written down as B14 instead of guessed at.

**47. 112 milliseconds per megabyte, once per quote** `[BREAKS]` `[NEXT]`
The pinned normalization chain ran once per dish name and once per allergen quote against
a source that can be 10 MB. Measured: ~112 ms per megabyte, ~120 passes per run, on the
single process that also answers the polling UI. The page would have frozen for tens of
seconds while claiming to be honest about progress. Now the chain runs once per run. A
performance bug that was really an honesty bug.

**48. The audit I asked for against my own plan** `[JUDGMENT]` `[PERSONAL]`
The camera line of the whole project: "At every planning session I asked whether this was
over-engineering, and I was told the stories didn't count. Six stories in, I stopped and
put three agents on it — one against the brief, one measuring what each story actually
cost, one designing the smallest submittable path." The verdict: of the 40 unbuilt
acceptance criteria, **four** were required by an explicit line of the brief; roughly
twenty-six answered requirements we had written for ourselves. And the evidence was
already in the repo — our own over-engineering review had flagged it HIGH the day before,
and the answer had been priority labels instead of deletions.

**49. The cut, in writing, before the deadline forced it** `[JUDGMENT]`
D24: stories 1.7, 2.1 and 2.2 merged into one deliverable; 1.7's throwaway table cut;
stories 2.3 and 2.4 deleted whole; 3.1 folded into the submit page; story 1.8 capped at
exactly one test. **Seven stories became four deliverables, eleven acceptance criteria
deleted.** The number that made the case: stories 1.3 and 1.6 produced more lines of
specification than of code (0.81:1 and 0.94:1), because a spec costs the same whether the
story is 260 lines or 760. The problem was never the process — it was that the stories had
been cut too small for it. Show the diff of the decision, not a slide about agility.

**50. What we cut is in the PRD, annotated, not deleted** `[JUDGMENT]` `[PERSONAL]`
FR20, FR23, FR26 and FR27's reopen affordance will not exist in this submission, and they
are still in the PRD marked as cut. "I would rather show you a requirement I chose not to
build than pretend I never wanted it." Same logic one level down: the review endpoint
accepts `reopen` because the contract is whole, but the button is gone with story 2.3 —
server yes, UI no, recorded as a known limitation instead of quietly half-built.

**51. Two lanes, one screen** `[WHY]` `[NEXT]`
M1 is the product finally visible: paste a URL or upload a photo, watch honest stages with
a measured timer — no percentage bar, no invented ETA, no lone spinner — and land on a
table that says "auto-checked" or "needs review" per row, with the fired rules spelled out
underneath ("T2 no unambiguous price value · T5 the price is listed as *según mercado* and
is not fixed"). Server and UI were built as two parallel lanes against a contract that was
already written, because the schemas had been in `shared` since story 1.2 and had been
sitting there unused, waiting.

**52. The demo of the invariant, not of the feature** `[WHY]` `[BREAKS]`
Best 30 seconds of the walkthrough: confirm a row in the UI, then show the md5 of every
extracted column — byte-identical before and after. Then post a batch containing one
forged dish id and show the 400, and that the *valid* decision in the same batch was not
applied either. The review is a verdict about the data; it can never become an edit of it.

**53. The 2×2 audit, fourth run** `[PERSONAL]` `[JUDGMENT]`
Missed-and-should, all mine: `git add -A` with two agents writing in the same worktree
swept one lane's local config into an unrelated commit; I broke an acceptance criterion of
my own spec (three dependency entries where it says two) and recorded it as an amendment
rather than let it slide; and the anti-progress-bar grep I wrote as a verification command
now returns twenty false positives, so it no longer distinguishes a violation from noise.
Not-considered-and-rightly: deleting the evidence offsets, the seriality gate and the
review columns — surgery on untested code two days out, explained in writing instead.
