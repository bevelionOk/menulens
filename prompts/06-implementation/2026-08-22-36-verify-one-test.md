# 2026-08-22 — 36 — "Verify that it is ONE test"

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (story 1.8 planning)
- **Intent**: R8 is a hard submission requirement and the easiest one to violate by accident; make the guarantee mechanical instead of declarative.
- **In English**: Verify that it is ONE test!

## Prompt

```text
verificar que sea 1 TEST!
```

## Outcome

Rewrote the acceptance criterion so the evidence is Vitest's own counter rather than a file count: `npx vitest run --reporter=verbose` must report `Tests  1 passed (1)`, which a `describe` block, a `test.each`, or a second file cannot satisfy. Backed by three greps: zero `describe(`, zero `it(`, zero `test.each`/`test.for`, and exactly one `test(` in the file.

The real risk was named in the same pass: twelve of the twenty-eight entries in `deferred-work.md` begin "Story 1.8 must assert…", which is a suite in disguise. The line drawn — assertions about the one fixture run's own payload fold into the single test (evidence offsets slicing back to the quote, price values, the `GET /api/runs` list row, a review round-trip with a forged batch); anything needing a different fixture, entry point or failure injection stays manual with the reasoning recorded in DECISIONS.md (the SSRF refusal table, the adapter's retry semantics, the env fail-fast branch, the forced-rollback atomicity).
