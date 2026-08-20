# 2026-08-20 · 02 · Infra day: cost estimate, requirements annex, tooling install

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning / infrastructure
- **Intent**: Get an OpenAI credit estimate before creating the API key; create a
  requirements annex as an anti-over-engineering lighthouse; stand up and test all
  infrastructure (BMAD, Postgres, video recording); confirm methodology decisions.

## Prompt (verbatim)

> Bien, excelente.
> Antes de contestarte lo que esperas de mi:
>
> 1. hazme un estimado de cuanto credito necesito inyectar a Open AI. Luego configuramos la API KEY,
> 2.  Creo que tambien en un anexo deberiamos poner los "requirements" asi no se nos escapa nada, que sea como un faro para no pasarnos de sobreingenieria ni dejar de utilizar las herramientas que ellos solicitan,
>
> Estoy de acuerdo que hoy debemos garantizar tneer toda la infraestructura andando y probada, y familiarizarme con BMAD,
> La planificacion debe queda debidamente docuemntada, y por favor en cada ejecución garantizar que no haya tendencias a la sobreingeniería.
>
> Respuestas:
>
> 1. si puedo generarla, te solicite antes el estimado,
> 2. No tengo, incrporala en la infra que este lista,
> 3. si, confirmado.

## Outcome

- Verified current OpenAI API pricing (official pricing page) and produced a credit
  estimate: realistic spend under $5 developing on budget-tier models with a
  stronger model for final passes; **$20 top-up recommended** as set-and-forget.
- Created `REQUIREMENTS.md` — the "lighthouse" annex: hard requirements, deliverables,
  auto-reject tripwires, explicit out-of-scope guardrails, alignment signals (Zod,
  TanStack Query), rubric map, pre-submission checklist. To be re-read before every phase.
- Infrastructure: `git init`; installed **BMAD v6.11.0** (BMM module, Claude Code
  integration, docs output in English) → artifacts land in `_bmad-output/`;
  pulled and smoke-tested `postgres:16-alpine`; installed OBS Studio for the two
  required videos (Loom free tier caps at 5 min — too short for the walkthrough);
  installed `uv` (needed by BMAD's build skills).
- Confirmed decisions: BMAD front and center; custom multi-agent orchestration only as
  a final review pass; over-engineering guard applied at every execution.
