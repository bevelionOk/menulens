# 2026-08-22 — 39 — Fix the claim, or fix the guard?

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (story 1.8 review triage)
- **Intent**: The review showed D26's argument overstated what the drift guard verified. Pablo refused the easy repair and asked the question underneath it.
- **In English**: Yes, but should you correct the claim or correct the drift guard? What should it verify?

## Prompt

```text
si pero deberias corregir la afirmacion o corregir el guard de drift? que deberia verificar?
```

## Outcome

The right answer was neither "correct the wording" nor "both": it was to ask what the guard *should* verify, and then build that. The property that matters is **the migrations a fresh clone applies produce the schema the code expects** — not "schema.ts agrees with drizzle's snapshot", which is what `db:generate` + `git diff` actually compares and why a hand-edited migration slipped through it.

Verified empirically before promising anything, on a throwaway database: against the correctly migrated one, `drizzle-kit push` reports `No changes detected`; against one built from a migration stripped of `CONSTRAINT "dishes_run_id_position_unique"`, it reports the restoring `ALTER TABLE`. So the guard was replaced rather than hardened, and it subsumes the old one — a schema edited without generating also fails, because the migrated database will not match.
