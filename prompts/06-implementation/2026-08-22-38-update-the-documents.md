# 2026-08-22 — 38 — Update the documents that stopped being true

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (documentation pass)
- **Intent**: Bring the four flagged documents in line with what happened — without rewriting what was planned.

## Prompt

```text
si por favor, actualiza los señalados y deja sin tocar los de arquitectura y los 14 docuemntos. eso nos deja la historia. la idea NO es cambiar la historia sino reflejarla, pero cada docuemnto debe cumplir su proposito!
```

## Outcome

The framing became the method: annotate, never edit the original claim. `prd.md` gained an amendments section — using the convention the file already had from the architecture session — naming FR20, FR23, FR26 and FR27's reopen affordance as cut, with not one line of the original requirements deleted. `epics.md` gained a status tag per story heading (SHIPPED / CUT / merged into M1) plus a note saying the story text below is untouched on purpose, because what a team decided not to build is part of the record. `REQUIREMENTS.md`'s checkboxes now tell the truth: twelve hard requirements ticked, the videos and `BUSINESS.md` still open with their phase named. `README.md` moved M1 and the test from "in flight" to shipped. The architecture spine and the fourteen planning reviews were left alone: their value is being the record.
