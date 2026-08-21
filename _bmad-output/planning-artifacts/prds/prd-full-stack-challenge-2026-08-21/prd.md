---
title: PRD — Menu Extraction & Review
status: final
created: 2026-08-21
updated: 2026-08-21
---

# PRD: Menu Extraction & Review

Upstream: [product brief](../../briefs/brief-full-stack-challenge-2026-08-20/brief.md)
(final, 2026-08-20) and its addendum. This PRD projects the brief into requirements; it
does not restate it. One principle, inherited whole, governs every requirement below:

> **The system never claims more than it can prove, and everything it cannot prove is
> handed to Ana with the evidence in view.**

In Pablo's session words, the same idea: *the system is as honest as possible — it
acknowledges its virtues and its limitations.*

## Context

Ana (onboarding ops at a food-ordering platform) turns public restaurant menus into
structured dish data. Today: manual transcription, 15–30 minutes per menu, with personal
legal accountability for every allergen. The product is **triage-assisted review**, not
autonomous extraction: an LLM extracts dish rows, a deterministic confidence flag routes
Ana's attention, and her review — confirm or mark for follow-up — is the deliverable.
Loop: **Extract → Triage → Review → Confirm** (brief). Target: **~3 minutes per menu**
end-to-end.

## Users

- **Ana (primary, single operator).** Needs throughput *and* defensibility: "I can show
  what I checked and why I trusted it." No accounts, no roles — the tool has one chair.
- **Shadow stakeholders** (never see the UI): the allergic diner, protected only by the
  pipeline's asymmetry; the restaurant, whose price errors are money and whose allergen
  errors are safety.

The review loop *is* Ana's journey — a single-operator tool needs no separate journey
inventory; FG1–FG6 below follow her session in order.

## Scope

**In:** URL / PDF / image ingestion; persistent observable extraction runs; LLM extraction
(name, price with verbatim capture, EU-14 allergens with provenance and evidence quotes,
description with provenance, confidence flag); deterministic triage (rules T1–T6); review
with evidence panel (original + what-the-system-read); confirm / mark-for-follow-up with
optional note, single and batch, reversible; visible no-delete history; honest failure
states E1–E9.

**Out (non-goals and session cuts)** — each cut is deliberate; the reasoning lives in the
[addendum](addendum.md) and DECISIONS.md:

- *Product:* menu editing or publishing; correcting extracted values inline; user
  accounts, roles, identity, multi-tenancy; analytics or measurement infrastructure; UI
  internationalization or translation of extracted data; modeling of negative allergen
  declarations ("gluten-free").
- *Infrastructure:* job queues, workers, or background processes; SSE/WebSocket channels;
  resumable/checkpointed extraction; idempotency keys; client-side PDF rendering
  libraries; SLA/uptime targets; browser-support matrices.
- *UI & data:* country/currency selector or currency conversion; dynamic ETAs or
  percentage progress bars; run deletion; change journals; history search/filters.

## Constraints

The stack is fixed by the challenge and inherited whole from the brief's Constraints:
Node.js + Fastify + TypeScript; PostgreSQL + Drizzle with a real migration; React + Vite +
TypeScript + Tailwind + shadcn/ui; OpenAI SDK (JSON mode, vision for images); Zod
validation at the API and LLM-output boundaries (rubric-named); exactly one meaningful
automated test; structured Pino logs. The EU-14 allergen vocabulary (Reg. 1169/2011) and
the cost-per-extraction envelope (NFR2) carry over unchanged. Over-engineering guardrails:
REQUIREMENTS.md §4.

## Success Measures

Inherited from the brief, each with its counter-measure — the metric that keeps the metric
honest:

- **~3 min per menu** — but the allergen gate never relaxes to hit it; zero tolerance for
  false-reliables outranks speed.
- **Zero false-reliables on allergens, by construction** (the asymmetric gate) — counter:
  the gate's inputs are verified wherever ground text exists (T6); on photos, verification
  is Ana's, with the image in view.
- **Enough genuinely reliable rows to make batch confirmation worthwhile** — counter:
  achieved only through declared evidence on the menu, never by loosening rules. A menu
  with no allergen info going 100% uncertain is correct behavior (FR20 explains it to
  Ana), and alarm fatigue is fought by making inspection fast (FG4), not by softening
  flags. (Qualitative health condition — no measurement infrastructure.)
- **Honest failure** — every dead end is a defined, actionable state (FG6); counter:
  failure states offer a next step, never a dead-end error wall.

## Functional Requirements

