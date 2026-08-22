# Prompt Log — Vibe-Coder Challenge

Every prompt I gave the assistant during this challenge, verbatim — typos, Spanish and
all — in chronological order.

## Organization

Grouped by phase:

| Folder | Phase |
|---|---|
| `01-planning/` | Reconnaissance of the brief, environment setup, methodology decisions |
| `02-bmad-analysis/` | BMAD product brief + PRD |
| `03-bmad-architecture/` | BMAD architecture spine |
| `04-bmad-epics-stories/` | BMAD epic & story breakdown |
| `05-bmad-sprint-planning/` | BMAD readiness gate + sprint tracking |
| `06-implementation/` | Dev prompts (backend, frontend, LLM extraction), code reviews and scope decisions, in sequence |
| `07-hardening/` | Phase 4: whole-repo review (the one multi-agent pass, D2), hostile-input sweep, failure modes, prompt-log audit |
| `runtime/` | Versioned runtime prompts the server loads at boot (e.g. `extraction-v1.md`) — not session prompts |

## File format

Each file is one prompt (or one tightly-coupled exchange), named
`YYYY-MM-DD-NN-short-slug.md`, containing:

- **Metadata**: date, tool (Claude Code / BMAD agent / other), model, phase, intent
- **Prompt**: the exact text sent, unedited
- **Outcome**: short note on what the prompt produced and what was kept, changed, or discarded

**Language**: repo documents are English; prompts stay in the language they were written
in (mostly Spanish). Each entry's metadata, `In English` line and outcome are in English.
