# Adversarial Review — Over-Engineering Hawk

Reviewed: `prd.md` + `addendum.md` (2026-08-21) against REQUIREMENTS.md §4 guardrails and
docs/challenge/BRIEF.md. Stance: a hiring reviewer will auto-reject anything that *smells*
over-engineered; the named list (microservices, k8s, event bus) is exemplary, not
exhaustive. Both directions attacked.

**Verdict: PASS WITH FIXES.** No named tripwire is violated — no queues, no SSE, no auth,
no workers, and the cut list is genuinely disciplined. But the PRD carries two speculative
dependencies that fail its own guard question, a stage display that violates its own
no-theater rule, and — the largest risk — a feature mass that reads fine on paper and
becomes an over-engineering smell the moment it ships half-done. Two cuts in the other
direction put hard requirement R5 at demo-failure risk on the reviewer's most likely test
inputs.

---

## Direction 1: Over-engineering findings

### OE-1 · HIGH — Feature mass vs. "a small full-stack app" and a 4-day runway

**Where:** the whole PRD — 36 FRs, 5 NFRs, 9 failure states, dual-tab evidence panel with
quote highlighting, batch operations, reversible resolution, live history.

**Perception risk:** The brief's task statement ends with "That's it." A reviewer who
clones the repo and finds a 36-FR surface implemented at 70% will not read "ambitious";
they will read "no judgment about scope" — which is the over-engineering rejection in its
most common real-world form. The PRD's individual justifications are mostly sound
one-by-one; the aggregate is the risk. Deadline is 2026-08-25; architecture, stories,
implementation, one test, README, DECISIONS.md, BUSINESS.md, and two videos all still have
to happen. A complete modest slice beats an incomplete honest one — the honesty principle
itself is falsified by shipping FRs that don't work.

**Does the stated justification hold?** Each FR traces to the brief's review-loop framing,
so no single FR is indefensible. What's missing is a priority ladder: nothing in the PRD
says which FRs are the spine and which degrade gracefully if time runs out.

**Cheapest fix:** Before architecture, mark a core/flex line in the PRD (or sprint plan):
core = R1–R12 coverage + T1–T6 + evidence panel + confirm/follow-up + history list; flex =
batch multi-select (keep only "confirm all auto-checked"), reversibility, quote
highlighting, review-progress counts, FR20 notice. Cutting from flex late must be a
pre-authorized move, not a scramble.

### OE-2 · MEDIUM — Server-side image downscaling (FR2, addendum FG2)

**Where:** FR2 ("optimizing what reaches the model (server-side downscaling) is the
system's job") and addendum: "server downscales images before the vision call".

**Perception risk:** This drags an image-processing dependency (sharp = native binaries,
brushing against the project's own no-native-deps rule R-10; pure-JS alternatives are slow
and add code) into a demo to save token cost on an operation the PRD itself prices at
$0.003–0.032. A reviewer sees an image pipeline optimizing pennies in a 4-day slice —
textbook gold-plating. It fails the §4 guard question: it maps to no line in §1–§2 and no
rubric row (NFR2 is about *measuring* cost, not micro-optimizing it).

**Cheapest fix:** Cut. Keep the 10 MB cap, pass the image through as-is (the OpenAI API
accepts it, and vision pricing auto-scales images down anyway). One DECISIONS.md line:
"downscaling cut — optimizes cents, costs a dependency" earns Critical-Thinking points;
the pipeline earns suspicion.

### OE-3 · MEDIUM — The HEIC WASM-conversion-library fallback (FR1, addendum FG2)

**Where:** FR1: "fallback if it fails verification: a dependency-free conversion library";
addendum: "fallback: WASM-based conversion lib".

**Perception risk:** A WASM HEIC decoder shipped in a hiring demo to handle a file type
the brief never mentions (R5 says PDF/image; JPG/PNG/WebP satisfy it) is speculative
machinery for an edge case — exactly §4's "speculative features" clause. The pre-committed
fallback is a trap: if the iOS auto-conversion check "fails" during a rushed architecture
phase, the lib gets pulled in by prior decision rather than fresh judgment.

**Cheapest fix:** Reword the fallback. If auto-conversion doesn't verify, the fallback is
**E4** — the raw-`.heic` error path that already exists ("export as JPEG or screenshot").
Never a conversion library. Delete the lib option from both files; E4 already covers the
failure honestly, which is the product's whole brand.

### OE-4 · MEDIUM — Stage display violates its own no-theater rule (FR4/FR5)

**Where:** FR4's five stages: `fetching_source → extracting → validating → saving → done`.

**Perception risk:** `validating` and `saving` last milliseconds. FR4 bans "theatrical
sub-stages", but displaying stages no human can observe *is* theater — they exist to make
the progress UI look richer. A reviewer who reads the honest-progress manifesto (FR5,
addendum's Map-Is-Not-the-Territory section) and then watches two stages flash by in one
polling interval catches the PRD contradicting itself, which is worse than either sin
alone. Polling at 1–2 s can never even render them.

**Cheapest fix:** Reword FR4: internal states may be five, *displayed* stages are the ones
with observable duration — `fetching_source`, `extracting`, terminal. One sentence.
No code impact.

### OE-5 · MEDIUM — FG4 review-workflow breadth exceeds the brief's ask

**Where:** FR22, FR26, FR27, FR29's progress counts — two batch mechanisms (confirm-all
+ free multi-select), reversible resolution with derived done-state, per-run
"12 of 15 resolved" tracking.

**Perception risk:** The brief asks for extraction results "persisted to Postgres and
shown in a clean UI." The PRD adds a full review workflow layer. The triage→confirm loop
is legitimately the product's point (the confidence flag is required, and triage is its
only payoff — this justification holds). But *two* batch mechanisms plus reversibility
plus progress tracking is workflow-tool feature count, and features are machinery to this
reviewer as much as infra is.