Feature groups mirror the brief's review loop: Ingestion & Run Lifecycle → Extraction
Contract → Triage → Review & Confirmation → History → Failure States.

### FG1 · Ingestion & Run Lifecycle

- **FR1 — One source per run.** Ana submits exactly one menu source per extraction run: a
  public menu URL (http/https), an uploaded PDF, or an uploaded image (JPG/PNG/WebP).
  iPhone HEIC photos are expected to arrive as JPEG via the OS's automatic conversion on
  upload; a raw `.heic` file gets E4's clear error (FG6) suggesting export or screenshot.
  `[VERIFY AT ARCHITECTURE]` the auto-conversion behavior — and if verification fails, the
  answer stays E4's error: no conversion library enters the project (RISKS.md R-10;
  gate cut).
- **FR2 — Upload caps.** Uploads over the size cap are rejected *before* processing
  starts, with the cap stated in the message. Cap: 10 MB for both PDF and image — generous
  by design: Ana never fights the system. (No image-processing machinery hides behind it —
  pre-model downscaling was evaluated and cut at the reviewer gate; the model API resizes
  on its side.)
- **FR3 — A run is born persistent.** Submitting creates the extraction record (the
  *run* — one menu source, processed once; "run" names it throughout) immediately, before
  any processing begins. The run proceeds server-side and its state is
  observable independently of the browser: closing the tab loses nothing — the run
  finishes and is found in History.
- **FR4 — Observable real stages.** A run records its actual stages:
  `fetching_source → extracting → validating → saving → done | failed(reason)`. The UI
  displays the *observable* ones — fetching and extracting; the millisecond
  `validating`/`saving` steps render as a single finishing beat, while logs keep them all
  (NFR5). Every stage shown corresponds to a real transition in code — no theatrical
  sub-stages: none invented, none hidden.
- **FR5 — Honest progress UI.** While a run is active, the UI shows: the current stage in
  honest language (during the model stage it says this is the long part), a measured
  elapsed timer, and the static expectation "typically 30–90 s" (to be calibrated on dev
  test menus). Banned by the Operating Principle: percentage bars, dynamic ETAs, and
  uninformative lone spinners.
- **FR6 — One technical timeout.** The only timeout governing a run's duration is the
  model call's (generous, ~120 s); when it fires, the run ends `failed` with a visible
  reason. Source acquisition carries its own ordinary fetch guards — size and time caps
  (RISKS.md R-03) — whose failures surface as E2/E3 states, not as run timeouts. No
  client- or route-level timeouts exist, because no long-lived request exists.
- **FR7 — Staleness rule.** A run in `processing` with no stage transition for over 3
  minutes renders as "interrupted — retry available". Derived at read time; no background
  process. `[ASSUMPTION]` Threshold 3 min = 2× the upper expectation plus margin — to be
  measured during testing.
- **FR8 — Retry semantics.** Retrying a failed or interrupted run starts a *new* run; the
  failed run stays visible in History. Double-submit is guarded in the UI (control
  disabled while a run is active).
- **FR35 — One active run at a time.** v1 operates serially: while a run is active, new
  submissions are disabled (FR8's guard is this policy made visible). Serial operation
  matches the single-operator context and keeps run state trivially honest.
- **FR36 — URL fetching is not a proxy.** The server-side fetch of user-supplied URLs
  refuses private, internal, and local destinations (SSRF guard) — the URL field extracts
  public menus; it must not become a door into the network the server lives on. (Exact
  mechanics: architecture. Also "what breaks in production" material.)

*Mechanism (persist-first + client polling, in-process continuation, cut alternatives)
lives in the [addendum ADR](addendum.md), not here.*

### FG2 · Extraction Contract

- **FR9 — Fields per dish.** Every extracted dish carries: name, price, allergens (closed
  EU-14 vocabulary, per-allergen provenance), a one-line description (with provenance),
  and the confidence flag (derivation: FG3). (R6)
- **FR10 — Price honesty.** The price is captured *verbatim as printed on the menu*; a
  numeric value is derived only when unambiguous. An absent price, a range ("desde 10 €"),
  multiple values, or a non-EUR/mixed currency leaves the numeric empty and is a triage
  signal (FG3) — never a guess. The platform's working currency is EUR (EU regulatory
  frame); there is no currency conversion and no country selector (evaluated and cut as
  over-engineering).
- **FR11 — Variants as rows.** A dish offered in sizes/variants yields one row per
  variant, the variant carried in the name ("Pizza margarita (chica)"). Dish-level
  information — allergens with their provenance, description — is *copied* to each variant
  row, never re-inferred per variant.
