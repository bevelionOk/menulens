# 2026-08-22 — 21 — Two questions on the 1.5 spec, then approval

- **Date**: 2026-08-22
- **Tool**: Claude Code (`/bmad-build`, Checkpoint 1 of story 1.5)
- **Model**: Claude Fable 5
- **Phase**: 06-implementation (story 1-5-extraction-adapter-the-openai-seam, spec approval)
- **Intent**: Challenge the spec's most debatable decision (`done` deferred to 1.6 although story 1.5's AC8 claims it) and confirm the model tiers match BUSINESS.md; then approve.

## Prompt

```text
elpunto numero 1 por que el done fue puesto en 1.5 si en realidad iba a 1.6?
para la api real de openAI tenemos los modelos definidos acorde al bUSINESS?
```

```text
perfecto! K A
```

## Outcome

(1) Traced to an overlap in `epics.md`: both 1.5 AC8 and 1.6 AC8 claim `done` — 1.5 written from the model-result contract, 1.6 from persistence; `done` can only be written with the dishes (1.3 deferral) and dishes need the arbiter, so `empty` is real in 1.5 and `done` lands in 1.6. Wording amendment to 1.5 AC8 queued for the epic close ritual. (2) Confirmed against D3 / BUSINESS.md: `OPENAI_MODEL` default `gpt-5.6-luna` (dev, ~$0.003/menu), `gpt-5.6-terra` for the final pass via env only; `model usage` log lines turn the estimate into the measured cost NFR2 asks for. Spec approved `[K]` + `[A]`, status `in-progress`, sprint-status synced.