**Cheapest fix:** Defend the loop, trim its interior. Keep: confirm / mark-for-follow-up,
"confirm all auto-checked" (the triage payoff), note column. Demote to flex (per OE-1):
free multi-row selection (FR26's second mechanism), FR27 reopening, progress counts in
FR29. Implementation stays two columns and a status enum. Add one line to FG4's preamble
tying the loop to R6+R7 and the confidence flag's purpose, so the reviewer reads intent,
not creep.

### OE-6 · LOW — T6 normalization is a scope-creep vector

**Where:** FR19/T6; addendum: "case/whitespace/diacritics normalization to be defined in
architecture".

**Perception risk:** Evidence verification is the PRD's best idea and the single-test
candidate — defend it in place. But "to be defined in architecture" is an open door to
fuzzy matching, Levenshtein thresholds, and a text-matching subsystem. That subsystem
would be the over-engineering smell *inside* the crown jewel.

**Cheapest fix:** Cap it in the PRD now: normalized exact substring containment, nothing
fuzzier; a quote that fails the normalized check downgrades, full stop. One sentence
closes the door.

### OE-7 · LOW — "Displayed in the UI's language" whiffs of i18n (FR13)

**Where:** FR13: allergens "displayed in the UI's language" — while the scope section
cuts i18n.

**Perception risk:** Tiny, but a skimming reviewer pattern-matches "UI's language" to an
i18n layer the non-goals just disclaimed.

**Cheapest fix:** Reword to "displayed via a fixed label map in the interface's single
language" — same behavior, no whiff.

### Noted and cleared (do not touch)

- **FR36 SSRF guard:** cheap (a private-range check on resolved addresses), directly feeds
  the "what breaks in production" segment, and reads as senior-engineer signal, not
  machinery. Keep it minimal — a blocklist check, not a DNS-pinning apparatus.
- **Persist-first + polling (FR3, addendum ADR):** the ADR is the strongest artifact in
  the set — it visibly *rejects* queues, SSE, and resumability with reasons, at zero new
  dependencies. This is the anti-over-engineering evidence a reviewer wants. Keep, and
  surface the ADR in DECISIONS.md.
- **E1–E9 inventory:** nine states sounds like a lot; each is an unavoidable real branch
  with distinct copy. Not machinery.
- **No-delete history, no search/filters, serial runs, no inline editing:** correct
  restraint, each with a real rationale. Clean.

---

## Direction 2: Under-engineering findings

### UE-1 · HIGH — E6 (scanned PDF) risks reading as unmet R5 on the reviewer's first test

**Where:** E6: "Scanned PDF with no text layer — not supported in v1: suggest uploading a
photo."

**Perception risk:** A very large share of real restaurant menu PDFs are scans. R5 makes
"uploaded PDF" a hard input path. A reviewer whose first test file is a scanned menu hits
"not supported" on a required path — honest copy does not change that it looks like a
failed hard requirement. This is the single most likely way the demo dies in the
reviewer's hands.

**Cheapest fix, in order of preference:**
1. **Verify at architecture whether the OpenAI API's native PDF input** (file/vision
   input) handles scanned pages — if it does, E6 dissolves at zero dependencies and the
   PDF path unifies with the vision path. This is the same cost as the HEIC verification
   already scheduled.
