# Prompt Log — Vibe-Coder Challenge

Every prompt I gave the assistant during this challenge is recorded here, verbatim —
typos, Spanish and all — in chronological order. This folder is a first-class deliverable
per the challenge brief.

## Organization

Prompts are grouped by phase so a reviewer can follow the thought sequence:

| Folder | Phase |
|---|---|
| `01-planning/` | Reconnaissance of the brief, environment setup, methodology decisions |
| `02-bmad-analysis/` | BMAD product brief + PRD |
| `03-bmad-architecture/` | BMAD architecture spine |
| `04-bmad-epics-stories/` | BMAD epic & story breakdown |
| `05-bmad-sprint-planning/` | BMAD readiness gate + sprint tracking |
| `06-implementation/` | Dev prompts (backend, frontend, LLM extraction) — code review and scope decisions are logged here too, in sequence |
| `runtime/` | Versioned runtime prompts the server loads at boot (e.g. `extraction-v1.md`) — not session prompts |

## File format

Each file is one prompt (or one tightly-coupled exchange), named
`YYYY-MM-DD-NN-short-slug.md`, containing:

- **Metadata**: date, tool (Claude Code / BMAD agent / other), model, phase, intent
- **Prompt**: the exact text sent, unedited
- **Outcome**: short note on what the prompt produced and what was kept, changed, or discarded

Prompts are logged as written — including typos and Spanish/English mixing — because
the point is to show the real working process, not a polished afterthought.

**Language convention**: all repo documents are English; prompts are preserved verbatim in
the language they were actually written in (mostly Spanish — the author's native language).
Each entry's metadata, intent and outcome notes are in English so a reviewer can follow
the sequence without translating anything.
