# Epic 1 Context: Extract & Triage — from menu source to honest, flagged rows

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver the extraction pipeline end to end: Ana (the single operator) submits one menu source — public URL, PDF, or image — watches a persistent, honestly reported run, and gets dish rows each carrying a deterministic confidence flag with recorded reasons, replacing manual transcription while keeping her accountable for allergens. Governing principle: the system never claims more than it can prove; everything unproven reaches the reviewer with evidence in view. Scope spans the scaffold, the real migration, the SSRF-guarded fetch, the model seam, the pure arbiter, all failure states, and the single integration test plus CI; Epic 2 later evolves the minimal completion view into the review screen.

## Stories

- Story 1.1: Project Scaffold & Foundations
- Story 1.2: Shared Contract & Data Layer
- Story 1.3: Persist-First Run Lifecycle API
- Story 1.4: Source Acquisition & Class Decision
- Story 1.5: Extraction Adapter — the OpenAI Seam
- Story 1.6: Triage Core — the Deterministic Arbiter
- Story 1.7: Submit & Watch — an Honest Waiting UI
- Story 1.8: The One Test — Golden-Master + CI Complete

## Requirements & Constraints

- One source per run (http/https URL, PDF, JPG/PNG/WebP); over-10 MB uploads rejected pre-run with the cap stated; raw `.heic` rejected with clear copy — the accept list must never include `image/heic` (exclusion triggers OS HEIC→JPEG auto-convert).
- Runs are born persistent (row + id before any processing; observable independently of the browser) and move through real stages only: `fetching_source → extracting → validating → saving → done | failed`. The single technical timeout is the ~120 s model call. Retry = new run; one active run at a time (409); a `processing` run stalled past the config threshold (default 3 min) reads as derived "interrupted".
- Per dish: name; verbatim price string with numeric value only when a single unambiguous EUR amount (else null, a triage signal — never a guess); EU-14 allergens (closed canonical ids), each `declared` with evidence quote or `inferred`, none found = `unknown`; description tagged `extracted`/`generated`; the flag. Variants become one row each with dish-level info copied, never re-inferred; text stays verbatim in the menu's language; negative claims ("gluten-free") create nothing.
- The flag (`reliable`/`uncertain`) comes only from deterministic rules T1–T6 over model-supplied signals (provenance, evidence quotes, criteria-anchored self-flag — never raw model confidence). The allergen gate T1 (any inferred/unknown) dominates; T6 downgrades unproven `declared` to `inferred` before triage and fires the gate; doubt resolves toward uncertain; every fired rule records its reason.
- Failure inventory is closed: pre-run 4xx (invalid URL / unsupported file / oversize) never create a run row; stored reasons: unreachable URL, no usable text, model timeout/error/invalid-output (one retry only); `interrupted` derived, never stored; zero dishes = honest `empty` status, distinct from failure; partial extraction is never a failure. Pino logs every stage transition and fired rule with the run id; token usage logged (measured cost feeds BUSINESS.md); no PII columns.

## Technical Decisions