- **FR12 — Description provenance.** A description is `extracted` when the menu provides
  one, `generated` (model-written from the dish itself) when it does not — and the UI
  visibly labels generated ones. This reuses the allergen-provenance pattern: the system
  may say things the menu doesn't, only by confessing it. Description provenance **never**
  affects the confidence flag — the triage gate belongs to allergens alone (asymmetry
  preserved).
- **FR13 — Allergen vocabulary and provenance.** Allergens are the 14 EU declarable
  allergens (Reg. 1169/2011) as a closed list, stored as canonical language-independent
  identifiers and displayed in the UI's language. Each allergen is `declared` (read on the
  menu) or `inferred` (deduced from the dish); a dish with no allergen information at all
  is `unknown` — "none found" is not "none present". (From the brief, verbatim principle.)
  The UI **visually distinguishes** `declared` from `inferred` on every allergen badge and
  renders the dish-level `unknown` state distinctly — provenance is shown, not merely
  stored.
- **FR14 — Data language.** Names and descriptions stay verbatim in the menu's language —
  translation would break source traceability (a triage signal) and slow Ana's
  evidence-matching. Working assumption, documented: platform, menus, and Ana share one
  language; language handling is out of scope. Only allergens are canonical (FR13).

### FG3 · Triage — the confidence flag (closes D4)

- **FR15 — Flag semantics.** Each row carries a binary flag, `reliable` / `uncertain`. It
  does not measure parse quality; it measures **whether it is safe for Ana not to look
  closely**. The UI renders it as "auto-checked" / "needs review" — never "safe" or
  "verified".
- **FR16 — Hybrid derivation, deterministic arbiter.** The model supplies *input signals*
  only: provenance tags, evidence quotes, and a self-flag raised against explicit
  criteria. Deterministic code rules are the **final arbiter**. The model's raw
  self-confidence is never used as a signal (smoke-test evidence: confidently wrong on
  ambiguous input — DECISIONS.md D4).
- **FR17 — The arbiter's rule set.** A row is `uncertain` if any rule fires; `reliable`
  only when none does. Every fired rule records its reason, shown to Ana (FR24).
  - **T1 — Allergen gate (dominant, no exceptions):** any allergen `inferred`, or dish
    allergen state `unknown`.
  - **T2 —** `price_value` empty (absent / range / ambiguous).
  - **T3 —** non-EUR or mixed currency detected.
  - **T4 —** dish name empty; or — on text sources — not traceable to the source text.
  - **T5 —** model self-flag raised.
  - **T6 — Evidence verification:** a `declared` allergen with **no evidence quote** is
    downgraded to `inferred` on every source type; a quote that **cannot be found in the
    source text** downgrades likewise on text sources (URL/PDF). Image sources carry no
    ground text — their quotes are verified by *Ana*, visually, against the photo in the
    evidence panel (FR19, FR23). Downgrades fire T1. The gate never trusts an unverified
    "declared" further than it can prove it.
- **FR18 — Self-flag criteria** (explicit in the extraction prompt): ambiguous price,
  doubtful OCR/legibility, unclear dish boundaries (one dish or a section?), allergen not
  literal in the text. When in doubt, flag — doubt always resolves toward `uncertain`.
- **FR19 — Evidence quotes.** Every `declared` allergen carries the verbatim quote where
  it was read (text or the EU allergen code as printed). For URL/PDF sources the quote is
  machine-verified against the source text (T6). For image sources there is no ground
  text: the quote is shown to Ana as evidence but not machine-verified — a documented,
  honest limitation. Quotes double as FG4's evidence-in-view.
- **FR20 — Menu-level honesty notice.** A menu that ends with zero `declared` allergens
  shows a notice above the table: *"This menu declares no allergen information — all rows
  need review."* It explains the wall of `uncertain` before it looks like a malfunction,
  and gives Ana an actionable message for the restaurant (update/reprint the menu). The
  same notice pattern names a non-EUR currency when T3 fires across the menu.
- **FR21 — Negative declarations are not modeled.** "Gluten-free" and similar claims do
  not create a declared absence; absence of allergen information remains `unknown`. A v1
  simplification, documented.
- A menu with no allergen information yielding 100% `uncertain` rows is **correct
  behavior**, not a failure: the gate never relaxes because the menu is poor. Alarm
  fatigue is fought in FG4 by making inspection fast, and by FR20 — never by loosening
  the flag.

### FG4 · Review & Confirmation

