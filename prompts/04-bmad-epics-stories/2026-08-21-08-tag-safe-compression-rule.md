# 2026-08-21 · 08 · The tag-safe compression rule

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD — epics & stories (step 2 → 3)
- **In English**: Rule: compress the stories only if there is no risk of losing the tags for a dev agent; otherwise keep the original and remove redundancies. The advanced-elicitation pass is reserved for when the set is complete.

## Prompt (verbatim)

> Gran aclaracion. Si no hay riesgo de perder los tags en un agent dev, entonces comprimimos, sino lo dejamos como original sacando las redundancias. Luego hacemos al final de todo la pasada con el Advanced Elicitation  (queda reservado para cuando el set este completo)

## Outcome

Pablo's rule resolved the design: compression is bounded by tag safety — no story may mix
P0 and P1. Result: priority-pure boundaries (E1: 8, E2: 4 split by priority, E3: 1) = 13
stories; the D8 ladder cuts P1 stories whole. FR30 found missing from the PRD's P0/P1
lists — flagged for ratification. Elicitation pass reserved for the complete set.
Continued to step 3 (story creation).
