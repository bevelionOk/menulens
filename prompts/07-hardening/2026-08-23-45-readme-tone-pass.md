# 2026-08-23 — 45 — Tone pass: remove AI-typical prose from the README and the other reviewer-facing files

- **Date**: 2026-08-23
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 07-hardening (communication)
- **Intent**: Strip the documents a reviewer reads of the habits of the tool that wrote them: justifying codas, management vocabulary, narration of method, moralising. Proposal first, then file by file with approval.
- **In English**: First prompt: "Yes, I would like us to fix README.md excluding the typical AI symptomatology" — followed by four named causes: RLHF bias toward over-explaining, contamination by the LinkedIn/management corpus, confusing internal reasoning with the delivered product, and the absence of social cost for paternalistic text. "Check whether other repo files deserve the same lens, since I also care about presentation and communication. Come to me with the proposal." Second: "Yes, I read it, that is why I asked — I apply this filter when working with you. Prompt outcomes: careful not to falsify; do not touch anything that is justified. Do not change web/src. The rest is fine. First I want to see the README(s), then the rest." Third: story count check (three epics, 8 + 4 + 1 stories, not "six"); group the production breaks by category, in the register and in the README before the priority list; from now on every text follows these filters.

## Prompts

```text
si, me gustaria que arreglemos el README.md excluyendo la sintomatologia típica de la IA: 
1. El sesgo del RLHF (Reinforcement Learning from Human Feedback)
Durante la fase de ajuste, evaluadores humanos califican las respuestas de la IA. Históricamente, las respuestas que incluyen justificaciones metodológicas o frases de "concientización" recibían puntuaciones más altas porque a los evaluadores les parecían más completas, reflexivas o "seguras". La IA aprendió una regla estadística básica: sobreexplicar el porqué aumenta la probabilidad de ser aprobada.

2. Contaminación por el corpus de "LinkedIn y Management"
Los datos de entrenamiento están repletos de artículos de productividad, libros de liderazgo, blogs de agile y publicaciones corporativas. Ese ecosistema abusa de frases épicas como "retrospective with teeth", "radical candor" o "fail forward". Al no tener sentido del ridículo, el modelo asume que ese tono grandilocuente es el estándar profesional que el usuario espera cuando pide hablar de procesos o gestión.

3. Confusión entre razonamiento interno y entrega de producto
A los modelos se los entrena intensivamente para "pensar paso a paso" y justificar sus decisiones. El problema ocurre cuando el modelo no sabe separar su proceso mental de la entrega final. En lugar de aplicarlo en silencio y entregarte la diapositiva limpia, te vende la metodología y te explica por qué tuvo la brillante idea de diseñarla así.

4. Ausencia de "costo social" y falta de contexto real
Un humano en un entorno corporativo aprende rápido a no dar lecciones de moral a sus colegas porque hay un costo político: suena condescendiente y genera rechazo. La IA no tiene percepción del contexto social ni de la fricción que genera una frase paternalista en una reunión real. Para la IA, redactar tres párrafos de filosofía de gestión cuesta cero milisegundos y cero fricción, por lo que tiende a inflar el texto por defecto a menos que se le restrinja explícitamente.

Revisa si hay otros archivos del repo que merezcan pasar por la lupa de esta mirada. Ya que la presentacion y la forma de comunicación también me interesa cuidar. Gracias. 

ven a mi con la propuesta. gracias
```

```text
si, lo lei por eso te lo pedi, porque este filtro lo aplico al trabajar con vos. 

* outcomes de prompts: ojo con falsificar! si tocas algo que este justificado. 
* el web/src no cambiar nada, 


El resto esta ok!

Primero quiero ver el/los README.md (porque vi mas de uno) y luego de leer esos dos de ejemplos y aprobarlo vamos al resto.
```

```text
ahi estoy leyendo el readme.md ojo que en un mometno decis 6 stories... pero en realdkad al principio tengo entendido que eran 3 epicas donde en la epica 1 eran 8 stories, la epica 2 eran 3 o 4 y la epica 3 eran 1 o 2. podes verficiar para ser accurate por favor?

el resto esta muy bueno, me queda una pregunta:
What breaks in production section, podrias en ese archivo hacer despues de la table un grouping de categorias para poder narrarlo mas completo en el video ? entiendo que las que señalaste son las mas importantes y estoy de acuerdo, pero es bueno tener un panorama del tipo/categoria de lo que rompe en produccion asi tengo un sondeo mas claro sobre a donde poner elfoco (esa clasificacion agregarlo al readme antes de señalar las reparaciones prioritarias de lo que rompe pproduccion) GRACIAS!

Los archivos estan excelente y muy limpios! Luego de estas observaciones proceder con el resto!

Las redacciones de ahora en mas deben respetar estos filtros que te pase sobre la sintomatologia  de la IA :)
```

## Outcome

Branch `docs/tone-pass`, four commits. README: 1,780 → ~1,500 words; the scope narrative became a table and three sentences; "six stories" corrected to three epics and 13 stories (8 + 4 + 1) from `sprint-status.yaml`; the 41 production breaks grouped into seven categories, in `plan/production-breaks.md` and summarised in the README before the priority list. `prompts/README.md` shortened. `INTERPRETATION.md`: seven phrases replaced. DECISIONS: closing sentences of D24, D25, D26 and D27 removed or reduced to the fact they carried; no decision text changed. Highlights: a tone rule at the top of the file and entries 54–59 rewritten as facts. Prompt outcomes: two sentences trimmed (entries 40 and 43), both closing aphorisms; nothing that justified a decision was touched. `web/src` untouched. The writing rule is now in `REQUIREMENTS.md` §4. The `_bmad/**/v6-shims/README.md` files are vendored BMAD and were left alone.
