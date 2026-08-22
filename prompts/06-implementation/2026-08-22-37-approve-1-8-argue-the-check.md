# 2026-08-22 — 37 — Approve 1.8, and argue the check-versus-test distinction

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (story 1.8 Checkpoint 1)
- **Intent**: Keep the spec whole, approve it, and let the schema-drift guard into CI — provided the reason it is not a second test is written down rather than assumed.

## Prompt

```text
K A argumentar por favor! el check y no test
```

## Outcome

`[K]` keep the full spec, `[A]` approved. The schema-drift guard moves from **Ask First** to a ratified requirement, recorded in the spec's change log as a human renegotiation of a frozen boundary, with the argument written into Design Notes and owed to DECISIONS.md: a test executes the system and asserts something about its behaviour — it needs a fixture, an entry point and a claim that can be wrong about a running program. The guard runs no application code, has no fixture, and asserts only that two committed artifacts agree with each other. It can fail for exactly one reason: a schema edited without generating its migration. That is the category `tsc --noEmit` has occupied in `checks` since story 1.1 without anyone counting it as a test. The risk it covers is the one the reviewer will actually hit — a fresh clone booting against a database that does not match the code, during a timed setup. Written with its own escape hatch: if the distinction ever stops being defensible, delete the guard rather than redefine "test".
