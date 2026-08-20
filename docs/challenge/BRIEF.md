<!-- PROVENANCE: verbatim copy of README.md from https://github.com/roenschg/vibe-coder-challenge
     pinned at commit 6be4b93 (2026-08-11), retrieved 2026-08-20. Unmodified below this line.
     Our reading: INTERPRETATION.md · Operational checklist: /REQUIREMENTS.md -->

# Coding Challenge — Senior Full-Stack Vibe-Coder (BMAD)

Welcome. This is an **open competition**: anyone can submit. We review every submission against the rubric below and invite the top candidates to a deep-dive interview.

We are hiring for a production role at an industry-backed startup. The platform is already live. We want to see how you think, how you use BMAD, and how you write prompts — not how many hours you can burn.

---

## The task

Build a small full-stack app:

> A user pastes a **public restaurant menu URL** or uploads a menu **PDF / image**. Your app uses an LLM to extract a structured list of dishes with:
> - **name**
> - **price**
> - **allergens** (list)
> - **one-line description**
> - **confidence flag** per row (reliable / uncertain — your choice how to derive it)
>
> Results are persisted to Postgres and shown in a clean UI. That's it.

The task is deliberately unrelated to our actual product. We are evaluating your judgment and craft, not domain knowledge.

## Requirements

- **Backend**: Node.js + Fastify + TypeScript, PostgreSQL + Drizzle (with a real migration file)
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **LLM**: OpenAI SDK with JSON mode. Use vision if the input is an image.
- **Testing**: exactly **one** meaningful automated test. You choose the type (unit, integration, golden-master, E2E) and **justify the choice** in your decision log.
- **Logging**: structured Pino logs on the backend.
- **BMAD**: drive planning and implementation with BMAD. Check the artifacts into the repo.
- **Prompts**: every prompt you fed to any LLM (BMAD skills, Claude Code, ChatGPT, Cursor, etc.) goes into a `prompts/` folder or single `PROMPTS.md`. This is a first-class deliverable.
- **Secrets**: `.env.example` only. Never commit real keys.

Effort is your call. We want to see judgment, not hours.

---

## Deliverables (all required)

1. **Repo** (GitHub, public or granted access) with runnable app + README (install/run in under 5 minutes)
2. **`DECISIONS.md`** — trade-offs, alternatives considered, what you cut and why
3. **BMAD artifacts** — the actual product brief / PRD / architecture / story / dev-story output you produced
4. **`prompts/`** — every prompt you used, organized so a reviewer can follow the thought sequence
5. **Personal video (3–5 min)** — who you are, why you want this role, why you're a fit. Loom or equivalent link.
6. **Walkthrough video (5–10 min)** — what you built, why, what would come next, what breaks in production
7. **`BUSINESS.md`** — one paragraph: what would you charge a customer for this feature, and why?

---

## Evaluation rubric

| Area | Weight |
|---|---|
| BMAD fluency — real, not cosmetic use of the workflow | 25% |
| **Prompt quality** — reviewed directly from your submitted prompts | 20% |
| Stack competence — idiomatic React / Fastify / Drizzle / Zod | 15% |
| Critical thinking — trade-offs, risks, what was cut | 15% |
| Business mindset — pricing, risk framing, would-you-ship-it | 10% |
| Communication — videos + decision log clarity | 10% |
| Independent judgment | 5% |

## Auto-reject

- No prompts submitted, or prompts that show blind copy-paste
- BMAD used as decoration only
- Over-engineered (microservices, k8s, event bus) for this slice
- Secrets in repo
- No personal video
- Cannot explain what would break in production

---

## Submission

- Send a single link (repo or Notion page) that contains everything above
- Include a working email so we can reach you
- **Deadline:** 25 August 2026
- **Submit to:** gerdrn+hiring@gmail.com

Questions? Send them to gerdrn+hiring@gmail.com. We answer publicly so all candidates see the same information.
