# 2026-08-22 — 22 — Stay alert to "fail in production" findings

- **Date**: 2026-08-22
- **Tool**: Claude Code (`/bmad-build`, story 1.5 review triage)
- **Model**: Claude Fable 5
- **Phase**: 06-implementation (process rule)
- **Intent**: Make sure the production-failure modes surfaced by the adversarial reviews — many of them rejected as out of scope — are captured for documentation, not dropped at triage.

## Prompt

```text
aca prestar atencion al "fail in production" es importante tener esto alerta para documentar!
```

## Outcome

Opened `plan/production-breaks.md`, an append-only register (B1–B12 from stories 1.3–1.5: seriality race, DNS rebinding, CGNAT ranges, JS-shell pages passing the text threshold, mid-pipeline DB loss, 429 without retry, truncated output + deterministic retry, lost usage on malformed JSON, 2× timeout across attempts, unverifiable quotes on visual sources, SDK shape drift, adapter semantics outside CI). Rule from now on: every review triage adds its rows; the register feeds DECISIONS.md/RISKS.md at the epic close and the video's `[BREAKS]` segment.
