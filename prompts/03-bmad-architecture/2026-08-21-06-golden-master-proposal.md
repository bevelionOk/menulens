# 2026-08-21 · 06 · Pablo's counter-proposal: integration golden-master

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD — architecture
- **In English**: Proposes replacing the arbiter unit test with a golden-master integration test: post a demo fixture to the real API with a mocked OpenAI client and a real database, covering the whole flow, isolating AI non-determinism, validating the JSONB boundary, at zero API cost. Asks whether the assistant agrees.

## Prompt (verbatim)

> bien antes de continuar tengo una aclaracion para ahcer, el Unit arbitro no se si es lo mjor para el test. podria ser uno integration tipo golden-master? Postear un fixture demo en la API real con un cliente OpenAI en mock y base de dato real.  La idea es cruzar todo el flujo, aislar el no determinismod e la IA (Por el mock), validar frontera critica de JSONB en db y con consto cero de API. test unitarios no llegarian a cubrir todo y el E2E nos hace pasar por OpenAi y el no determinismo, lo cual no podriamos controlar. estas de acuerdo?

## Outcome

Agreed with conditions: fixture crafted to fire every T1–T6 rule incl. the T6 downgrade
(arbiter coverage embedded, not lost); OpenAI client behind an injected seam (became
AD-12); golden normalization pinned; Postgres service container in CI. D16 — the session's
first visible course-correction (D10 style). Supersedes prompt 05's unit choice.