- **FR22 — Review actions.** Reviewing a row means **confirming** it or **marking it for
  follow-up** (doubtful) — individually or in batch. A menu is **done** when every row is
  resolved; doubtful rows can be part of a done menu (they are Ana's follow-up list with
  the restaurant).
- **FR23 — Evidence panel.** Review happens on one screen: the dish table beside an
  evidence panel with two tabs. **"Original"** (default): the uploaded photo, the PDF
  embedded natively by the browser, or — for URL sources — an external link with an honest
  note that live pages change. **"What the system read"**: the extracted source text with
  T6-verified quotes highlighted.
  - *Why Original leads — written down because it is load-bearing:* the confidence flag is
    *structurally blind to omissions* — a dish the extractor never saw has no row, and a
    row that doesn't exist cannot be `uncertain`. Only the original lets Ana catch a
    missing dish. (Also production-failure narrative material.)
  - *Source artifacts are persisted as first-class data* — the uploaded file's bytes and
    the acquired source text; the evidence panel and T6 read the same stored artifacts,
    from History too.
- **FR24 — Reasons in view.** An `uncertain` row shows *why*: its fired rules
  (`confidence_reasons`) and its evidence quotes, inline — Ana never has to guess what the
  system doubted.
- **FR25 — Doubtful semantics.** Marking for follow-up is terminal for this slice and may
  carry an **optional one-line note** ("price illegible — call restaurant"). The UI copy
  is "mark for follow-up", never a dead-end framing: if doubting feels like defeat, Ana
  will want to edit; if it feels like management, no-editing goes unnoticed.
- **FR26 — Batch mechanics.** Two mechanisms: a one-click **"confirm all auto-checked"**
  (the payoff of triage) and free multi-row selection **not filtered by flag** — after
  inspecting several uncertain rows Ana may resolve them together. The system routes her
  attention; it does not handcuff her. The accountable reviewer is Ana, not the flag.
- **FR27 — Resolution is reversible.** Any resolved row can be reopened; "done" is a
  derived state and reverts accordingly. The audit record is the **last decision + its
  timestamp** — no change journal, no identity (consistent with the brief's
  single-operator cut).
- **FR28 — No inline editing of extracted values.** A wrong extracted value is resolved
  by marking the row for follow-up — never by correcting it in place. Editing would
  falsify the extraction record: a persisted row is *what the system extracted* plus
  *Ana's verdict on it*; overwrite the first half and the audit trail lies. Data
  correction belongs to the downstream platform, out of scope.

### FG5 · History

