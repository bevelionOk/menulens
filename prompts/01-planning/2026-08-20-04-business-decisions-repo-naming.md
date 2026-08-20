# 2026-08-20 · 04 · BUSINESS.md draft, decision log seed, repo naming

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning
- **Intent**: Before the first commit, capture the smoke-test finding in durable
  deliverables (not just the prompt log), start BUSINESS.md, and settle repo
  name/visibility strategy.

## Prompt (verbatim)

> Excelente! antes de commitear, podriamos ir creando el BUSINESS.md con el hallazgo encontrado.
> que nombre de repo le vas a poner? debe ir publico via bevelion, verdad?
> el detalle del confidence flag queda anotado en algun lado ?

## Follow-up prompt in the same exchange (verbatim)

> si, debemos docuemntar en tiempo real el critical thinking. Y que luego de que compeltamos esto y hacermos el priemr commit viene la parte de familiarizarnos con todo.

## Outcome

- Created `DECISIONS.md` seeded with six dated entries (D1–D6), including **D4 (OPEN)**:
  the confidence-flag derivation, with the smoke-test evidence (model confidently wrong on
  a 1×1 red pixel → don't trust model self-certainty; verifiable signals listed for the
  PRD phase). This is now the durable home of the finding — the prompt log entry 03 only
  records *when* it surfaced.
- Created `BUSINESS.md` as an explicitly-marked working draft: measured unit cost
  (~$0.003–0.032/menu), value framing (replaces 15–30 min manual transcription), and the
  risk argument (allergens are safety-critical → sell extraction + confidence-guided
  review, not full automation). Will be distilled to the required single paragraph
  before submission.
- Repo strategy decided (D5): develop **private** under the `bevelionOk` GitHub account,
  flip to **public** right before submission — open competition, no reason to leak
  approach to other candidates mid-build. Name proposed: `menulens`.
- First commit of all planning artifacts made after this exchange.
