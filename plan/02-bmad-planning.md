# Phase 2 — BMAD Planning (Aug 21)

**Goal**: complete the full BMAD planning chain with real decisions, ending in a
PASS at the sprint-planning gate. These artifacts are the 25%-weight deliverable.

> **This phase is the REAL challenge run** — every session happens in this repo and is
> logged. Practice happens only in the sandbox pre-task below. Detailed session-by-session
> instructions, example exchanges, positions to bring, and failure scenarios:
> **[guides/bmad-playbook.md](guides/bmad-playbook.md)** — read it before starting.

## Pre-task (outside this repo)

| Task | Owner |
|---|---|
| 30–45 min practice run in `~/dev/bmad-sandbox` (toy idea, e.g. a recipe organizer) to feel the facilitation style. Nothing from the sandbox is logged or committed here. | Pablo |

## Tasks (in order, all in this repo, every prompt logged)

| # | Task | Skill | Key decisions to force | Output |
|---|---|---|---|---|
| 2.1 | Product brief | `/bmad-product-brief` | Who the user is (menu reviewer/operator), what "done" means, explicit non-goals | `_bmad-output/planning-artifacts/` brief |
| 2.2 | PRD | `/bmad-prd` | **Resolve D4** (confidence-flag semantics from the user's perspective); scope of "clean UI" (submit → results table; history list yes/no); sync vs async extraction UX; error states (bad URL, non-menu content, huge file) | PRD |
| 2.3 | Architecture | `/bmad-architecture` | Single Fastify service (guardrail); URL fetching strategy (server-side fetch → text vs render); PDF path (text extraction vs page-to-image + vision); model choice per input type; Drizzle schema; Zod at all boundaries; **which single test type** and why | Architecture doc |
| 2.4 | Epics & stories | `/bmad-create-epics-and-stories` | Expect 1 epic, ~4–6 stories, each shippable | Stories |
| 2.5 | Sprint planning gate | `/bmad-sprint-planning` | Readiness verdict; if CONCERNS/FAIL → fix planning, re-gate | Sprint status |
| 2.6 | Log decisions + commit artifacts | — | DECISIONS.md entries for D4 resolution, test choice, architecture trade-offs | Commit |

**Deliberately skipped**: `/bmad-prfaq`, `/bmad-brainstorming`, `/bmad-market-research`,
`/bmad-domain-research` (all are discover-the-product skills — this product is pre-scoped
by the challenge brief, and the brief says domain knowledge earns nothing), and the full
`/bmad-ux` workflow (UI is one form + one table; UX decisions fit inside the PRD).
If an agent offers any of these mid-session: decline *with the reason stated in-session*
— the reasoned refusal in the transcript is Independent-Judgment evidence. Exception:
a short, targeted `advanced elicitation` pass on a weak section (e.g. PRD edge cases)
is allowed — it deepens an answer we need rather than opening scope we don't.
Skips recorded in DECISIONS.md — cuts are scored.

**Pablo's role**: product owner in every session — answers are decisive, cuts are named.
**Exit criteria**: gate = PASS; D4 closed; artifacts + prompts committed; story list
approved by Pablo before Phase 3 starts.
