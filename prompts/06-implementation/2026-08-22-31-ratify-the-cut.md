# 2026-08-22 — 31 — Evaluate the 1.7 / 2.2 merge and ratify the cut

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (scope decision)
- **Intent**: Stop the build long enough to take the scope decision deliberately, before writing a spec that the decision would invalidate.
- **In English**: Wait. Let's evaluate the merge of 1.7 and 2.2 — that can reduce stories. What result did the investigation give?

## Prompt

```text
espera. vamos a evaluar el tema de la fusion entre 1,7 y 2.2 ... eso puede reducir stories. que resultado te dio la investigacion?
```

## Outcome

Presented the finding: the merge loses no acceptance criterion. 2.2's AC3 already routes its action through 2.1's endpoint (one wire described twice), 2.1's AC4 is already implemented in `core/run-state.ts`, 2.1's AC5 is an absence, and 1.7's AC8 is a table the epics file itself describes as replaced by the Epic 2 screen. Offered four scopes; Pablo chose **Plan B complete**: merge 1.7 + 2.1 + 2.2 into M1, cut AC8, cut stories 2.3 and 2.4 in writing today, fold 3.1 into the submit page, keep 1.8 at exactly one test, write the README early.

Recorded as D24 in `DECISIONS.md` — the first time D19's tag-safe cut ladder is actually exercised — with `sprint-status.yaml` annotated so the merged and cut stories stay visible rather than silently disappearing.
