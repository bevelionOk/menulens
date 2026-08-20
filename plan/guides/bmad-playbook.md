# BMAD Playbook — Phase 2 Detailed Guide

Companion to [plan/02-bmad-planning.md](../02-bmad-planning.md).
**Scope note: everything in this guide is for the REAL challenge run in this repo.**
The only practice happens beforehand in `~/dev/bmad-sandbox` (separate install; nothing
from it is logged or committed here).

## 1. How every session works, mechanically

1. Open Claude Code **in this repo's root** and invoke the skill (e.g. `/bmad-product-brief`).
2. The agent facilitates: it asks, you decide. It will offer menus/options — you can
   answer in Spanish; documents come out in English (configured).
3. Artifacts land in `_bmad-output/planning-artifacts/` — committed after each session.
4. Every prompt you type is captured into `prompts/02-bmad-analysis/` or
   `prompts/03-bmad-architecture/` (Claude logs them as part of closing each session).
5. One session at a time, in order. If a session's output feels weak, re-run that section
   immediately (see scenarios, §7) — never move forward on a shaky artifact.

**Golden rule for the 25%**: reviewers detect cosmetic BMAD by checking whether artifacts
*reference and constrain each other*. Every PRD requirement should trace to the brief;
every architecture decision to a PRD requirement; every story to the architecture. When
in doubt, say less but make it traceable.

## 2. The product framing to carry in (decided, bring it — don't improvise)

- **Persona**: operations person at a food-ordering platform onboarding restaurant menus
  ("Ana, onboarding ops"). She needs structured dish data fast, but is accountable for
  allergen correctness — she reviews before publishing.
- **Job to be done**: turn any menu (URL/PDF/photo) into reviewable structured rows in
  under a minute, with her attention directed only at the uncertain rows.
- **Why this framing wins**: it makes the confidence flag *load-bearing* (a review queue
  needs it) instead of decorative — and it feeds BUSINESS.md (her time is the value).
- **Non-goals to state explicitly**: menu editing/publishing, user accounts, multi-tenant,
  analytics, i18n of the UI.

## 3. Session-by-session guide

### 3.1 `/bmad-product-brief` (~30–45 min)

**It will ask about**: the problem, who has it, current alternatives, vision, success
criteria, constraints, risks, non-goals.

**Example exchange** (style to aim for — decisive, scoped):

> *Agent*: Who experiences this problem most acutely, and what do they do today?
> *You*: Ana, onboarding ops en una plataforma de pedidos. Hoy transcribe menús a mano,
> 15–30 min por menú, y los errores de alérgenos son su responsabilidad legal. Alternativa
> actual: planilla + copy-paste. No vamos a cubrir edición ni publicación del menú — solo
> extracción estructurada + revisión.

**Bring**: persona (§2), success = "menu → reviewable rows < 1 min, uncertain rows
flagged", constraints = challenge stack (fixed), non-goals list.
**Traps**: the agent may push toward market sizing / competitor analysis — decline:
"fuera de alcance, es un challenge con producto fijado" (that refusal itself shows judgment).

### 3.2 `/bmad-prd` (~60–90 min, the heavyweight)

**It will ask about**: users & flows, functional requirements, non-functional requirements,
edge cases, acceptance criteria, scope lines.

**Decisions this session MUST close** (bring positions, let the session pressure-test them):

| Decision | Recommended position to open with |
|---|---|
| **D4: confidence flag semantics** | "uncertain" = fails any verifiable check: missing/implausible price, allergens not literally traceable to source text, dish name not traceable, description synthesized from nothing. Binary flag; per-check reasons stored so the UI can show *why*. Model self-reported confidence: not used (evidence in DECISIONS.md D4). |
| Sync vs async UX | Synchronous request with visible progress state; no job queue (guardrail). Timeout ~60 s with clear error. |
| History | A simple list of past extractions (persistence must be *visible* to prove R7). No search/filter/pagination beyond basics. |
| Error states | Non-menu URL, unreachable URL, oversized file, unsupported type, zero dishes found — each gets defined UI copy. |
| "Clean UI" scope | One page: input (URL field + file drop) → results table (name, price, allergens as badges, description, confidence badge) + history list. Nothing else. |

