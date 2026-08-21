---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/prd.md
  - _bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-full-stack-challenge-2026-08-21/ARCHITECTURE-SPINE.md
  - REQUIREMENTS.md
---

# Menu Extraction & Review - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Menu Extraction & Review
(the full-stack-challenge project), decomposing the requirements from the PRD (final,
2026-08-21, as amended by the architecture session), its addendum, and the Architecture
Spine (final, 2026-08-21 — 14 ADs) into implementable stories.

No separate UX design contract exists — a deliberate decision, not an omission: all UX
decisions were taken inside the PRD (FG1–FG6 copy and state rules, review-screen honesty
conventions) and the spine's Consistency Conventions. See UX Design Requirements below.

One inherited principle governs every requirement: **the system never claims more than it
can prove, and everything it cannot prove is handed to Ana with the evidence in view.**

## Requirements Inventory

### Functional Requirements

Feature groups mirror the PRD's review loop: FG1 Ingestion & Run Lifecycle → FG2
Extraction Contract → FG3 Triage → FG4 Review & Confirmation → FG5 History → FG6 Failure
States. Numbering is the PRD's (FR35–FR36 belong to FG1).

**FG1 · Ingestion & Run Lifecycle**

- FR1: One source per run — a public http/https menu URL, an uploaded PDF, or an uploaded image (JPG/PNG/WebP). Raw `.heic` gets E4's clear error; iPhone HEIC arrives as JPEG via OS auto-conversion (upload accept list excludes `image/heic` — verified mechanism, spine Uploads convention).
- FR2: Uploads over the 10 MB cap (PDF and image alike) are rejected *before* processing starts, with the cap stated in the message (pre-run 4xx; no run row created).
- FR3: A run is born persistent — submitting creates the extraction record before any processing; the run proceeds server-side, observable independently of the browser; closing the tab loses nothing.
- FR4: Observable real stages — `fetching_source → extracting → validating → saving → done | failed(reason)`; the UI displays the observable ones (fetching, extracting; validating+saving render as one finishing beat); logs keep them all; every stage shown maps 1:1 to a real code transition — no theatrical sub-stages.
- FR5: Honest progress UI — current stage in honest language (the model stage says it is the long part), a measured elapsed timer, and the static expectation "typically 30–90 s" (calibrated on dev test menus). Banned: percentage bars, dynamic ETAs, lone spinners.
- FR6: One technical timeout — only the model call (~120 s) bounds a run; firing it ends the run `failed` with a visible reason. Source fetch carries ordinary size/time caps surfacing as E2/E3. No client- or route-level timeouts exist.
- FR7: Staleness rule — a run in `processing` with no stage transition for over 3 minutes renders as "interrupted — retry available", derived at read time; no background process. [ASSUMPTION] threshold 3 min, to be measured during testing.
- FR8: Retry semantics — retrying a failed/interrupted run starts a *new* run; the old run stays visible in History; double-submit guarded in the UI (control disabled while a run is active).
- FR35: One active run at a time — v1 is serial; while a run is active, new submissions are disabled (server-enforced, AD-10).
- FR36: URL fetching is not a proxy — the server-side fetch refuses private, internal, and local destinations (SSRF guard, mechanics in AD-11).

**FG2 · Extraction Contract**

- FR9: Fields per dish — name, price (with verbatim capture), allergens (closed EU-14 vocabulary, per-allergen provenance), one-line description (with provenance), confidence flag.
- FR10: Price honesty — `price_raw` verbatim as printed; numeric `price_value` derived only when unambiguous; absent/range/multiple/non-EUR leaves the numeric empty and is a triage signal — never a guess. Working currency EUR; no conversion, no country selector.
- FR11: Variants as rows — one row per size/variant, variant carried in the name; dish-level information (allergens + provenance, description) copied to each variant row, never re-inferred.
- FR12: Description provenance — `extracted` when the menu provides one, `generated` (model-written) when not; generated ones visibly labeled in the UI; description provenance never affects the confidence flag.
- FR13: Allergen vocabulary and provenance — the 14 EU declarable allergens (Reg. 1169/2011) as a closed list, stored as canonical language-independent ids, displayed localized. Each allergen `declared` or `inferred`; a dish with no allergen information is `unknown` ("none found" is not "none present"). Badges visually distinguish `declared` vs `inferred`; dish-level `unknown` rendered distinctly.
- FR14: Data language — names and descriptions stay verbatim in the menu's language; only allergens are canonical (FR13).

**FG3 · Triage — the confidence flag**

- FR15: Flag semantics — binary `reliable`/`uncertain`, measuring whether it is safe for Ana *not* to look closely. UI copy "auto-checked"/"needs review" — never "safe"/"verified".
- FR16: Hybrid derivation — the model supplies input signals only (provenance tags, evidence quotes, criteria-anchored self-flag); deterministic code rules are the final arbiter; raw model self-confidence is never a signal (D4).
- FR17: The arbiter's rule set — a row is `uncertain` if any rule fires; `reliable` only when none does; every fired rule records its reason (shown per FR24). T1 allergen gate (dominant): any allergen `inferred` or dish state `unknown`. T2: `price_value` empty. T3: non-EUR or mixed currency. T4: dish name empty, or (text-class sources) not traceable to source text. T5: model self-flag raised. T6: evidence verification — `declared` with no quote downgrades to `inferred` everywhere; a quote not found in the source text downgrades on text-class sources; downgrades fire T1. Source classes `text | visual` per AD-6.
- FR18: Self-flag criteria explicit in the extraction prompt — ambiguous price, doubtful OCR/legibility, unclear dish boundaries, allergen not literal in text; doubt always resolves toward `uncertain`.
- FR19: Evidence quotes — every `declared` allergen carries the verbatim quote where it was read; machine-verified against source text on text-class sources (T6); on visual-class sources shown to Ana but not machine-verified (documented, honest limitation). Quotes double as FG4 evidence-in-view.
- FR20: Menu-level honesty notice — zero `declared` allergens across the menu shows "This menu declares no allergen information — all rows need review" above the table; the same notice pattern names a non-EUR currency when T3 fires menu-wide.
- FR21: Negative declarations not modeled — "gluten-free" and similar create no declared absence; absence of allergen information remains `unknown` (documented v1 simplification). A 100%-uncertain menu is correct behavior, never a malfunction.

