# 2026-08-22 — 26 — Leave precise instructions for the next model

- **Date**: 2026-08-22
- **Tool**: Claude Code (session close)
- **Model**: Claude Fable 5 (handing off to Claude Opus 5)
- **Phase**: 06-implementation (process: session handoff)
- **Intent**: Make the handoff explicit — the next session, on a different model, must know exactly what remains for Epics 1, 2 and 3 and how we work, without re-deriving it.

## Prompt

```text
por favor dejale a opus 5 bien claro todo lo que tiene que hacer de aca en mas con la epica 1, la 2 y la 3. si necesita instrucciones mas claras y precisas. sé que el es medio dramátcio.
```

## Outcome

Wrote a standing operating-instructions memory (loaded automatically in every session): current state, strict story order for Epics 1–3, the per-story loop (worktree → env on 5433/PORT 3100 → `/bmad-build` → Checkpoint halt → one background implementer with the 5-minute heartbeat → three parallel reviewers → triage with the over-engineering guard and the production-breaks register → present → push → PR → Pablo merges → teardown), the standing rules (verbatim prompt log, never commit on main, one test only, English docs / Spanish chat, close ritual batched per epic), story-specific notes for 1.6–3.1, and the epic close ritual checklist. Tone instruction included: short, factual, no drama.
