# Prompt Log — Vibe-Coder Challenge

Every prompt fed to any LLM during this challenge is recorded here, verbatim, in
chronological order. This folder is a first-class deliverable per the challenge brief.

## Organization

Prompts are grouped by phase so a reviewer can follow the thought sequence:

| Folder | Phase |
|---|---|
| `01-planning/` | Reconnaissance of the brief, environment setup, methodology decisions |
| `02-bmad-analysis/` | BMAD product brief + PRD |
| `03-bmad-architecture/` | BMAD architecture + story breakdown |
| `04-implementation/` | Dev prompts (backend, frontend, LLM extraction, tests) |
| `05-review-hardening/` | Code review, edge cases, production-risk analysis |

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
