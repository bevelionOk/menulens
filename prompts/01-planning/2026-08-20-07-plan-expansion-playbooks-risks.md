# 2026-08-20 · 07 · Plan review feedback: expand with playbooks and risk register

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning (master-plan review)
- **Intent**: Address review feedback — the phase plans were too terse to serve as a
  working guide; BMAD and implementation needed concrete examples/scenarios; risks
  lacked formal treatment. Also clarify whether the Phase 2 BMAD plan is practice or real.
- **In English**: Is the BMAD planning for practice or for the real challenge? It needs expanding — I read all the phase files and they are too terse; expand them in place or as separate drafts with more precise instructions, especially BMAD usage with examples and scenarios, same for implementation. Do we have risks and their mitigations, for instance?

## Prompt (verbatim)

> el planning de bmad es para practica o para el challenge real? falta ampliarlo. esta muy escueto. lei todos y todos estan muy escuetos, faltan ampliarlos y detalles para mi guia. podrias o ampliarlos en los mismos archivos o crear borradores de ampliacion aparte para cada tramo explicando mejor yd ando instrucciones mas precisas. especialmente el uso de bmad, dar ejemplos y escenarios que pudieran darse. lo mismo en implementation.
>
> tenemos pro ejemplo riesgos y mitigacion de ellos?

## Outcome

- Clarified in `plan/02` itself: **Phase 2 is the real challenge run**; the sandbox
  pre-task is the only practice.
- Chose the "separate expansion drafts" option to keep phase files as operational
  checklists, adding depth alongside:
  - `plan/guides/bmad-playbook.md` — session mechanics, the product framing to carry in
    (persona "Ana, onboarding ops"), per-session guides with example exchanges and the
    decisions each session must close (incl. D4 resolution position), do/don't list,
    time budget, and a scenarios-and-moves table (scope pushback, CONCERNS/FAIL gate,
    generic artifacts, mid-session stalls).
  - `plan/guides/implementation-playbook.md` — build-loop touchpoints, pre-agreed
    technical baseline, story-by-story definition of done, test-menu set, extraction
    quality iteration protocol, pre-agreed cut ladder, build-session scenarios.
  - `plan/RISKS.md` — 12-risk register with likelihood/impact, active mitigations and
    contingencies, replacing the overview's three-bullet list; reviewed at each phase start.
- Overview and phase files cross-linked to the new documents.
