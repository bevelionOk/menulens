# 2026-08-21 · 05 · Four core forks (selection widget)

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD — architecture

## Prompt (selections, verbatim options chosen)

> Paradigma → **Núcleo puro + IO en bordes (Recommended)**
> Test único (R8) → **Unit: árbitro T1–T6 (Recommended)** *(superseded by prompt 06)*
> Artefactos fuente → **Postgres bytea (Recommended)**
> Shape datos → **jsonb en la fila del plato (Recommended)**

## Outcome

Functional core / imperative shell locked; source artifacts as bytea in Postgres;
allergens + confidence_reasons as Zod-governed jsonb. The unit-test choice was
**revised two prompts later** by Pablo's golden-master proposal (D16) — kept here
verbatim as the visible course-correction trail.