2. If not: keep the cut, but pre-empt it — ship 2–3 known-good sample menus (text PDF,
   image, URL) linked in the README so the reviewer's first run succeeds, and put E6 in
   DECISIONS.md *and* the walkthrough video's what-breaks segment so the cut reads as
   judgment, not a hole.

Do **not** add a PDF-rasterization pipeline (pdf→image + native deps) — that would trade
an under-engineering risk for an over-engineering one.

### UE-2 · MEDIUM — E3 (JS-rendered sites): the URL path fails on the mainstream case

**Where:** E3 treats JS-rendered/bot-blocked sites as a documented limitation.

**Perception risk:** Most small-restaurant websites today are Wix/Squarespace/builder
sites that render menu content client-side. A plain server-side fetch yields no usable
text on precisely the typical input. R5 requires the URL path; a reviewer pasting a real
restaurant URL and being redirected to "use PDF instead" will experience the required path
as decorative. The cut itself is right (a headless browser would be genuine
over-engineering) — the risk is un-managed demo failure.

**Cheapest fix:** (1) README sample inputs include at least one known-working public menu
URL, so the demonstrated path demonstrably works; (2) make the HTML text extraction
mildly robust (strip tags, keep text nodes — no readability library needed); (3) E3's
copy and DECISIONS.md name the boundary explicitly. Zero new machinery.

### UE-3 · LOW — Zod and TanStack Query absent from PRD Constraints

**Where:** Constraints section lists the fixed stack but omits Zod; TanStack Query appears
only in the addendum ADR table.

**Perception risk:** Not a demo break — a points leak. The rubric's Stack row (15%) names
Zod explicitly ("idiomatic React/Fastify/Drizzle/Zod"), and REQUIREMENTS.md §5 flags both
as cheap wins. A PRD that inherits the stack "whole from the brief" but drops the one
library the rubric names by name invites the question of whether the rubric was read.

**Cheapest fix:** One line in Constraints: "API I/O and the LLM JSON contract validated
with Zod; client fetch/poll state via TanStack Query." Also makes FR16's arbiter cleaner —
the Zod-parsed contract is what T1–T6 consume.

### Under-engineering: otherwise clean

The remaining cuts (no editing, no accounts, no delete, no search, no currency handling,
no negative-declaration modeling, one test, one timeout) are all either mandated by §4,
covered by an honest failure state, or trivially defensible in DECISIONS.md. No other cut
makes the demo feel broken.

---

## Summary table

| # | Severity | Location | Direction | Fix |
|---|---|---|---|---|
| OE-1 | High | whole PRD (36 FRs) vs 4-day runway | over | mark core/flex demotion ladder before architecture |
| UE-1 | High | E6 scanned PDF vs R5 | under | verify OpenAI native PDF input; else sample menus + DECISIONS + video |
| OE-2 | Medium | FR2 + addendum: image downscaling | over | cut; keep cap, pass through |
| OE-3 | Medium | FR1 + addendum: HEIC WASM lib fallback | over | fallback is E4 error path, never a lib |
| OE-4 | Medium | FR4/FR5 millisecond stages | over | display only observable stages |
| OE-5 | Medium | FG4 workflow breadth | over | keep loop; demote multi-select, reopen, progress counts to flex |
| UE-2 | Medium | E3 JS-rendered URL reality | under | README sample URL + robust-enough text extraction |
| OE-6 | Low | T6 normalization open-ended | over | cap at normalized exact substring |
| OE-7 | Low | FR13 "UI's language" | over | reword: fixed label map |
| UE-3 | Low | Constraints omit Zod/TanStack | under | one line in Constraints |
