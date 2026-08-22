# 2026-08-22 — 52 — We are inside a challenge: document the broken promise, or fix it?

- **Date**: 2026-08-22
- **Tool**: Claude Code (`bmad-agent-analyst` session → `bmad-advanced-elicitation`)
- **Model**: Claude Fable 5
- **Phase**: 08-submission (6.1)
- **Intent**: Re-anchor the business work in the challenge frame; decide between fixing B45/B10/B14 and documenting them; ratify €2; ask for Mary plus an elicitation pass.
- **In English**: "We are inside a challenge — we need to understand that. Business mindset led us to a product promise that is not yet met. How many hours to fix it? In this frame, is it necessary, or can we simply explain it? I have not decided to implement B45/B10/B14; the €2 figure is correct. Models should be the ones that detect what we need, not the ones that hallucinate — but the brief says that if the model hallucinates, document it. My feeling: we simply document all of this and use it to answer the Business-mindset requirements, especially 'would you ship it'. Invoke Mary and then the advanced [elicitation]!"

## Prompt

```text
Estamos dentro de un challenge. necesito que comprendamos eso. y ahaora estamos tocando el tema de business mindset. esto nos llevo a una promesa de producto que aun no se cumple. cuantas horas estimas que lleva arreglar esto? en este marco es necesario hacerlo o podemos simplemente explicarlo? no he decidido implementar las B45/B10 y B14, el numero 2 euros esta correcto. los modelos deben ser los que detectan lo que necesitamos y no los que alucinan, pero en el enunciado esta que si el modelo alucina hay que documentarlo.

Mi sensacion es que todo esto simplemente tenemos que documentarlo y utilizarlo para contestar los requerimientos del Business mindset y especialmente  "would you ship it"? 

* invoca a Mary y luego el advanced!
```

## Outcome

Answered with numbers: the three `core/` fixes are 6–8 h with verification, register rows
and prompts; in the challenge frame they are not required — the auto-reject is *cannot
explain* what breaks, the rubric row scores the framing, D8 ships with documented gaps.
What documentation does owe: the brief's "zero false reliables by construction" is
contradicted by B45 and must be retracted in writing. Mary stayed active;
`bmad-advanced-elicitation` ran Pre-mortem and Challenge from Critical Perspective from the
evaluator's seat → proposals A–E (tighter paragraph with the verdict first, D28 item on "not
fixed on purpose", brief amendment, README contradiction on the Vox line, plan/05 line).
Prompt 53 added three more methods before anything was applied.
