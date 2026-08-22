# Master Plan — Overview

> **Status: in execution.** Each phase has its own plan file with tasks, owners and exit
> criteria; nothing in a phase starts before its plan is approved. Phase status below is
> kept current — a stale plan is worse than no plan.

**Goal**: submit a winning entry to the Vibe-Coder challenge by **2026-08-25**
(single link + email to gerdrn+hiring@gmail.com).

## Phases

| # | Phase | Plan file | Target date | Status |
|---|---|---|---|---|
| 1 | Foundation & infrastructure | [01-foundation.md](01-foundation.md) | Aug 20 | ✅ DONE |
| 2 | BMAD planning (brief → sprint gate) | [02-bmad-planning.md](02-bmad-planning.md) | Aug 21 | ✅ DONE |
| 3 | Implementation (BMAD build loop) | [03-implementation.md](03-implementation.md) | Aug 22–23 | ✅ DONE — 11 stories delivered, 2 cut (D24); the one test green in CI |
| 4 | Hardening & adversarial review | [04-hardening-review.md](04-hardening-review.md) | Aug 23–24 | 🔄 next up |
| 5 | Communication: the two videos | [05-communication-videos.md](05-communication-videos.md) | Aug 24 | ⬜ proposed |
| 6 | Submission | [06-submission.md](06-submission.md) | Aug 25 | ⬜ proposed |

Aug 25 is deliberately kept as buffer + submission only. If implementation slips,
scope is cut (and the cut documented in DECISIONS.md) — the date does not move.

## Working agreements (apply to every phase)

1. **Language split**: all repo *documents* (docs, BMAD artifacts, code, comments,
   commits, README) are English. *Prompts* are logged verbatim in the author's native
   language (Spanish) — the log shows what was actually sent; authenticity over polish.
2. **Prompt logging**: every prompt to any LLM → `prompts/`, logged when it happens.
3. **Real-time critical thinking**: decisions with trade-offs → DECISIONS.md immediately.
4. **Over-engineering guard**: before any task — does it map to REQUIREMENTS.md §1–§2
   or a rubric row? If not, cut and record the cut.
5. **BMAD is the method**: real product/tech decisions happen inside BMAD sessions in
   this repo. Practice happens only in the external sandbox (never logged here).
6. **Review flow**: Claude builds → explains → Pablo reviews → ship. Plans are approved
   before execution; deliverables are committed incrementally.

## Deliverable → phase map

| Deliverable | Produced in |
|---|---|
| Runnable app + README (<5 min setup) | Phase 3, verified in 4 |
| DECISIONS.md | Continuous, finalized in 6 |
| BMAD artifacts (`_bmad-output/`) | Phases 2–3 |
| `prompts/` | Continuous |
| Personal video (3–5 min) | Phase 5 |
| Walkthrough video (5–10 min) | Phase 5 (inputs from 4) |
| BUSINESS.md (one paragraph) | Draft exists; distilled in 6 |
| Public repo + submission email | Phase 6 |

## Detailed guides

The phase files above are at-a-glance checklists. Depth lives in:

- [RISKS.md](RISKS.md) — full risk register (likelihood/impact, mitigation, contingency),
  reviewed at the start of each phase
- [guides/bmad-playbook.md](guides/bmad-playbook.md) — Phase 2 session-by-session guide:
  what each BMAD skill asks, example exchanges, positions to bring, scenarios and moves
- [guides/implementation-playbook.md](guides/implementation-playbook.md) — Phase 3:
  build-loop mechanics, technical baseline, story DoD, iteration protocol, cut ladder