**FG4 · Review & Confirmation**

- FR22: Review actions — confirming a row or marking it for follow-up, individually or in batch; a menu is done when every row is resolved; doubtful rows can be part of a done menu.
- FR23: Evidence panel — one review screen: dish table beside a two-tab panel. "Original" (default): uploaded photo, browser-native PDF embed, or (URL sources) external link with an honest live-page note. "What the system read": acquired source text with T6-verified quotes highlighted. Source artifacts (uploaded bytes + acquired text) persisted first-class; panel works from History too. Original leads because the flag is structurally blind to omissions — only the original catches a missing dish.
- FR24: Reasons in view — an `uncertain` row shows its fired rules (`confidence_reasons`) and evidence quotes inline.
- FR25: Doubtful semantics — mark-for-follow-up is terminal for this slice, with an optional one-line note; copy is "mark for follow-up", never a dead-end framing.
- FR26: Batch mechanics — one-click "confirm all auto-checked" plus free multi-row selection not filtered by flag; the system routes attention, it does not handcuff; the accountable reviewer is Ana.
- FR27: Resolution is reversible — any resolved row can be reopened; "done" is derived and reverts; the audit record is the last decision + its timestamp (no change journal, no identity).
- FR28: No inline editing of extracted values — a wrong value is resolved by follow-up, never corrected in place; a persisted row is *what the system extracted* plus *Ana's verdict*.

**FG5 · History**

- FR29: Visible extraction history — all runs newest first: date/time, source (type + file name or URL), state (`processing`/`interrupted`/`failed`/`done`/`empty`) plus review progress ("12 of 15 rows resolved"), dish count. Empty history shows "no extractions yet" with a pointer to submit.
- FR30: History is live — opening a run leads to the same review screen, evidence panel included; failed/interrupted runs offer retry from here.
- FR31: Nothing is deleted — no delete in v1; every run, failed ones included, is part of Ana's audit record.
- FR32: No search, no filters — plain recent-first list; basic pagination only if volume demands it.

**FG6 · Failure States**

- FR33: The failure inventory is exhaustive and each state's copy is actionable: E1 malformed URL (inline pre-run), E2 unreachable URL, E3 no usable text (JS-rendered/bot-blocked → suggest PDF/photo), E4 unsupported file incl. raw `.heic`, E5 over 10 MB (pre-run, cap stated), E7 model failure (timeout ~120 s / API error / invalid JSON after one retry), E8 interrupted (FR7), E9 zero dishes = honest terminal `empty`, distinct from failure. E6 (scanned PDF) retired at architecture — now a `visual`-class source (AD-6).
- FR34: Partial extraction is not a failure state — the model extracts what it can; missed content is caught by Ana against the Original tab (FR23).

### NonFunctional Requirements

- NFR1: Latency — product target ~3 minutes per menu end-to-end, governed by triage calibration, not model speed; the run itself bounded by the single ~120 s model timeout (FR6).
- NFR2: Cost per extraction — envelope ~$0.003–0.032 per menu depending on model tier; the measured real number feeds BUSINESS.md pricing (an input, not decoration).
- NFR3: Honesty disclaimer — the review screen states "AI-extracted — verify before publishing"; the interface never suggests accountability is anyone's but Ana's.
- NFR4: No PII — no accounts, identity, or personal data; sources are public menus; the follow-up note (FR25) is the system's only free-text field.
- NFR5: Honest observability — structured Pino logs: every run leaves a trace of its stage transitions and which T1–T6 rules fired; the flag's "why" is auditable in logs as well as in the UI.

Deliberately absent (decision, not omission): SLA/uptime targets, browser-support
matrices, UI performance benchmarks, i18n.

### Additional Requirements

From the Architecture Spine (14 ADs + Consistency Conventions + Stack + Structural Seed).

**Scaffolding & repo shape (impacts Epic 1 Story 1):**

- AR1: No starter template — official scaffolds at scaffold time (Vite React-TS template, shadcn CLI, Fastify) pin all majors; never hand-upgraded; spine Stack table is the reference snapshot; Node ≥ 22.13.
- AR2: npm workspaces monorepo `server/` + `web/` + `shared/` (plain npm — no Nx/Turbo/pnpm); `shared` has no runtime dependency except Zod and is consumed as TS source (no build step) (AD-2).
- AR3: Local-only operational envelope — Docker Compose runs Postgres 16 only; `npm run dev` = server (tsx watch) + web (Vite) via concurrently; Vite proxies `/api`; no deploy target (AD-1).
- AR4: `shared` owns the contract — Zod schemas for entities, API payloads, LLM output signals, the closed failure-reason enum, the EU-14 allergen enum; one base schema per entity, variants via `.pick()/.extend()/.omit()`, never re-declared (AD-2).
- AR5: Functional core / imperative shell — arbiter T1–T6, T6 verify, price parse, class decision are pure functions under `server/src/core/` with no IO imports; dependency direction enforced: core → shared only (AD-3).

**Data & persistence:**