- **FR29 — Visible extraction history.** All runs, newest first, each showing: date/time,
  source (type + file name or URL), state (`processing` / `interrupted` / `failed` /
  `done` / `empty` — E9's zero-dish honest end) plus review progress ("12 of 15 rows
  resolved"), and dish count. Persistence
  is *visible*, not implied. (R7) An empty history is honest too: a first visit shows
  "no extractions yet" with a pointer to submit — never a mute table.
- **FR30 — History is live, not a graveyard.** Opening a run leads to the same review
  screen — evidence panel included, since sources are persisted (FR23). Failed and
  interrupted runs offer retry from here (FR8).
- **FR31 — Nothing is deleted.** No delete in v1: every run — failed ones included — is
  part of Ana's audit record. Erasing runs is exactly what her defensibility cannot
  afford; visible failures are the honest history the product promises.
- **FR32 — No search, no filters.** A plain recent-first list; basic pagination only if
  volume demands it. (Anything more is machinery this slice doesn't need.)

### FG6 · Failure States

Guiding stance (Pablo, verbatim intent): *the system is as honest as possible — it
acknowledges its virtues and its limitations.* Every dead end produces a clear, actionable
state; never a silent empty table.

| # | State | What Ana gets |
|---|---|---|
| E1 | Malformed / non-http(s) URL | inline validation before the run starts |
| E2 | Unreachable URL (DNS, timeout, 4xx/5xx) | failure + suggestion: retry, or switch to PDF/photo |
| E3 | URL loads but yields no usable text (JS-rendered / bot-blocked site) | documented limitation: suggest the PDF/photo path |
| E4 | Unsupported file type (incl. raw `.heic`) | suggest export or screenshot |
| E5 | File over 10 MB | rejected pre-run with the cap stated (FR2) |
| E6 | Scanned PDF with no text layer | not supported in v1: suggest uploading a photo (vision path) — standing only until the zero-dep native-PDF check in Open items resolves |
| E7 | Model failure — timeout (~120 s), API error, invalid JSON after one retry | `failed` with a visible reason + retry |
| E8 | Interrupted (staleness rule, FR7) | shown as interrupted + retry |
| E9 | **Zero dishes extracted** | an honest terminal state (`empty`), *distinct from failure*: the run worked and found nothing — "I couldn't find dishes in this source — is it a menu? Try another path." A provable "I couldn't" (brief). |

- **FR33 — The inventory above is exhaustive and each state's copy is actionable.**
  A technical failure (E7) and an empty menu (E9) are different truths and get different
  states.
- **FR34 — Partial extraction is not a failure state.** The model extracts what it can;
  missed content is caught by Ana against the Original tab (FR23), not by a partial-error
  mechanism.

## Non-Functional Requirements

- **NFR1 — Latency.** Product target: **~3 minutes per menu end-to-end**, governed by
  triage calibration, not model speed (DECISIONS.md D10). The extraction run itself is
  bounded by the single technical timeout (~120 s, FR6).
- **NFR2 — Cost per extraction.** Envelope **~$0.003–0.032 per menu** depending on model
  tier (DECISIONS.md D3). The measured real number feeds BUSINESS.md pricing — it is an
  input, not decoration. So does the brief's value framing: "reviewed by a human with
  evidence" — the platform's answer to allergen liability — is the other half of the
  price narrative.
- **NFR3 — Honesty disclaimer.** The review screen states: *"AI-extracted — verify before
  publishing."* Allergen accountability is Ana's, and the interface never suggests
  otherwise (reinforces FR15: never "safe"/"verified").
- **NFR4 — No PII.** No accounts, identity, or personal data stored; sources are public
  menus. The follow-up note (FR25) is Ana's operational text and the system's only
  free-text field.
- **NFR5 — Honest observability.** Structured logs (Pino, R9): every run leaves a trace
  of its stage transitions and which T1–T6 rules fired — the flag's "why" is auditable in
  logs as well as in the UI. (Direct input to the "what breaks in production" walkthrough
  segment.)

**Deliberately absent** (the absence is a decision, not an omission): SLA/uptime targets,
browser-support matrices, UI performance benchmarks, i18n.

## Build Priority

Feeds the deadline policy (DECISIONS.md D8: ship with documented gaps, never slip). If
the build runs short, **P1 falls entirely before P0 loses a line**:

- **P0 — the challenge's letter:** single-source ingestion with caps (FR1–FR2),
  persistent observable runs (FR3–FR8, FR35–FR36), the extraction contract (FR9–FR14),
  the flag with its arbiter (FR15–FR19, FR21), a results table with per-row confirm /
  follow-up and visible reasons (FR22, FR24, FR28), a minimal history list (FR29,
  FR31–FR32), the failure inventory (FR33–FR34), and the NFRs.
- **P1 — what makes it a product:** the evidence panel (FR23), the menu-level notice
  (FR20), batch mechanics (FR26), reversibility (FR27), the follow-up note (FR25), and
  progress-display refinement beyond stage + elapsed (FR5's expectation copy).

## Decisions closed in this PRD

Recorded here for traceability; formal DECISIONS.md entries land at session close.

- **D4 — confidence-flag derivation: CLOSED.** Hybrid: model supplies signals (provenance,
  evidence quotes, criteria-anchored self-flag), deterministic rules T1–T6 arbitrate.
  Evidence verification (T6) promoted from D4's original candidate list to a named rule.
- **Processing model — evolved.** Supersedes the earlier "synchronous request, ~60 s
  timeout" position: runs are born persistent, the browser observes state, one technical
  timeout (addendum ADR; visible course-correction in the style of D10).
- **Description policy — evolved.** From "extractive only" to provenance-labeled
  `extracted | generated`, reusing the allergen-provenance pattern after the R6 evidence
  (most menus describe nothing).
- **Evidence panel — corrected in session.** From "show what the system read" to
  Original-first with a system-view tab, on the omission-blindness argument.

## Open items

| Item | Owner / where it closes |
|---|---|
| HEIC auto-conversion behavior on upload (FR1) | verify at architecture; fallback: dependency-free conversion lib |
| Staleness threshold 3 min (FR7) | measure during testing |
| Expectation copy "30–90 s" (FR5) | calibrate on dev test menus |
| Single-test choice + formal justification (T1–T6 arbiter is the leading candidate — addendum) | architecture phase, DECISIONS.md (R8) |
| SSRF guard mechanics — private/internal address blocklist for URL fetch (FR36) | architecture phase |
| Scanned-PDF path — verify OpenAI native PDF input (a zero-dep yes would eliminate E6); until then E6 stands, justification recorded (native deps endanger the 5-min README) | architecture phase, DECISIONS.md |