**NFRs — keep only the real ones**: extraction latency target, cost/menu envelope (from D3),
no PII stored, allergen disclaimer in UI ("AI-extracted — verify before publishing").

### 3.3 `/bmad-architecture` (~45–60 min)

**Decisions this session MUST close**:

| Decision | Recommended position to open with |
|---|---|
| Topology | One Fastify service + Vite SPA + Postgres. Full stop (guardrail). |
| URL ingestion | Server-side `fetch` with realistic headers → HTML-to-text reduction → LLM. **No headless browser** — JS-rendered sites are a documented limitation (feeds "what breaks in production"). |
| PDF path | Text extraction (e.g. pdf-parse). Scanned/no-text-layer PDFs: not supported in v1 — UI suggests uploading a photo instead (vision path). Avoids native system deps that would endanger the <5-min README (R-10). |
| Image path | Vision via data URL, budget model first (D3). |
| LLM contract | JSON mode + **Zod validation** of the response, shared schema FE/BE; one retry on invalid JSON; then error state. |
| Schema | `menus` (id, source type/ref, status, timestamps) + `dishes` (menu_id, name, price, currency, allergens[], description, confidence, confidence_reasons[]). Real Drizzle migration committed (R2). |
| **The one test** | Integration/golden-master: POST a fixture menu through the real API route with a **mocked OpenAI client** and real Postgres → assert persisted rows incl. confidence derivation. Justification: crosses every layer we wrote (route→service→validation→DB), deterministic, zero API cost; unit tests would cover less per test and E2E would mostly test the LLM, which we don't control. |

### 3.4 `/bmad-create-epics-and-stories` (~30 min)

Expect **1 epic, 5–7 stories** matching plan/03's table. Each story: acceptance criteria
traceable to a PRD requirement. If the agent proposes a second epic ("admin", "settings") —
cut it, log the cut.

### 3.5 `/bmad-sprint-planning` (~15–30 min)

The gate. It audits whether planning is implementable and emits PASS/CONCERNS/FAIL plus
the sprint-status file the build loop follows. See §7 for the CONCERNS scenario.

## 4. Pablo's do/don't in sessions

**Do**: answer in first person as product owner; give reasons with decisions ("X porque Y");
name what you're cutting in the same breath; ask the agent to tighten anything vague.
**Don't**: answer "lo que te parezca" / "dale" (that's the blind copy-paste smell the
rubric auto-rejects); accept scope you'd have to build; let a session end without its
decisions closed.

## 5. Time budget for Aug 21

Sandbox practice 30–45 min → brief ~45 → PRD ~90 → break → architecture ~60 →
stories ~30 → gate ~30 → commit & decision-log pass ~30. Total ≈ 5–6 h focused.

## 6. What gets committed after Phase 2

`_bmad-output/planning-artifacts/*` (brief, PRD, architecture, epics/stories, sprint
status), `prompts/02-*` and `03-*` entries, DECISIONS.md updates (D4 closed, test choice,
architecture trade-offs), any REQUIREMENTS.md checkbox flips.

## 7. Scenarios you may hit (and the move)

| Scenario | The move |
|---|---|
| Agent proposes features beyond the lighthouse (auth, dashboards, queues) | "Fuera de alcance — REQUIREMENTS.md §4" and continue. The refusal in the transcript is rubric gold. |
| Agent's question is ambiguous or overlaps something already decided | Point at the earlier artifact: "eso quedó definido en el brief como X". Traceability again. |
| An answer of yours gets challenged and the agent is right | Change position and say why — visible course-correction scores Critical Thinking. Update DECISIONS.md same day. |
| Gate returns CONCERNS | Address each named concern in the artifact it points to (usually PRD or stories), re-run the gate. Do not proceed on CONCERNS — a PASS after a fix is a *better* story than a first-try PASS. |
| Gate returns FAIL | Stop; re-run the weak session (usually PRD scope). Budget 1 extra hour; the calendar holds (R-01). |
| Artifact reads generic/template-ish on your review | Re-run that section with sharper inputs (R-07). Never hand-edit the artifact to fake depth — the prompt log would contradict it. |
| Session stalls / tooling dies mid-way (R-11) | Everything is files: commit what exists, reopen, resume the skill — BMAD picks up from the artifact state. |