- npm workspaces monorepo `server/` + `web/` + `shared/` (plain npm), built only from official scaffolds, majors pinned as scaffolded, Node ≥ 22.13. Stack: Fastify (+multipart) with native Pino, Drizzle + Postgres 16 (Docker Compose, local-only), React + Vite + Tailwind + stock shadcn/ui, TanStack Query, Zod 4, openai SDK (`zodTextFormat` structured outputs), pdfjs-dist (needs its optional `@napi-rs/canvas`; never install `--omit=optional`); dev = tsx watch + Vite via concurrently, `/api` proxied.
- Functional core / imperative shell: arbiter, evidence verify, price parse, and class decision are pure functions in `server/src/core` — no IO imports, core imports only `shared`; the shell (`pipeline/`, `routes/`, `db/`) does IO; extraction is an in-process promise — no queues, workers, or sockets.
- `shared` owns the contract: one base Zod schema per entity, variants via `.pick()/.extend()/.omit()`, Zod its only runtime dependency, consumed as TS source.
- Tables `runs`, `dishes`, `source_artifacts` (1:1: uploaded bytes, acquired text, content type); allergens + confidence reasons as jsonb on the dish; server-assigned `position` orders every read; committed Drizzle SQL migration; uuid ids, `timestamptz` UTC; DB snake_case, TS camelCase, files kebab-case.
- Run truth = `status` (`processing|done|failed|empty`) + `stage`; derived state computed at read, never stored; dishes written in one transaction at `saving` (mid-run reads return an empty list); list queries never select artifact bytes.
- Source class per run by usable ground text: URL or PDF text layer ≥ one config threshold ⇒ `text`; image or PDF below it / parse error ⇒ `visual`; model input and quote verification key on class; final content-type after redirects decides handling. Fetcher: one plain GET (built-in fetch), `dns.lookup` refusing private/loopback/link-local/metadata ranges, redirect hops re-validated, browser-like headers, size/time caps; DNS rebinding a documented residual; no headless browser, retries, or third-party HTTP client.
- OpenAI enters through exactly one injected adapter (the test seam): strict schema from the shared model-signal schema, vision/native-PDF input for visual runs, one retry on invalid output, model ids from env; the extraction prompt is a versioned file in `prompts/` carrying the explicit self-flag criteria.
- One pinned normalization for quote verification and name traceability (NFKC → lowercase → NFD → strip combining marks → collapse whitespace), applied to both sides; match offsets persisted so the web never re-implements matching.
- Exhaustive API: `POST /api/runs`, `GET /api/runs`, `GET /api/runs/:id`, `GET /api/runs/:id/artifact`, `POST /api/runs/:id/reviews`; no DELETE. Error envelope `{ error: { code, message } }`, closed reason enum; the failure handler never throws — every transition ends persisted or hits the staleness net.
- Exactly one automated test: a Vitest integration golden-master — POST a fixture through the real API (seam mocked, real Postgres), poll to completion, assert the normalized payload against one golden; the mock fires all T1–T6 (T6 downgrade included) plus one fully reliable row, each fired rule asserted by id. CI = existing gitleaks + a `checks` job (typecheck + the test on a Postgres service container).
- Env validated fail-fast at boot with Zod; `.env.example` complete, no secrets. Anti-over-engineering: accept scaffold defaults as-is; build nothing beyond what acceptance requires.

## UX & Interaction Patterns

- Routes `/` (submit) and `/runs/:id` (react-router); server state only in TanStack Query, polling while active; no global client store.
- Honest waiting UI: real stage in plain language (the model stage names itself the long part), measured elapsed timer, static "typically 30–90 s" copy (the epic's only P1 item); percentage bars, dynamic ETAs, and lone spinners are banned. Submit disabled while a run is active (mirrors the server's 409); malformed URLs caught inline before POST.
- Every failure shows actionable copy (fetch/text → suggest the PDF/photo path; model failure/interruption → retry; zero dishes → distinct honest empty copy — never a mute table). Completion shows a minimal read-only table (name, price, flag), replaced in Epic 2. Stock shadcn/ui + default Tailwind tokens, desktop-first, Radix-baseline accessibility only.

## Cross-Story Dependencies

- No story depends on a future one: a run created before the pipeline exists ends honestly as interrupted; acquisition, extraction, and triage then make each stage real in order. The scaffold (1.1) and shared contract + migration (1.2) underpin everything; the arbiter (1.6) consumes the adapter's validated signals (1.5), which consume the class decision and acquired text (1.4).
- Story 1.8 is the exit gate — the epic is not done until the golden-master passes in CI; never cuttable.
- Epic 2 replaces the minimal completion view (walking-skeleton of one page) and displays what this epic captures (provenance labels, badges, flag copy, quotes + persisted offsets, stored artifacts); Epic 3 re-surfaces retry from History.
