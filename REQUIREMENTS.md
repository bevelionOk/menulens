# Requirements Lighthouse — Annex

Single-page checklist distilled from the challenge brief and job description — pinned
verbatim copies live in [docs/challenge/](docs/challenge/) (BRIEF.md + JOB.md, commit
`6be4b93`), with our reading in [docs/challenge/INTERPRETATION.md](docs/challenge/INTERPRETATION.md).
Purpose: **a lighthouse to steer by** — nothing required gets missed, nothing beyond it gets built.
Re-read before every phase; every task must map to a line here or it gets cut.

## 1. Hard requirements (all must be true at submission)

| # | Requirement | Status |
|---|---|---|
| R1 | Backend: Node.js + Fastify + TypeScript | ☐ |
| R2 | PostgreSQL + Drizzle, with a **real migration file** | ☐ |
| R3 | Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui | ☐ |
| R4 | LLM: OpenAI SDK, JSON mode; **vision** when input is an image | ☐ |
| R5 | Input paths: public menu **URL** + uploaded **PDF/image** | ☐ |
| R6 | Extracted per dish: name, price, allergens (list), one-line description, **confidence flag** (derivation is our documented choice) | ☐ |
| R7 | Results persisted to Postgres and shown in a clean UI | ☐ |
| R8 | **Exactly one** meaningful automated test — type chosen and justified in DECISIONS.md | ☐ |
| R9 | Structured Pino logs on the backend | ☐ |
| R10 | BMAD drives planning **and** implementation; artifacts checked into the repo | ☐ |
| R11 | Every prompt to any LLM captured in `prompts/` (first-class deliverable) | ☐ |
| R12 | `.env.example` only — no real keys ever committed (history included) | ☐ |

## 2. Deliverables (all required)

- ☐ Repo with runnable app + README (fresh install/run in **under 5 minutes**)
- ☐ `DECISIONS.md` — trade-offs, alternatives considered, what was cut and why
- ☐ BMAD artifacts — product brief / PRD / architecture / stories / dev-story output
- ☐ `prompts/` — organized so a reviewer can follow the thought sequence
- ☐ Personal video (3–5 min) — who, why this role, why a fit
- ☐ Walkthrough video (5–10 min) — what, why, what's next, **what breaks in production**
- ☐ `BUSINESS.md` — one paragraph: price for this feature + why
- ☐ Single link containing everything + working email → gerdrn+hiring@gmail.com, **by 2026-08-25**

## 3. Auto-reject tripwires

- No prompts, or prompts showing blind copy-paste
- BMAD as decoration (cosmetic use)
- **Over-engineering: microservices, k8s, event bus** (named explicitly)
- Secrets in repo
- No personal video
- Cannot explain what breaks in production

## 4. Over-engineering guardrails — deliberately OUT of scope

The brief: *"Effort is your call. We want to see judgment, not hours."* We will NOT build:

- Microservices, k8s, event bus — one Fastify service, one Vite frontend
- Redis / BullMQ / job queues — extraction handled without queue infrastructure
- Auth, user accounts, roles — not asked
- Monorepo tooling (Nx/Turborepo) — plain workspace layout
- Deployment infra / IaC / multi-env config — Docker Compose for local Postgres only
- A test *suite* — **exactly one** test; more violates the brief as much as zero
- Custom design system — stock shadcn/ui components
- Speculative features (menu editing, i18n, exports, …) unless the PRD justifies them

**Guard question before every execution:** *does this map to a line in §1–§2 or a rubric row in §6? If not — cut it and log the cut in DECISIONS.md.*

## 5. Alignment signals (not required, but scored or cheap wins — from JOB.md)

- **Zod** — named in the rubric ("idiomatic React/Fastify/Drizzle/Zod"): validate API I/O and LLM JSON output with Zod schemas
- **TanStack Query** — their frontend stack; natural fit for fetch/poll state
- **Playwright** — their E2E tool; the candidate if the single test is E2E
- **GitHub Actions** — named in their infra stack (JOB.md), not a deliverable: one minimal
  CI workflow (secret scan over full history now; typecheck + the single test once code
  exists). Anything beyond — deploy pipelines, matrices, branch-protection ceremony — is
  over-engineering for this slice (D12)
- Crisp written communication — their stated working mode (build → explain → review → ship)

## 6. Rubric map (where the points are)

| Rubric row | Weight | Earned mainly by |
|---|---|---|
| BMAD fluency (real, not cosmetic) | 25% | Artifacts flowing into each other; decisions traceable brief → PRD → arch → stories → code |
| Prompt quality | 20% | `prompts/` legible sequence, intent-rich prompts, visible iteration |
| Stack competence | 15% | Idiomatic Fastify/Drizzle/React/**Zod**, real migration, clean shadcn UI |
| Critical thinking | 15% | DECISIONS.md: trade-offs, risks, cuts, test-choice justification, confidence-flag derivation |
| Business mindset | 10% | BUSINESS.md pricing w/ reasoning (unit cost per extraction!), risk framing |
| Communication | 10% | Two videos + decision-log clarity |
| Independent judgment | 5% | Scope choices, knowing when NOT to use heavy machinery |

## 7. Pre-submission checklist

- ☐ Fresh-clone test on a clean checkout: README steps < 5 min to running app
- ☐ Secret scan over working tree **and git history**
- ☐ `prompts/` complete, ordered, with outcomes
- ☐ BMAD output folders committed (not gitignored)
- ☐ Both videos recorded, uploaded, linked and playable in incognito
- ☐ DECISIONS.md covers: single-test justification, confidence-flag logic, production failure modes, cuts
- ☐ BUSINESS.md exactly one paragraph
- ☐ All repo documents in English (prompts stay verbatim in their original language)
- ☐ Single link opens to everything; submission email sent
