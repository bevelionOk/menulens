# Addendum — PRD Menu Extraction & Review

Depth produced during the PRD session that belongs downstream (architecture, DECISIONS.md)
or earned its place but exceeds PRD altitude.

## ADR: extraction processing model (closed in-session, 2026-08-21)

Trigger: Pablo distrusts timeouts from experience and asked whether the process could be
"durable" without queue infrastructure. Explored via advanced elicitation — five methods
(Failure Mode Analysis, ADR panel, First Principles, Map-Is-Not-the-Territory, Chaos
Monkey) run and integrated.

Constraints: one Fastify service, no queues (auto-reject guardrail), no auth, sync
preferred by playbook opening position, analytics is a non-goal.

| Option | What it is | For | Against | Verdict |
|---|---|---|---|---|
| A1. Pure sync | one POST lives 30–90 s until rows return | simplest mental model; playbook opening position | couples 3–4 timeouts (client/route/proxy/SDK); progress = blind spinner; tab close orphans a result the server still produced | **Out — superseded** |
| **A2. Persist-first + polling** | POST creates the menu row (`processing` + `stage`) and returns the id instantly; extraction continues as an in-process promise; client polls (TanStack Query) | state lives in Postgres from second one; browser is a viewer, not the holder; the treacherous timeout disappears because no HTTP request needs to live 90 s; ~same code volume, zero new deps | in-flight work dies with a server crash (accepted: a run costs ~$0.003 and ~1 min — redo, don't resume) | **In** |
| A3. SSE / WebSocket progress | push events | fancier | extra moving parts for a 1–2 min process where 1–2 s polling is indistinguishable | **Cut** |
| A4. Queue (BullMQ/Redis) | real job durability | resumability | direct guardrail violation — over-engineering auto-reject | **Cut** |

### Key findings per method (compact)

- **Failure Mode Analysis**: Ana's review work (confirmations) is persisted per action and
  was never at risk; the only long/risky stage is the LLM call. The failure that matters is
  not lost work but *lost truth about state* (zombie rows, orphaned results, blind-retry
  duplicates).
- **First Principles**: two inherited assumptions fell — "must be synchronous" (the
  guardrail bans queue *infrastructure*, not in-process async) and "timeout ~60 s" (the LLM
  alone can take 90 s; a 60 s timeout guarantees failure on exactly the large menus that
  most need the tool). Rebuild: *the menu row is born before the process; the browser
  watches state, it does not hold it.*
- **Map Is Not the Territory**: a progress claim is a claim — the Operating Principle
  governs the waiting UI too. Banned: percentage bars (map to nothing measurable), dynamic
  ETAs (prediction without data; measuring would need analytics, a non-goal), lone
  spinners (map with no information — produces the "did it hang?" feeling). Honest map:
  stage name ↔ real code transition (rule: no theatrical sub-stages), measured elapsed
  timer, static expectation copy ("typically 30–90 s", calibrated on dev test menus).
- **Chaos Monkey**: two cheap defensive rules survive every kill scenario — (1) staleness
  derived at read time (`processing` with no transition > 3 min renders "interrupted —
  retry"), no reaper process; (2) the OpenAI SDK call carries the system's *only* technical
  timeout (~120 s, generous). Tab close mid-run: server finishes and persists; Ana finds
  the menu done in History.

### The bridge (synthesis)

"Durability" split in two: **durability-as-resumability** (checkpoints, resuming a
half-done extraction) is *discarded* — it protects $0.003 and a minute of waiting with
queue machinery that is an auto-reject; **durability-as-honest-state** is *in* and costs
almost nothing (a status/stage column + polling). The Operating Principle is what both
unites the layers (the waiting UI makes provable claims only) and separates the two
durabilities.

### Cut list (recorded)

Queue/worker infra, SSE/WebSocket, dynamic ETA, percentage bar, resumable/checkpointed
extraction, idempotency keys, background reaper.

### Position evolution → DECISIONS.md

This supersedes the playbook §3.2 opening position ("synchronous request with visible
progress state; timeout ~60 s"). Same spirit (no queues, visible progress), different
mechanics with reasons — a visible course-correction in the style of D10, to be recorded
in DECISIONS.md at session close.

## Party-mode roundtable — FG2 mechanics (2026-08-21)

Roundtable (Mary/John/Sally/Winston/Amelia) over Pablo's PO decisions for the extraction
contract. Decisions themselves live in the PRD (FR9–FR14); mechanism notes for
architecture:

- **Price representation**: two fields — `price_raw` (verbatim menu text: "desde 10 €",
  "£12", "12/16") and `price_value` (numeric, only when parsing is unambiguous, else
  null). Null value ⇒ deterministic triage trigger. Currency check: non-€ symbol or mixed
  currency ⇒ triage trigger. No conversion, no min/max range columns — the range lives
  verbatim in `price_raw`.
- **Description provenance clash (the session's moment)**: Pablo's opening position was
  extractive-only (model never writes). Mary countered with R6 evidence ("one-line
  description" is a required extracted field; most real menus describe nothing — the
  required column would sit empty on most rows). Bridge: reuse the allergen-provenance
  pattern — `extracted | generated`, visibly labeled, excluded from the confidence gate.
  Pablo adopted it as coherent with his own line.
- **HEIC**: iOS Safari auto-converts HEIC→JPEG on file upload when the input doesn't
  accept HEIC — the mainstream iPhone case likely costs zero dependencies. Verify at
  architecture; if it fails, the fallback is E4's clear error — the WASM-conversion-lib
  idea was **cut at the reviewer gate** (speculative machinery). Raw `.heic` (e.g.
  dragged from macOS): clear error + suggestion.
- **Upload cap**: 10 MB kept; the server-side downscaling idea was **cut at the reviewer
  gate** (an image-processing dependency to save pennies — the model API resizes on its
  side).
- **Allergen storage**: canonical EU-14 enum (language-independent), UI renders labels in
  interface language; dish name/description verbatim (translation would break the
  source-traceability triage signal and Ana's evidence-matching speed).

## FG3 / D4 closure — mechanics for architecture (2026-08-21)

- **LLM JSON contract additions**: per allergen — canonical id, provenance
  `declared|inferred`, and (when declared) an `evidence_quote` (verbatim span or the
  printed EU code). Per dish: optional `self_flag` + reason. Per menu: nothing extra —
  the menu-level notice (FR20) derives from row data at read time.
- **T6 verification**: for URL/PDF sources, a normalized substring/containment check of
  each `evidence_quote` against the acquired source text (case/whitespace/diacritics
  normalization to be defined in architecture). Failure ⇒ downgrade `declared`→`inferred`
  in code before triage runs. Image sources carry no ground text: quote displayed, not
  verified — feeds the "what breaks in production" narrative.
- **Single-test candidate (for DECISIONS.md at architecture, R8)**: the deterministic
  arbiter T1–T6 including the T6 downgrade path — deterministic, zero API cost, crosses
  extraction contract → triage → persistence, and encodes the product's central promise
  (the asymmetric gate). Noted here; the formal test-choice justification closes in the
  architecture phase.
- **Fatigue stance**: 100%-uncertain menus are correct behavior (Pablo, in-session);
  FR20's notice is the psychological counterweight (explains the wall of uncertain) and
  doubles as Ana's actionable message to the restaurant — the "reprint opportunity"
  insight.

## FG4 roundtable — mechanics for architecture (2026-08-21)

- **PDF display**: browser-native embed (`iframe`/`object` over the stored file) — zero
  client dependencies; pdf.js/react-pdf explicitly not needed. URL sources: external link
  (X-Frame-Options makes embedding third-party pages unreliable) + honest live-page note.
- **Quote highlighting**: reuse the match offsets T6 already computes — no new matching
  logic. Synced auto-scroll between table and panel: cut (v2 polish).
- **Storage implications** (already required, now explicit): persist the uploaded image
  bytes, the uploaded PDF bytes, and the acquired/extracted source text — T6 verification
  and the evidence panel read the same stored artifacts, from History too.
- **Doubtful note**: one nullable text column on the dish row. No workflow, no states
  beyond confirmed/doubtful.
- **Session beat worth keeping**: Pablo pushed back on the "show only what the system
  read" panel; the room self-corrected on the omission-blindness argument (a missed dish
  has no row → no flag can route attention to it; completeness is checked against the
  original). Feeds the "what breaks in production" walkthrough segment.

## Reviewer gate outcomes (2026-08-21)

Eight parallel reviewers — 5 input reconcilers (brief, brief addendum, REQUIREMENTS,
RISKS, verbatim challenge) + rubric walker + over-engineering hawk + BMAD-fluency
auditor; full reports in `reconcile-*.md` / `review-*.md` in this folder. Verdicts:
rubric **strong** (0 critical), hawk **pass with fixes**, fluency **pass — genuine, not
cosmetic** (citations verified, in-session reversals confirmed by the memlog).

Fix pass applied in-session (approved by Pablo): T4/T6 scoped to text sources — image
verification is Ana's, visually, against the photo; scanned-PDF native-input check added
to Open items (a zero-dep yes eliminates E6); **Build Priority ladder** added (P0/P1,
feeds D8); downscaling and the HEIC-lib fallback cut; fetch guards (R-03) reconciled with
the single-timeout rule; source persistence, provenance badges, Zod, the `empty` state,
frontend TypeScript, and the BUSINESS.md value-framing routing made explicit. The
DECISIONS.md D4 OPEN→CLOSED flip happens at session close (tracked, H3).
