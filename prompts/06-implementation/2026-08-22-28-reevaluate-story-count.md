# 2026-08-22 — 28 — Re-evaluate the story count: is the plan itself over-engineered?

- **Date**: 2026-08-22
- **Tool**: Claude Code (three parallel research subagents)
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (scope re-evaluation, mid-story)
- **Intent**: Test the plan against the challenge instead of against itself — the per-story pace felt wrong, and the suspicion was that each story is a symptom of over-engineering rather than a unit of work.

## Prompt

```text
mientras se corre la verificacion end to end, necesito que revaluemos la cantidad de stories. estan consumiendo demasiado tiempo y temo que cada story en si misma sea una cnsecuencia de sobreingenieria. dudo que el challenge este diseñaod para demorar tnato en la construccion de cada story. pone a agentes a investigar por favor. y darme un veredicto y recomendacion.
```

## Outcome

Three investigations ran in parallel: (1) challenge scope vs plan, (2) measured per-story cost from git history and the prompt log, (3) the minimum submittable path with concrete cut plans.

The verdict: over-engineered in product surface, not in the dimensions the brief names — no microservices, no queues, no k8s; those guardrails held. Of the 40 unbuilt acceptance criteria, 4 are mandated by an explicit brief line (story 1.8), ~8–10 serve "shown in a clean UI", and ~26 answer requirements this team wrote for itself. No rubric row scores feature count; two rows reward a defended cut. The repo's own `review-overengineering.md` had already flagged this HIGH on 2026-08-21, and D19 answered it with priority labels instead of deletions.

On the pace: per-story wall clock fell from 1 h 26 m to ~26 min across the epic with identical ceremony, but stories 1.3 and 1.6 produced more lines of specification than of code — the granularity is the problem, not the process. Two findings outside the question: the README does not exist (the brief's first five minutes), and `deferred-work.md` had accumulated eight "story 1.8 must also assert…" items — a test suite in disguise that would violate R8 as directly as writing no test.

Ratified as D24: 1.7 + 2.1 + 2.2 merge into one deliverable, 1.7's throwaway AC8 is cut, 2.3 and 2.4 are cut whole, 3.1 folds into the submit page, 1.8 stays exactly one test. Seven stories become four deliverables.