- AR6: Three tables — `runs`, `dishes`, `source_artifacts` (1:1 with runs; uploaded bytes + acquired source text); `allergens` and `confidence_reasons` as `jsonb` on the dish row, shapes governed by `shared`; dish order server-assigned (`position`), every reader sorts by it (AD-8). Drizzle generated SQL migration committed — the challenge's "real migration" (R2).
- AR7: Persist-first lifecycle — run truth is `status` ∈ `processing|done|failed|empty` + `stage`; `POST /api/runs` creates the row and returns the id before processing; pre-run rejections (E1/E4/E5) are plain 4xx, no run row ever created (AD-4).
- AR8: Derived state computed at read, never stored — `interrupted`, menu done-ness, review progress; dishes persisted in one transaction at `saving`; mid-run `GET /api/runs/:id` returns `dishes: []` (AD-5).
- AR9: Artifact isolation — bytes never selected in list queries; served only by a dedicated endpoint with correct `Content-Type`, `X-Content-Type-Options: nosniff`, accepted MIME types only; acquired text served `text/plain`, never `text/html` (AD-8).

**Pipeline & integration:**

- AR10: Source class `text | visual` decided once per run by presence of usable ground text (URL, or PDF text layer ≥ threshold ⇒ `text`; image, or PDF below threshold/parse error ⇒ `visual`); model input, T6 machine-verification, and the "what the system read" tab key on class, never file type; handling decided by final content-type after fetch (redirect to PDF takes the PDF path) (AD-6). Threshold value calibrated on dev test menus (deferred).
- AR11: SSRF guard, dependency-free — http/https only; resolve via `dns.lookup`; refuse private/loopback/link-local/metadata ranges; re-validate on every redirect hop; browser-like headers; size and time caps on the fetch; DNS rebinding = documented accepted residual (AD-11).
- AR12: OpenAI boundary is one injected seam — a single extraction adapter receives the client as injected dependency; structured outputs via `zodTextFormat` (strict schema derived from `shared` model-signal schema; verified with Zod 4); vision/native-PDF input for `visual`-class runs; invalid output gets exactly one retry, then `failed` (E7); model ids from env (dev `gpt-5.6-luna`, final-eval `gpt-5.6-terra`) (AD-12).
- AR13: The runtime extraction prompt is a versioned file surfaced in `prompts/` (R11); self-flag criteria (FR18) explicit in it; model params (temperature, max output tokens) owned by build phase — generous `max_output_tokens` noted for the 400-dish truncation limit.
- AR14: T6 normalization pinned — both sides normalized identically, in order: Unicode NFKC → lowercase → NFD → remove combining marks (`\p{M}`) → collapse whitespace; downgrades run before triage; T6 persists match offsets into the acquired text; FR23 highlighting reuses those offsets — the web never re-implements matching (AD-7).
- AR15: pdfjs-dist requires its optional `@napi-rs/canvas` in Node — never install with `--omit=optional`.

**API & seriality:**

- AR16: The route table is exhaustive — `POST /api/runs` · `GET /api/runs` · `GET /api/runs/:id` · `GET /api/runs/:id/artifact` · `POST /api/runs/:id/reviews`; no other mutation routes without a spine update; no DELETE endpoint exists (AD-9).
- AR17: One review path — `POST /api/runs/:id/reviews` takes a batch of decisions `{ dish_id, action: confirm | followup | reopen, note? }`; a single review is a batch of one; review updates only review fields (status, note, decided-at); extracted values immutable after the run persists (AD-9).
- AR18: Seriality is server truth — a run is active iff `status = processing` and last stage transition within the staleness threshold; while active, `POST /api/runs` returns 409; UI mirrors, never owns, this state (AD-10).
- AR19: Error envelope `{ error: { code, message } }`, codes from the AD-14 closed enum; failure containment: every stage transition ends in a persisted state or is caught by the staleness net; the failure handler itself never throws (AD-14).

**Quality, config & observability:**

- AR20: Exactly one test — Vitest integration golden-master: POST a fixture through the real API with the AD-12 seam mocked and real Postgres; poll to completion; assert the normalized completed-run payload against one golden (ids/timestamps frozen/excluded, ordering by `position`); the mocked response fires every rule T1–T6 including the T6 downgrade, plus at least one fully `reliable` row (AD-13, D16, R8).
- AR21: CI — gitleaks already live (D12); a `checks` job (typecheck + the one test against a Postgres service container) must be added when the scaffold lands.
- AR22: Env config validated fail-fast at boot with a Zod schema; `.env.example` is the complete reference; no secrets in repo (R12).
- AR23: Pino via Fastify's native logger; every stage transition and every fired T-rule logged with `run_id` (NFR5).
- AR24: Naming — DB snake_case, TS camelCase, React components PascalCase, files kebab-case; ids `uuid` via `gen_random_uuid()`; `timestamptz` UTC, ISO-8601 serialized.
- AR25: Upload accept list never includes `image/heic` (Safari 17+ converts *to* HEIC when listed; exclusion triggers the OS HEIC→JPEG auto-convert); raw `.heic` → `unsupported_file` 4xx.

**Frontend platform:**

- AR26: SPA routing — react-router: `/` (submit), `/runs/:id` (review), `/history`; History→review is a deep link (FR30).
- AR27: Server state lives only in TanStack Query (polling via `refetchInterval` while a run is active); no global client store.

### UX Design Requirements

No separate UX design contract exists — deliberate (ratified in this session): all UX
decisions were taken in the PRD (FG1–FG6) and the spine's Consistency Conventions. The UI
decisions that stories must honor are already captured above as FRs (FR5 waiting UI, FR13
badges, FR12 generated label, FR15 flag copy, FR20 notice, FR23 evidence panel, FR24
reasons, FR25 copy, FR29 empty state, FG6 actionable failure copy) and ARs (AR26 routes,
AR27 state). Three UX policy decisions audited and confirmed at this session's start:

- UX-1: Visual identity = stock shadcn/ui components and default Tailwind tokens; no custom design system (REQUIREMENTS §4 cut; spine Deferred — "the code owns them").
- UX-2: Desktop-first single-operator tool; no responsive breakpoint work, no browser-support matrix (PRD "Deliberately absent" list).
- UX-3: Accessibility = the baseline shadcn/ui (Radix primitives) provides — keyboard operability and ARIA semantics out of the box; no custom accessibility audit or work. Justification: single named operator on a desktop; not requested by the challenge; a custom a11y workstream would violate the over-engineering guard. (Ratified this session.)

### FR Coverage Map

Display-side halves of contract FRs are dual-mapped: the value is *captured/derived* in
Epic 1 and *shown* in Epic 2 — noted explicitly so neither half gets lost.

- FR1: Epic 1 — one source per run (URL / PDF / image; HEIC accept-list path)
- FR2: Epic 1 — 10 MB cap, rejected pre-run with the cap stated
- FR3: Epic 1 — run born persistent, observable independently of the browser
- FR4: Epic 1 — observable real stages, 1:1 with code transitions
- FR5: Epic 1 — honest progress UI (stage + elapsed + static expectation)
- FR6: Epic 1 — single technical timeout (model call ~120 s)
- FR7: Epic 1 — staleness rule, derived at read
- FR8: Epic 1 — retry = new run; UI double-submit guard (retry also surfaced from History in Epic 3)
- FR9: Epic 1 — extraction contract fields per dish
- FR10: Epic 1 — price honesty (`price_raw` / `price_value`)
- FR11: Epic 1 — variants as rows, dish-level info copied
- FR12: Epic 1 (description provenance captured) + Epic 2 (`generated` label visible)
- FR13: Epic 1 (EU-14 canonical ids + per-allergen provenance) + Epic 2 (badges `declared` vs `inferred`, distinct `unknown` rendering)
- FR14: Epic 1 — data verbatim in menu language
- FR15: Epic 1 (flag semantics + derivation) + Epic 2 (UI copy "auto-checked"/"needs review")
- FR16: Epic 1 — hybrid derivation, deterministic arbiter (D4)
- FR17: Epic 1 — arbiter rule set T1–T6
- FR18: Epic 1 — self-flag criteria explicit in the extraction prompt
- FR19: Epic 1 (evidence quotes + T6 machine-verification, offsets persisted) + Epic 2 (quotes shown in the evidence panel)
- FR20: Epic 2 — menu-level honesty notice (zero-declared / non-EUR patterns)
- FR21: Epic 1 — negative declarations not modeled
- FR22: Epic 2 — confirm / mark-for-follow-up, single and batch
- FR23: Epic 2 — evidence panel: Original (default) + "what the system read"
- FR24: Epic 2 — fired rules + quotes inline on uncertain rows
- FR25: Epic 2 — follow-up semantics, optional note
- FR26: Epic 2 — batch mechanics ("confirm all auto-checked" + free multi-select)
- FR27: Epic 2 — resolution reversible; done derived
- FR28: Epic 2 — no inline editing of extracted values
- FR29: Epic 3 — history list: all runs, newest first, state + progress + counts
- FR30: Epic 3 — history is live; deep link to the Epic 2 review screen
- FR31: Epic 3 — nothing is deleted
- FR32: Epic 3 — no search, no filters
- FR33: Epic 1 — exhaustive failure inventory with actionable copy (states also render in Epic 3's list)
- FR34: Epic 1 — partial extraction is not a failure
- FR35: Epic 1 — one active run at a time, server-enforced
- FR36: Epic 1 — SSRF guard on URL fetching

NFR mapping: NFR1 → Epic 1 (expectation copy; product target governs triage calibration);
NFR2 → Epic 1 (measured cost feeds BUSINESS.md); NFR3 → Epic 2 (disclaimer always
visible); NFR4 → Epic 1 (schema level — no PII columns exist); NFR5 → Epic 1 (Pino:
stage transitions + fired T-rules per run).

## Epic List

### Epic 1: Extract & Triage — from menu source to honest, flagged rows

Ana submits any of the three source types (URL / PDF / image), watches an honest run that
is born persistent, and gets extracted dish rows with a deterministic confidence flag and
recorded reasons — the direct replacement of her manual transcription. Includes the
project scaffold (Story 1.1 — official scaffolds, npm workspaces, Compose Postgres; no
starter template, AR1–AR3), the real Drizzle migration, the SSRF-guarded fetch, source
classes `text|visual`, the injected OpenAI seam with the versioned extraction prompt, the
pure arbiter with pinned T6 normalization, all failure states (honest failure is an
acceptance criterion of each pipeline story, not a separate epic), and the golden-master
integration test + CI `checks` job (AD-13 — the fixture fires T1–T6, all of it this
epic's scope). Completion view is minimal read-only; Epic 2 turns it into the review
screen (deliberate walking-skeleton evolution of one page).

**FRs covered:** FR1–FR11, FR12 (capture), FR13 (capture), FR14, FR15 (derivation),
FR16–FR18, FR19 (verification), FR21, FR33–FR36 · **NFRs:** NFR1, NFR2, NFR4, NFR5

### Epic 2: Review & Confirm — verdicts with evidence in view

Ana reviews on one screen: the dish table with provenance badges, flag copy
("auto-checked"/"needs review"), inline reasons, and the Original-first evidence panel
with T6-highlighted quotes; she confirms or marks for follow-up — individually or in
batch, reversibly, through one review endpoint. Her review is the deliverable. Includes
the artifact-serving endpoint (AR9 security headers), the menu-level honesty notice
(FR20), and the NFR3 disclaimer.

**FRs covered:** FR20, FR22–FR28 + display halves of FR12, FR13, FR15, FR19 · **NFRs:** NFR3

### Epic 3: History — the living audit record

Ana finds every run — processing, interrupted, failed, empty, and done alike — newest
first with state, review progress, and dish count; opening one leads to the same review
screen; failed/interrupted runs offer retry from here; nothing is ever deleted. Her
defensibility over time. Kept separate from Epic 2 by decision (this session): History is
not a post-processing phase but the other view of runs in *any* state — mixing
unprocessed runs into the review flow would confuse the operator and degrade the UX
(finding/resuming/defending work vs. doing it).

**FRs covered:** FR29–FR32

## Epic 1: Extract & Triage — from menu source to honest, flagged rows

Ana submits any of the three source types (URL / PDF / image), watches an honest run that
is born persistent, and gets extracted dish rows with a deterministic confidence flag and
recorded reasons — the direct replacement of her manual transcription. All stories P0;
the single P1 item is one tagged AC in Story 1.7. Sequencing note: no story depends on a
future one — a run created in 1.3 before the pipeline exists ends honestly as
`interrupted`; stories 1.4–1.6 then make each stage real.

### Story 1.1: Project Scaffold & Foundations

As the developer,
I want a runnable monorepo skeleton on the pinned stack,
So that every later story lands on the ratified structure instead of inventing its own.

**Acceptance Criteria:**

1. **Given** a fresh clone with `.env` copied from `.env.example`, **When** `docker compose up -d`, `npm install`, and `npm run dev` run, **Then** Postgres 16 starts, the Fastify server boots (tsx watch), and the Vite SPA shell loads with `/api` proxied to Fastify — plain npm workspaces `server/` + `web/` + `shared/`, no Nx/Turbo/pnpm (AR2–AR3).
2. **Given** the scaffold, **When** versions are inspected, **Then** majors are the official scaffolds' pins (never hand-upgraded; the spine Stack table is the reference snapshot) **And** the Node engine is ≥ 22.13 (AR1).
3. **Given** a missing or malformed env var, **When** the server boots, **Then** it exits immediately with a clear Zod validation error naming the variable (fail-fast), **And** `.env.example` lists every required var with no real secrets (AR22).
4. **Given** the server boots, **Then** Pino structured logging via Fastify's native logger is active (AR23).
5. **Given** a push to the repo, **When** CI runs, **Then** the existing gitleaks job still passes **And** a new `checks` job runs the workspace typecheck (AR21 — the golden-master test joins this job in Story 1.8).
6. **Given** the repo layout, **Then** it matches the spine's structural seed (`server/src/core|pipeline|routes|db`, `server/drizzle`, `server/test`, `web/src`, `shared/src`) and the naming conventions (AR24).
7. **Scope guard (anti-over-engineering; R-13 mitigation):** **Given** the scaffold, **Then** official-scaffold defaults are accepted as-is — no config polishing, no toolchain tuning beyond what an AC explicitly requires; friction with the fresh majors resolves toward the default, never toward custom configuration.

### Story 1.2: Shared Contract & Data Layer

As the developer,
I want the Zod contract and the database schema with a real committed migration,
So that front, back, and pipeline share one source of truth for every shape.

**Acceptance Criteria:**

1. **Given** `shared/src`, **Then** exactly one base Zod schema exists per entity (run; dish including description + provenance; allergen entry; model-signal output; API payloads; error envelope), with variants derived via `.pick()/.extend()/.omit()`, never re-declared; `shared`'s only runtime dependency is Zod and it is consumed as TS source (AR4).
2. **Given** the allergen enum, **Then** it is the closed EU-14 list as canonical language-independent snake_case ids (e.g. `gluten`, `crustaceans`) (FR13).
3. **Given** the failure-reason enum, **Then** it is closed and exhaustive per AD-14: `invalid_url | unsupported_file | file_too_large` (pre-run 4xx, never stored), `unreachable_url | no_usable_text | model_timeout | model_error | model_invalid_output` (stored on failed runs), `interrupted` (derived at read, never stored); `empty` is a run status, not a failure reason (AR19).
4. **Given** a fresh database, **When** the committed Drizzle migration in `server/drizzle/` is applied, **Then** tables `runs`, `dishes`, `source_artifacts` exist per the spine ER — uuid ids via `gen_random_uuid()`, `timestamptz` UTC, `dishes.position` integer, `allergens`/`confidence_reasons` as jsonb, `source_artifacts` 1:1 with runs holding `bytes`, `acquired_text`, `content_type`; **And** no PII columns exist anywhere in the schema (NFR4) (AR6; the challenge's "real migration", R2).
5. **Given** the repos in `server/src/db`, **Then** dish reads order by server-assigned `position` **And** no list query ever selects artifact `bytes` (AR6, AR9).

### Story 1.3: Persist-First Run Lifecycle API

As Ana,
I want submitting a menu to create a persistent, observable run immediately,
So that closing the tab never loses anything and the state is always honest.

**Acceptance Criteria:**

1. **Given** a valid source (URL or uploaded file), **When** `POST /api/runs` is called, **Then** a run row is created with `status=processing` and its id returned before any processing work begins (FR3, AR7).
2. **Given** a malformed/non-http(s) URL, an unsupported file type (raw `.heic` included), or a file over 10 MB, **When** POST is called, **Then** the response is 4xx with `{error:{code,message}}` (`invalid_url` / `unsupported_file` / `file_too_large`), the message states the 10 MB cap for oversize, **And** no run row or artifact is created (FR1–FR2; E1/E4/E5).
3. **Given** an accepted upload, **Then** the file bytes and content-type persist to `source_artifacts` in the same transaction as the run row (AR6).
4. **Given** an active run (`status=processing` with last stage transition inside the staleness threshold), **When** a second POST arrives, **Then** it returns 409 — seriality is server truth (FR35, AR18).
5. **Given** a `processing` run with no stage transition past the staleness threshold (config, default 3 min), **When** read, **Then** it renders as derived `interrupted` — no stored column, no background process (FR7, AR8).
6. **Given** a failed or interrupted run, **When** retried, **Then** a *new* run is created via the same POST; the old run remains untouched (FR8).
7. **Given** any stage transition, **Then** it is persisted and logged with `run_id` (FR4, AR23).
8. **Given** a mid-run `GET /api/runs/:id`, **Then** the run returns with `dishes: []` — dishes appear only after the single `saving` transaction (AR8).

### Story 1.4: Source Acquisition & Class Decision

As Ana,
I want the system to fetch my URL or read my file safely and decide honestly what kind of source it has,
So that extraction takes the right path and failures tell the truth.

**Acceptance Criteria:**

1. **Given** a URL run, **When** the fetch executes, **Then** only http/https are allowed; the hostname resolves via `dns.lookup` and private/loopback/link-local/metadata ranges (RFC1918, 127/8, 169.254/16, ::1, fc00::/7, 169.254.169.254) are refused; every redirect hop is re-validated; requests send realistic browser-like headers and carry size and time caps (FR36, AR11).
2. **Given** an SSRF refusal at fetch time, **Then** the run fails with the existing `unreachable_url` code and an honest message (the URL is not fetchable); DNS rebinding stays a documented accepted residual — no extra machinery (AR11; enum reuse ratified this session).
3. **Given** a URL failing DNS/timeout/4xx/5xx or exceeding caps, **Then** the run ends `failed(unreachable_url)` (E2) with actionable copy suggesting retry or the PDF/photo path (FR33).
4. **Given** a fetched page yielding no usable text (JS-rendered / bot-blocked; "usable" = the same minimum-chars threshold as the class decision — one config value, not two), **Then** the run ends `failed(no_usable_text)` (E3), suggesting the PDF/photo path — URLs are text-class by definition (AD-6).
5. **Given** an uploaded PDF, **When** pdfjs extracts its text layer (`@napi-rs/canvas` present; never installed with `--omit=optional`), **Then** class is `text` iff extracted chars ≥ the threshold (config), else `visual` (parse errors included) (AR10, AR15).
6. **Given** an uploaded image, **Then** class is `visual`; **Given** a URL whose final content-type after redirects is a PDF or an image, **Then** it takes that path (PDF ⇒ text-layer check, image ⇒ `visual`) — the final content-type decides, never the file extension (AR10).
7. **Given** acquisition succeeds, **Then** the acquired/extracted source text persists to `source_artifacts.acquired_text`, the class is recorded on the run, and transitions are logged (AR6, FR4).
8. **Scope guard (anti-over-engineering, ratified this session):** **Given** the fetcher, **Then** it is one plain GET per URL (following redirects) using Node's built-in `fetch` — no crawling beyond the submitted URL, no JS rendering or headless browser, no retry loops, no third-party HTTP client. A page that won't yield text gets the honest E3 answer, never more machinery (REQUIREMENTS §4).

### Story 1.5: Extraction Adapter — the OpenAI Seam

As Ana,
I want the model to read the menu and return structured dish signals through one honest boundary,
So that extraction is reliable, bounded, and auditable.

**Acceptance Criteria:**

1. **Given** the adapter, **Then** the OpenAI client arrives as an injected dependency and no SDK import exists outside it — this is the test seam (AR12).
2. **Given** a text-class run, **Then** the acquired text goes to the model as a text prompt; **Given** a visual-class run, **Then** the image goes as vision input or the PDF as native `input_file` (AR10, AR12).
3. **Given** any model call, **Then** structured outputs via `zodTextFormat` derived from the `shared` model-signal schema enforce the shape: dish rows with name, `price_raw`, allergens (canonical id + provenance + `evidence_quote` when declared), description + provenance, optional self-flag + reason (FR9, AR12).
4. **Given** invalid model output, **Then** exactly one retry happens; a second failure ends the run `failed(model_invalid_output)`; an API error ends it `failed(model_error)`; the ~120 s call timeout — the run's only technical timeout — ends it `failed(model_timeout)` (FR6, E7).
5. **Given** the runtime extraction prompt, **Then** it lives as a versioned file surfaced in `prompts/`, contains FR18's self-flag criteria, FR11's variant rule (one row per variant, dish-level info copied, never re-inferred), FR14's verbatim rule (names and descriptions stay in the menu's language — never translated), and FR21's negative-declaration rule ("gluten-free" and similar claims create nothing — the schema cannot express absence, and the model must not read a negative claim as a declared allergen); the model id comes from env (dev/final tiers) (AR13, FR11, FR14, FR18, FR21).
6. **Given** a completed model call, **Then** token usage is logged — the measured cost that feeds BUSINESS.md (NFR2).
7. **Given** a model result with zero dishes, **Then** the run completes as `status=empty` (E9) — a distinct honest terminal state, not a failure (FR33).
8. **Given** a model result with at least one dish, **Then** the run completes `done` with what was extracted — missed content is Ana's catch against the Original tab, and no partial-error mechanism exists (FR34).

### Story 1.6: Triage Core — the Deterministic Arbiter

As Ana,
I want every row flagged by deterministic rules with recorded reasons,
So that "auto-checked" means exactly "no rule fired" and I can always see why the system doubted.

**Acceptance Criteria:**

1. **Given** `server/src/core`, **Then** the arbiter, T6 verification, price parsing, and class decision are pure functions with no IO imports; core imports only `shared` (AR5).
2. **Given** a dish's `price_raw`, **Then** `price_value` is set only for a single unambiguous EUR value; absent/range/multiple/non-EUR leave it null (FR10).
3. **Given** validated model signals, **Then** a row is `uncertain` iff any rule fires, each fired rule appending its reason to `confidence_reasons`: T1 — any allergen `inferred` or dish allergen state `unknown` (dominant); T2 — `price_value` null; T3 — non-EUR or mixed currency; T4 — name empty, or on text-class sources not traceable to the source text (traceability uses the same pinned normalization chain as T6 — two builders must never diverge on the flag); T5 — model self-flag raised (FR15–FR18).
4. **Given** a `declared` allergen with no evidence quote, **Then** it is downgraded to `inferred` on any source class; **Given** a text-class run whose quote is not found in the acquired text after the pinned normalization — **Unicode NFKC → lowercase → NFD → strip combining marks (`\p{M}`) → collapse whitespace**, applied identically to both sides — **Then** it is downgraded likewise; downgrades run before triage and fire T1 (T6, AR14).
5. **Given** a verified quote, **Then** its match offsets into the acquired text are persisted — the web reuses them and never re-implements matching (AR14).
6. **Given** a visual-class run, **Then** quotes are not machine-verified (no ground text) and pass through for Ana's visual verification (FR19).
7. **Given** a row where no rule fires, **Then** `flag=reliable`; **And** every fired rule is logged with `run_id` (FR15, NFR5).
8. **Given** extraction + triage complete, **Then** all dishes are written in one transaction at the `saving` stage and the run ends `done` (AR8).

### Story 1.7: Submit & Watch — an Honest Waiting UI

As Ana,
I want to submit a menu and watch its real progress with honest failure states,
So that I always know what is happening and what to do next.

**Acceptance Criteria:**

1. **Given** the `/` submit page, **Then** it offers a URL field and a file input whose accept list is `image/jpeg,image/png,image/webp` / `application/pdf` — never `image/heic`; a raw `.heic` gets E4's actionable copy; malformed URLs are caught inline before POST (E1) (FR1, AR25).
2. **Given** a successful submit, **Then** the UI navigates to `/runs/:id` and polls via TanStack Query `refetchInterval` while the run is active; server state lives only in TanStack Query (AR26–AR27).
3. **Given** an active run, **Then** Ana sees the current stage in honest language (fetching and extracting shown; validating + saving as one finishing beat; the model stage names itself the long part) and a measured elapsed timer; **And** no percentage bar, dynamic ETA, or lone spinner exists anywhere (FR4–FR5).
4. **[P1]** **Given** an active run, **Then** the static expectation copy "typically 30–90 s" shows (final wording calibrated on dev test menus) (FR5 — the epic's only P1 item).
5. **Given** a run is active, **Then** the submit control is disabled — the UI mirrors the server's 409, which owns the truth (FR8, FR35, AR18).
6. **Given** each failure state, **Then** its copy is actionable: E2/E3 suggest the PDF/photo path; E7 shows the failure reason with retry; E8 shows "interrupted — retry available"; E9 shows the honest empty copy ("I couldn't find dishes in this source — is it a menu? Try another path."), distinct from failure; no dead end is silent (FR33, FG6).
7. **Given** a failed or interrupted run, **When** Ana clicks retry, **Then** a new run is created and she navigates to it; the old run is untouched (FR8).
8. **Given** a run completes `done`, **Then** a minimal read-only table shows the extracted rows (name, price, flag) — the Epic 2 review screen replaces this view (walking-skeleton evolution).

### Story 1.8: The One Test — Golden-Master + CI Complete

As the developer,
I want the single integration golden-master running in CI,
So that the whole promise — contract → triage → persistence — is locked by exactly one meaningful test.

**Acceptance Criteria:**

1. **Given** the Vitest test, **Then** it POSTs a fixture through the real API with the AD-12 seam mocked and real Postgres, polls to completion, and asserts the normalized completed-run payload against one committed golden (ids/timestamps frozen or excluded; ordering by `position`) (AR20).
2. **Given** the mocked model response, **Then** every rule T1–T6 fires at least once across the fixture's rows — the T6 downgrade path included — **and** at least one row stays fully `reliable`; the golden asserts each fired rule by its id in the corresponding row's `confidence_reasons`, so the test fails naming the rule if any of T1–T6 ever stops firing (AR20; the per-rule guarantee is the mechanism's strength — ratified this session).
3. **Given** the repo, **Then** exactly one test exists — no second test file, no smuggled suite (R8).
4. **Given** CI, **Then** the `checks` job runs typecheck + the test against a Postgres service container and passes (AR21).

*Exit-gate note (ratified at the elicitation pass): Epic 1 is not done until this story passes — R8 ("exactly one meaningful automated test") is a hard submission requirement; unlike any P1, this story is never cuttable under the D8 ladder.*

## Epic 2: Review & Confirm — verdicts with evidence in view

Ana reviews on one screen: the dish table with provenance badges, honest flag copy,
inline reasons, and the Original-first evidence panel; she confirms or marks for
follow-up — individually or in batch, reversibly, through one review endpoint. Her review
is the deliverable. Stories are priority-pure: 2.1–2.2 are P0, 2.3–2.4 are P1 — if time
runs short, 2.3/2.4 fall whole without touching a line of P0 (D8 cut ladder).

### Story 2.1: The Review Endpoint — One Path for Every Verdict (P0)

As Ana,
I want my decisions persisted through one honest path,
So that my review is the deliverable and the audit record never lies.

**Acceptance Criteria:**

1. **Given** `POST /api/runs/:id/reviews`, **When** called with a batch of decisions `{dish_id, action: confirm | followup | reopen, note?}`, **Then** all decisions apply atomically; a single review is a batch of one (AR17).
2. **Given** any review action, **Then** only review fields change (review status, note, decided-at timestamp); extracted values are immutable after the run persists; the audit record is the last decision + its timestamp (FR27 data, FR28).
3. **Given** a followup decision, **Then** the optional one-line note persists (nullable column — the system's only free-text field) (FR25, NFR4).
4. **Given** a run read, **Then** menu done-ness and review progress ("N of M resolved") are derived at read time, never stored (FR22, AR8).
5. **Given** the route table, **Then** no other mutation route and no DELETE endpoint exists (AR16).
6. **Given** an unknown `dish_id` or invalid action, **Then** a 4xx error envelope returns and nothing partial is applied.

*Contract note (ratified this session): the endpoint implements the full AD-9 action enum — `reopen` included — because splitting a closed contract across stories fragments it; what is P1 is the reopen UI affordance (Story 2.3). Marginal cost ≈ zero, contract whole from day one.*

### Story 2.2: The Review Screen — Flags, Reasons, and Verdicts in One Place (P0)

As Ana,
I want the dish table to show what the system claims and why it doubts,
So that I can resolve each row with the evidence of my own judgment.

**Acceptance Criteria:**

1. **Given** `/runs/:id` on a `done` run, **Then** the full dish table replaces Story 1.7's minimal view: name, price (raw + value), description with visible `generated` label (FR12 display), allergen badges distinguishing `declared` vs `inferred` with dish-level `unknown` rendered distinctly (FR13 display), and flag copy "auto-checked"/"needs review" — never "safe"/"verified" (FR15 display).
2. **Given** an uncertain row, **Then** its fired rules (`confidence_reasons`) and evidence quotes render inline — Ana never guesses what the system doubted (FR24, FR19 display).
3. **Given** any row, **When** Ana confirms or marks for follow-up individually, **Then** the action posts through Story 2.1's endpoint and the UI reflects the persisted state; copy is "mark for follow-up", never dead-end framing (FR22, FR25 copy).
4. **Given** the review screen, **Then** the NFR3 disclaimer "AI-extracted — verify before publishing" is always visible.
5. **Given** all rows resolved, **Then** the menu shows done (server-derived); doubtful rows can be part of a done menu (FR22).
6. **Given** a wrong extracted value, **Then** no inline-editing affordance exists anywhere (FR28).
7. **Given** an `empty` run (E9), **Then** the review screen renders the honest empty state — never a mute zero-row table (FR33, FG6).

### Story 2.3: Review Depth — Batch, Reversibility, Note, and the Honesty Notice (P1)

As Ana,
I want batch mechanics, reversibility, and menu-level honesty,
So that triage pays off and no decision is a trap.

**Acceptance Criteria:**

1. **Given** auto-checked rows, **When** Ana clicks "confirm all auto-checked", **Then** one batch call confirms them — the payoff of triage (FR26).
2. **Given** free multi-row selection not filtered by flag, **When** Ana resolves the selection, **Then** one batch call applies it — the system routes attention, never handcuffs (FR26).
3. **Given** a resolved row, **When** reopened, **Then** it returns to unresolved via the same endpoint; done-ness reverts (FR27).
4. **Given** a follow-up, **Then** the optional one-line note can be entered and shows with the row (FR25).
5. **Given** a menu with zero `declared` allergens, **Then** the FR20 notice renders above the table; the same pattern names a non-EUR currency when T3 fired menu-wide (FR20).

### Story 2.4: The Evidence Panel — Original First (P1)

As Ana,
I want the original source beside what the system read,
So that I can catch what the extractor missed — the one thing no flag can route me to.

**Acceptance Criteria:**

1. **Given** `GET /api/runs/:id/artifact`, **Then** stored bytes serve with correct `Content-Type`, `X-Content-Type-Options: nosniff`, and accepted MIME types only; acquired text serves as `text/plain`, never `text/html` (AR9).
2. **Given** the review screen, **Then** a two-tab panel sits beside the table: "Original" (default) — image rendered, PDF in a browser-native embed, URL as an external link with the honest live-page note (FR23).
3. **Given** the "What the system read" tab, **Then** the acquired source text renders with T6-verified quotes highlighted via the persisted match offsets — zero client-side matching (FR23, AR14).
4. **Given** a run opened from History, **Then** the panel works identically — source artifacts are first-class persisted data (FR23).
5. **Given** a visual-class run, **Then** quotes show as unverified evidence for Ana's visual check against the Original (FR19 display).

## Epic 3: History — the living audit record

Ana finds every run — processing, interrupted, failed, empty, and done alike — newest
first; opening one leads to the same review screen; nothing is ever deleted. One vertical
story: it also implements the route table's `GET /api/runs` list endpoint. Priority note
(ratified this session): FR30 was absent from the PRD's P0/P1 lists — a Build Priority
gap. Ratified **P0** here: without opening a run from History, FR3's promise ("the run
finishes and is found in History") breaks — finding without opening is useless, and the
deep link costs a route, not a feature.

### Story 3.1: History — the Living Audit Record (P0)

As Ana,
I want every run findable, openable, and retryable from one list,
So that my work survives any interruption and my record defends me over time.

**Acceptance Criteria:**

1. **Given** `/history`, **When** opened, **Then** `GET /api/runs` lists all runs newest first — date/time, source (type + file name or URL), state (`processing`/`interrupted`/`failed`/`done`/`empty`, derived states included), review progress ("N of M resolved"), and dish count; the list query never selects artifact `bytes` (FR29, AR9).
2. **Given** a first visit with no runs, **Then** "no extractions yet" shows with a pointer to submit — never a mute table (FR29).
3. **Given** any run entry, **When** opened, **Then** it deep-links to `/runs/:id` — the same review screen, evidence panel included (FR30, AR26).
4. **Given** a failed or interrupted run, **Then** retry is offered from the list and creates a new run via the existing POST (FR8, FR30).
5. **Given** the history page, **Then** no delete affordance exists (FR31) and no search/filter controls exist — a plain recent-first list; pagination only if volume demands it (FR32, deferred).
