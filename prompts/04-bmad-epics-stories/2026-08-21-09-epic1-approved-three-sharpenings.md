# 2026-08-21 · 09 · Epic 1 approved with three sharpenings

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD — epics & stories (step 3, Epic 1 review)

## Prompt (verbatim)

> Si reutilizamos unreachable_url // ojo con la longitud de la story 1.4 no vaya ser qu eel agente quiera hacer un crawler demasiado complejo y se nos vaya ahi el tiempo.
>
> en la story 1.6 esto es maravilloso: NFKC → lowercase → NFD → strip \p{M}
>
> La story 1.8: el test:  las garantias de que cada regla T1-T6 se disparen por lo menos una vez es lo que fortalece nuestro mecanismo de testeo! no olvidarlo.

## Outcome

Epic 1 (8 stories, 54 ACs) appended with: SSRF refusal reusing `unreachable_url` (closed
enum preserved), an explicit anti-crawler scope-guard AC in 1.4 (one plain GET, no JS
rendering, no third-party HTTP client), and 1.8's AC2 hardened — the golden asserts each
fired rule BY ID in confidence_reasons, so the test fails naming the rule if any of T1–T6
stops firing.
