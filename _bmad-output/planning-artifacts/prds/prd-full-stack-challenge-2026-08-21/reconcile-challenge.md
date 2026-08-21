# Reconciliation — Challenge BRIEF vs PRD

- **Input:** `docs/challenge/BRIEF.md` (verbatim challenge statement, pinned 6be4b93)
- **PRD:** `prd.md` + `addendum.md` (prd-full-stack-challenge-2026-08-21)
- **Date:** 2026-08-21
- **Verdict: 3 gaps** (1 letter-level narrowing, 1 spirit-level risk, 1 minor documented-reading note). No silent drops of any task element; no auto-reject contradictions.

## 1 · Coverage matrix — "The task" section

| Challenge element (letter) | PRD coverage | Status |
|---|---|---|
| Input: public restaurant menu URL | FR1 (http/https), E1–E3 failure states, FR36 SSRF guard | Covered (see Gap 1 note on E3) |
| Input: uploaded menu PDF | FR1, FR2 (10 MB cap), E5, E6 | Covered **with narrowing** (Gap 1) |
| Input: uploaded menu image | FR1 (JPG/PNG/WebP, HEIC handling), FR2 | Covered |
| LLM extraction | Constraints (OpenAI SDK, JSON mode, vision for images); FG2 contract | Covered |
| Field: name | FR9, FR11 (variants), T4 | Covered |
| Field: price | FR9, FR10 (`price_raw` verbatim + `price_value` numeric), T2/T3 | Covered — verbatim capture satisfies the letter even when numeric parse is withheld |
| Field: allergens (list) | FR9, FR13 (EU-14 closed vocabulary, provenance), FR19 evidence quotes | Covered (see Gap 3 on the EU frame) |
| Field: one-line description | FR9, FR12 (`extracted`/`generated`, labeled) | Covered — the generated-when-absent policy is a defensible reading of a required field most menus leave empty (addendum records the R6 evidence) |
| Field: confidence flag per row, reliable/uncertain, "your choice how to derive it" | FG3 entire: FR15–FR21, T1–T6 deterministic arbiter | Covered — derivation choice explicitly exercised and justified (D4 closed) |
| Persisted to Postgres | FR3 (born persistent), FG5 history, Constraints (PG + Drizzle + real migration), addendum storage notes (bytes + source text) | Covered |
| Shown in a clean UI | FG4 review screen, FR29 history, Constraints (React/Vite/Tailwind/shadcn) | Covered **and exceeded** (Gap 2) |

## 2 · Coverage — "Requirements" section (technical)

All eight inherited whole in the PRD Constraints block: Fastify/TS backend, PG + Drizzle with real migration, React/Vite/TS/Tailwind/shadcn, OpenAI SDK JSON mode + vision, exactly one test (choice + justification tracked as an open item into architecture — correct altitude), Pino structured logs (NFR5 goes further: T1–T6 firings auditable in logs). Secrets/`.env.example` is a repo hygiene rule, not PRD scope — correctly absent.

## 3 · Contradiction check — letter and spirit

**Auto-reject list:** clean. No microservices, no k8s, no event bus; queue/worker infra, SSE/WebSocket, reaper processes explicitly cut (Scope-Out + addendum ADR). The in-process-promise + polling model is squarely inside "no queue infrastructure" and the addendum shows the reasoning was real, not cosmetic.

**"Judgment, not hours":** the PRD demonstrates judgment throughout (D4 hybrid arbiter, honest-progress bans, the two-durabilities split). But see Gap 2 — the product surface itself is the one place where the hours question bites back.

**BMAD-as-decoration risk:** none visible from these artifacts — decisions evolve on-page (processing model superseded, description policy reversed on evidence, evidence panel corrected in session), which is exactly what "real, not cosmetic" looks like.

## 4 · Gaps

### Gap 1 (letter — input narrowing): scanned PDFs are rejected (E6) though "uploads a menu PDF" is unqualified in the task

