# 2026-08-20 · 08 · Pin the challenge statement in the repo

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning (master-plan review)
- **Intent**: Ensure the challenge statement itself lives in the repo — not only as a
  derived checklist — pinned to a known version, with our interpretation recorded
  separately.
- **In English**: Where in the repo is the challenge STATEMENT? That is fundamental. Is looking at their repo enough, or should it be a separate note file, explained with recommendations?

## Prompt (verbatim)

> donde tengo en el repo el ENUNCIADO con la consigna del challenge? eso es fundamental. o con mirarlo del repo es suficiente? no debe estar en un archivo nota, separado, explicado con recomendaciones?

## Outcome

- Confirmed the gap was real: only the *derived* checklist (REQUIREMENTS.md) was in the
  repo; the local clone of the challenge lived in an ephemeral session directory, and
  upstream can change (they publish Q&A answers; their latest commit edited deadline
  and contact).
- Created `docs/challenge/` with a **three-layer model**:
  1. `BRIEF.md` + `JOB.md` — verbatim copies pinned at upstream commit `6be4b93`
     (2026-08-11), provenance headers, never edited;
  2. `INTERPRETATION.md` — what the wording signals and how we respond (signal→response
     table), plus the ambiguities we resolved by judgment (URL fetchability, visible
     persistence, "clean UI" bar, PDF scope) — each ratified or overturned later by the
     corresponding BMAD session;
  3. `REQUIREMENTS.md` (existing) — the operational lighthouse, now linking back to both.
- Added task 6.0 (diff upstream vs pinned copy before submission) and strengthened
  R-12's mitigation with the same upstream-diff habit at phase starts.
