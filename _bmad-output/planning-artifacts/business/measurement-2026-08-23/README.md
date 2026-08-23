# Re-measurement — luna, 2026-08-23 18:31–18:32, after the B10/B14/B45 core fixes

Same four inputs, same runtime prompt (`extraction-v1`), same isolated Postgres on port
5433 (torn down afterwards), one model tier: `gpt-5.6-luna` (D3). The arbiter now carries
the three fixes committed the same day: B45 (a `declared` quote with no declaration marker
⇒ `inferred`, T6), B10 (a `declared` entry on a `visual` source fires T6), B14 (a
thousands separator refuses as a price, T2). `measure.sh` is the driver, `compare.py`
the comparison against `../measurement-2026-08-22/` luna rows, `compare.txt` its output,
`model-usage.jsonl` the four `model usage` log lines, `gpt-5.6-luna--<menu>.json` the
`GET /api/runs/:id` payload of each run. Inputs as in the 08-22 README.

| Date | Input | Rows | Reliable | Tokens in / out | ms | Cost $ | Rules |
|---|---|---|---|---|---|---|---|
| 2026-08-22 | la-parra | 6 | 2 | 1563 / 879 | 8737 | 0.0014 | T1 3, T2 2, T3 1, T5 1 |
| 2026-08-23 | la-parra | 6 | 2 | 1563 / 851 | 10122 | 0.0013 | T1 4, T2 2, T3 1, T5 2, T6 2 |
| 2026-08-22 | german | 5 | 1 | 1538 / 599 | 5735 | 0.0010 | T1 4, T2 1, T5 1 |
| 2026-08-23 | german | 5 | 1 | 1538 / 813 | 7894 | 0.0013 | T1 4, T2 1, T5 1 |
| 2026-08-22 | no-prices | 5 | 0 | 1516 / 586 | 5143 | 0.0010 | T1 5, T2 5, T5 5 |
| 2026-08-23 | no-prices | 5 | 0 | 1516 / 591 | 5375 | 0.0010 | T1 5, T2 5, T5 5 |
| 2026-08-22 | vox | 34 | 6 | 14147 / 3367 | 25204 | 0.0069 | T1 28, T2 1, T5 1 |
| 2026-08-23 | vox | 34 | 0 | 14147 / 2908 | 22595 | 0.0063 | T1 34, T2 1, T5 2 |

Pricing: luna $0.20 / $1.20 per M tokens (D3). Four runs: $0.0099.

## Vox

Expected: 0 of 34 `reliable`, with T6 "evidence quote carries no declaration marker" on
the six rows that were `reliable` on 08-22 (B45). Measured: 0 of 34 `reliable`, T6 fired
on no row. The model returned every Vox allergen as `inferred` this run (as on the 08-22
morning run, B42) and no `declared` entry reached the new check (B46: the same input
returns a different `declared` set between runs). The six former rows — Asian cucumber
salad, Lobster bisque, Mozzarella di Bufala, Oktopus, Sautéed chanterelles, Steamed
halibut — are `uncertain` through T1 on `inferred` entries.

`replay-0822-vox.ts` runs every `declared` quote of the 08-22 Vox payload through the
marker check the arbiter now applies (`hasDeclarationMarker`, no model call);
`replay-0822-vox.txt` is the output: 19 `declared` entries, 0 carry a marker,
`reliable` after replay 0 of 34.

## la-parra

The B45 rule fired on a live run: `Ensalada de la casa`, quote `Aliño con mostaza y
semillas de sésamo`, `mustard` and `sesame` `declared` → `inferred`, T6 ×2, T1. The row
was already `uncertain` (T2, `desde 6 €`). The two `reliable` rows (`Tortilla de patatas`,
`Croquetas de jamón ibérico`) keep their marker-bearing quotes (`Contiene …`,
`Alérgenos declarados: …`). `Pulpo a la brasa` picked up a T5 self-flag this run.

## german, no-prices

Same rule counts as 08-22. german: two rows gained `inferred` allergens the model did not
return on 08-22 (`Apfelstrudel`, `Rinderbraten`); the Schnitzel row name changed. Neither
B10 nor B14 had an input to fire on: no `visual` source and no thousands-separator price
in the four inputs.