The challenge names PDF as a first-class input with no qualifier. E6 declares scanned/no-text-layer PDFs "not supported in v1: suggest uploading a photo". In the wild, scanned PDFs are arguably the *most common* form of restaurant menu PDF — a reviewer who tests with one hits a rejection on an input type the task letter includes. The workaround (photo → vision path) is honest and actionable, and the underlying rationale is real (rasterizing PDF pages needs a native/heavy dependency, conflicting with the 5-minute-README rule R-10). But that defense currently lives nowhere: the PRD states the cut without the reasoning, and the obvious counter — vision is already a required capability; PDF-page-to-image would extend it — is never engaged. **Action:** record the scanned-PDF cut and its dependency rationale explicitly in DECISIONS.md, and consider naming it in the "what breaks in production" narrative. (Related, lesser: E3 makes JS-rendered menu URLs a documented limitation — defensible, since the fix is a headless browser, which *would* be over-engineering; the PDF/photo fallback is the right call. Mentioned here only because E3 + E6 together make the practical input surface visibly narrower than the task's three-input letter, and that combined narrowing deserves one honest sentence somewhere reviewer-visible.)

### Gap 2 (spirit — scope risk): the review/confirmation product layer exceeds "shown in a clean UI. That's it." and the PRD never names that trade-off

The task ends: results persisted and shown in a clean UI — "That's it." The PRD builds substantially more product: a confirm/mark-for-follow-up workflow with batch mechanics and reversible resolution (FR22–FR28), a two-tab evidence panel with quote highlighting (FR23–FR24), follow-up notes, history with per-run review progress (FR29–FR31), and menu-level honesty notices (FR20). There is a genuinely good defense — a `reliable`/`uncertain` flag *implies* someone acts on uncertainty, so a minimal review loop is the flag's meaning made usable, and the challenge explicitly leaves effort to the candidate's call. But this is the PRD's single biggest bet against "judgment, not hours", and the document's over-engineering guardrails are all infrastructure-level (queues, SSE, ETAs); nowhere is *product-surface* scope weighed against the challenge's deliberately tiny letter. A grader could read FG4/FG5 as gold-plating the slice. **Action:** one explicit DECISIONS.md entry defending the review-loop scope against "That's it" (why the flag demands a consumer; what an even-smaller UI would have failed to show), so the scope reads as a chosen trade-off, not unexamined growth. No requirement needs to change.

### Gap 3 (minor — documented reading): the EUR/EU-14 frame is a strong localization of an unlocalized challenge

The challenge specifies no locale. The PRD fixes EUR as the working currency (T3 fires on non-EUR) and the EU-14 vocabulary for allergens. The letter survives: price is always captured verbatim in `price_raw`, and EU-14 is a superset-ish frame covering the major allergen families — so a $-priced menu still yields correct, honest rows (they just all triage `uncertain` on price). The reading is defensible and the PRD does mark the currency-selector cut as deliberate. Flagged only because a grader testing with a non-EU menu will see a wall of `uncertain` price rows, and the FR20-style explanation covers allergens, not currency. **Action (optional):** consider letting T3's fired-rule reason (FR24) carry copy as self-explanatory as FR20's allergen notice, and note the EU frame choice in DECISIONS.md alongside the currency cut.

## 5 · What was checked and found clean (explicitly)

- All five extracted fields present, each with a stronger-than-asked contract (provenance, verbatim capture, evidence quotes).
- Confidence-flag derivation: the "your choice" clause is exercised with the challenge's best-case answer — deterministic arbiter over model signals, choice documented (D4), even the leading single-test candidate flows from it.
- Persistence: not merely stored but *visibly* persisted (FR3, FR29–FR31) — exceeds the letter in the direction the letter points.
- No forbidden infrastructure anywhere; every cut in Scope-Out traces to a reason in the addendum.
- Ambiguous wordings ("confidence flag… your choice", "one-line description" on description-less menus, "clean UI") all resolved with recorded reasoning; none resolved silently.
- Process deliverables (videos, prompts, DECISIONS.md, BUSINESS.md, submission mechanics) correctly absent from PRD scope; NFR2 correctly feeds BUSINESS.md without pulling it into the PRD.
