# Measurement — luna vs terra, 2026-08-22 14:38–14:40

Evidence for D28 and for register rows B45/B46. Eight runs: four inputs × two model tiers,
same runtime prompt (`extraction-v1`), same arbiter, an isolated Postgres on port 5433 that
was torn down afterwards. `measure.sh` is the driver, `compare.py` the comparison,
`compare.txt` its output, `model-usage.jsonl` the eight `model usage` log lines (tokens,
elapsed), and `<model>--<menu>.json` the `GET /api/runs/:id` payload of each run.

| Input | What it is |
|---|---|
| `la-parra` | the repo's sample menu (`server/scripts/sample-menu.ts`), 6 dishes, allergens declared in prose |
| `german` | a 5-dish synthetic PDF with two declared lines (`enthaelt …`) and `Preis nach Markt` — `plan/guides/manual-test-guide.md` |
| `no-prices` | a 5-dish synthetic PDF, every price `según mercado` |
| `vox` | `https://vox-restaurant.de/wp-content/uploads/2026/07/Vox-Speisekarte-Englisch-1.pdf` by URL, 34 dishes, 52,919 chars |

The rows that matter: `gpt-5.6-luna--vox.json` holds the six `reliable` rows whose
`evidence_quote` is an ingredient word (B45); `gpt-5.6-terra--la-parra.json` holds the
twelve-row split (B46). Pricing used: luna $0.20/$1.20, terra $2/$12 per M tokens (D3).
