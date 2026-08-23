# 2026-08-20 · 05 · Language rule, BMAD practice location, integral master plan

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning
- **Intent**: Set the repo language policy, decide where BMAD practice happens so the
  repo only records real usage, and get the full challenge plan (phases + tasks through
  final submission) into the repo for review before execution.
- **In English**: I forgot: the whole repo must be in English, no Spanish, to ease the review. I understand how to use BMAD, but using it here would be recorded as testing — should I practise outside? And I want the full plan in the repo, phases and tasks through the final posting, videos at the end; split it into sections so I can review. Follow-up: the BMAD prompts and my own communication stay in Spanish; I meant the documents.

## Prompt (verbatim)

> ah, me olvidaba, todo el repo debe estar hecho en ingles. nada de español, asi le facilitamos la revision. un dato fundamental.
>
> Ok entiendo como usar los BMAD. pero si lo utilizo aca en este repo queda registrado como testing, deberia usarlo por fuera, que recomiendas?
> Y quiero por favor en el repo la planficiacion total, con fases y tareas de todo el challenge. incluyendo el uso de BMAD y hasta el posteo final. con la creacion de los videos al final. el plan debe ser integral, podes subdividirlo en varios planes por secciones asi lo reviso antes.

## Clarifying follow-up (verbatim)

> espera, lo sprompts en bmad pueden ir en español, todo lo que es mi comunicacion dejalo en idiaoma nativo, yo te decia los docuemntos

## Outcome

- **Language policy settled**: repo *documents* (docs, artifacts, code, commits) in
  English; Pablo's *prompts* stay verbatim in Spanish. BMAD configured accordingly:
  agent chat in Spanish, document output in English. Convention recorded in
  `prompts/README.md` and the master plan's working agreements.
- **BMAD practice location**: separate sandbox installed at `~/dev/bmad-sandbox`
  (own BMAD install, outside the repo). Practice sessions happen there and are never
  logged or committed here — this repo records only real usage.
- **Master plan created** in `plan/`: `00-OVERVIEW.md` plus six phase files
  (foundation ✅ / BMAD planning / implementation / hardening & adversarial review /
  videos / submission), each with tasks, owners, guardrails and exit criteria, mapped
  to the Aug 21–25 calendar. Status: PROPOSED — awaiting Pablo's review before Phase 2.
