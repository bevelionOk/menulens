# 2026-08-22 — 51 — Measure terra, price per menu, and a deeper ship-it analysis

- **Date**: 2026-08-22
- **Tool**: Claude Code (`bmad-agent-analyst` session, structured question)
- **Model**: Claude Fable 5
- **Phase**: 08-submission (6.1)
- **Intent**: Answer the three decisions Mary put forward; reject a one-line ship-it answer.
- **In English**: Model — "Measure terra now." Pricing — "Platform customer, per menu processed." Ship-it — "Here we need to analyse more deeply the reasons why it also fails in production and the ideal conditions we discarded for being out of scope. Do a more exhaustive and serious analysis, please."

## Prompt

Selected: `Medir terra ahora` · `Plataforma, por menú procesado`. Free text on ship-it:

```text
aca hay que analizar mas profundamente las razones por las cuales ademas falla en produccion y las condiciones ideales que descartamos por estar fuera de scope. haz un analisis mas exhausitvo por favor y serio.
```

## Outcome

Measurement: 4 inputs (la-parra, german, no-prices, Vox by URL) × 2 tiers in an isolated
database on 5433 — luna $0.0010–0.0069 per menu, terra $0.0063–0.061; luna returned 6 false
`reliable` rows on Vox (ingredient words quoted as declarations, B45), terra 0 but split
la-parra into 12 rows (B46). D3 closed on luna. A subagent compiled the inventory of every
cut, deferral and out-of-scope condition (85 items, 14 document contradictions). The
analysis — failures by business consequence, discarded conditions by which ship tier they
gate, the measurement, unit economics — is
`_bmad-output/planning-artifacts/business/ship-readiness-2026-08-22.md`. BUSINESS.md
written as the one paragraph (€2 per menu, 200 k-char cap, platform as customer, three-tier
ship-it answer); D28; README links BUSINESS.md and says "two, sometimes three" `reliable`;
REQUIREMENTS ticks BUSINESS.md; plan/05 gains the business beat; the manual-test guide's
stale "not yet covered" list and next B number fixed. Scratch Postgres torn down.
