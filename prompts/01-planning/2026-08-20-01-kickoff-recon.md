# 2026-08-20 · 01 · Kickoff & reconnaissance

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning / reconnaissance
- **Intent**: Before touching the challenge, get a clear view of the brief, rubric and
  auto-reject rules; verify local infrastructure; decide how to document prompts; and
  evaluate whether an existing multi-agent methodology fits or hurts the application.
- **In English**: Hello — we are going to coordinate a challenge for a full-stack role. Before starting: get a clear view of the challenge, its goals and selection criteria; avoid penalties and over-engineering; document every prompt from now on, since that is part of the evaluation; tell me what else to document; make sure my machine has all the infrastructure and I am familiar with the methodology; flag anything I missed; evaluate whether our existing multi-agent methodology helps or is penalised; take your time, reconnaissance and planning matter most. Repo: github.com/roenschg/vibe-coder-challenge.

## Prompt (verbatim)

> hola como estas? vamos a coordinar la ejecucion de un challenge para aplicar al rol de full-stack para una compañia. Es importante antes de comenzar:
>
> 1. tener una clara vision del challenge, sus objetivos y criterios de seleccion;
> 2.  Tener en cuenta para evitar: penalizaciones, sobreingenieria,
> 3. Garantizar que los prompts que comenzamos de ahora en mas queden debidamente docuemntados ya que es parte improtante de la evaluacion,
> 4.  Avisarme que otras cosas necesitamos documentar para hacerlo de manera transparente, clara y muestren bien nuestra modalidad de trabajo.
> 5.  Antes de comenzar a ejecutar algo de repo del challegne, debemos garantizar que tengo toda la infraestructura instalada en mi maquina, que las vias de compartir estan aceitadas. Y familiarizarme con la metodologia.
> 6.  Si se me escapó algo que sea importante hazmelo saber y lo evaluamos juntos;
> 7.  Evalúa si el challenge nos permitiría utilizar nuestra metodología multiagente que ya tenemos montada o si eso se considera una penalidad para no estropear la aplicación.
> 8.  El reconocimiento y la planificación en esta instancia es lo más importante. Tomate tu tiempo y la idea no es hacerlo apurado sino a consciencia y bien.
>
> Gracias!!
>
> Repo con el challenge a evaluar: https://github.com/roenschg/vibe-coder-challenge

## Outcome

- Cloned the challenge repo (read-only) and analyzed `README.md` + `JOB.md`: task,
  rubric weights, auto-reject list, deliverables, deadline (2026-08-25).
- Audited local tooling: Node 24 / pnpm / Docker + Compose / git / gh all OK;
  BMAD not installed; no OpenAI API key in the environment.
- Created this `prompts/` structure so every subsequent prompt is captured from the start.
- Produced a written reconnaissance report: risks, documentation plan, infrastructure
  gaps, timeline against the deadline, and a recommendation on the multi-agent question
  (BMAD front and center; heavy custom orchestration kept out of the critical path).
