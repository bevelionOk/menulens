# 2026-08-22 — 56 — The two videos: skills, guideline review, scripts, tone

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 08-submission (Phase 5, videos)
- **Intent**: Open the video session: check which BMAD skills apply, review every video guideline and the collected highlights, write both scripts, collect what the personal video needs, and keep the tone rule.
- **In English**: "This conversation is about creating and directing the two required videos. (1) Tell me whether any BMAD skills can help; (2) evaluate all the information we have on the video guidelines and the highlights we collected; (3) then design the script for both videos; (4) you will need information for the personal video; (5) keep it professional, in the tone already defined, and avoid the AI communication bias" — the four causes named in prompt 45 (RLHF, the LinkedIn/management corpus, internal reasoning leaking into the deliverable, no social cost).

## Prompt

```text
el topico de esta conversacion es el abordaje de la creacion y direccion de los dos videos que se requieren.
Para ello:

1. informarme si hay skills de bmad que puedan cooperar,
2. el task es evaluar toda la info que tenemos de las guidelines de los videos y de las highlines que fuimos recolectando
3. luego diseñar el guion para ambos videos
4.  necesitaras informacion para el que es el video personal. 
5. tener en cuenta profesionalismo, el tono ya definido, y evitar el sesgo de comunicacion de la IA (1. El sesgo del RLHF (Reinforcement Learning from Human Feedback); 2. Contaminación por el corpus de "LinkedIn y Management"; 3. Confusión entre razonamiento interno y entrega de producto & 4. Ausencia de "costo social" y falta de contexto real
```

## Outcome

Branch `docs/video-scripts`. BMAD skills assessed for this phase: `bmad-review` (structure
and prose lenses) was run on the walkthrough script in this session — the spoken text
measured 10:09 at 150 wpm against an 8:50 budget and was cut to ≈ 9:00; the dates in the
open merged into the BMAD segment; the line spoken while the run executes shortened to the
run's own length; one claim about the test corrected ("byte-identical" → the test checks
that no extracted value changed). `bmad-advanced-elicitation` and `bmad-party-mode` were
not used: a second pass on a script Pablo has not yet spoken (D11, D19 precedent).

Written: `plan/video-scripts/README.md` (format, the spoken form of the REQUIREMENTS §4
rule, the seeded runs, the after-recording checklist), `walkthrough.md` (eight segments,
target 9:00, a fact sheet with a source line per number; B45 shown from the committed
measurement, the Vox URL never timed on camera), `personal.md` (beat 2 drafted from D2,
D10, D24, D26 and the four close-out questions; beats 0, 1, 3 and 4 wait on an
eight-question questionnaire to Pablo). Prompt 55 recovered from the session transcript.
`plan/05` links the scripts. Upstream challenge repo unchanged (`6be4b93`, no issues).
PR #24. Next prompt 57; next register row B47.
