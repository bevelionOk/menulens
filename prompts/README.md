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
| `07-hardening/` | Phase 4: whole-repo review (the first multi-agent pass, D2; the second is the final review, D29), hostile-input sweep, failure modes, prompt-log audit |
| `08-submission/` | Phases 5–6: the business note (BUSINESS.md), videos, submission |
| `runtime/` | Versioned runtime prompts the server loads at boot (e.g. `extraction-v1.md`) — not session prompts |

## File format

Each file is one prompt (or one tightly-coupled exchange), named
`YYYY-MM-DD-NN-short-slug.md`, containing:

- **Metadata**: date, tool (Claude Code / BMAD agent / other), model, phase, intent
- **Prompt**: the exact text sent, unedited
- **Outcome**: short note on what the prompt produced and what was kept, changed, or discarded

**Language**: repo documents are English; prompts stay in the language they were written
in (mostly Spanish). Each entry's metadata, `Intent`/`In English` line and outcome are in English.

## Reading the log

- **Numbering.** In `01`–`05` the `NN` restarts each day. From `06` on it is one global
  series: 01–43 in `06-implementation`, 44–48 in `07-hardening`, 49– in `08-submission`.
- **Three layouts coexist**: `Intent` only, `In English` only, or both. The English line
  is `Intent` or `In English`; it was added in bulk on 2026-08-22 (commit 7f0b029, 64
  files) and 2026-08-23 (58 files).
- **Vocabulary.** *worktree*: one git worktree per story. *heartbeat*: a scheduled
  wake-up that watches background subagents. *2×2 audit*: the session-close questions —
  what was considered, what should not have been, what was missed, what was correctly
  left out. *close ritual*: DECISIONS entry, highlights, playbook sync. *superloop*: the
  same session-level loop.
- **Not in the log**: prompts the assistant wrote for its own subagents, and the BMAD
  skills' internal prompts (`.claude/skills/`). One-word approvals are logged on purpose
  as the decision record. Three `.memlog.md` files under `_bmad-output/` are the BMAD
  skills' working memory, written in the chat language (Spanish); they are not deliverables.

### Prompts that decide something

| File | Gloss |
|---|---|
| `01-planning/2026-08-20-05-language-rule-sandbox-master-plan.md` | Documents English, prompts Spanish, practice elsewhere |
| `01-planning/2026-08-21-01-github-actions-audit-setup.md` | Actions audited; signal, not requirement |
| `02-bmad-analysis/2026-08-20-04-point1-retraction-invoke-elicitation.md` | Retracts the under-one-minute latency target |
| `02-bmad-analysis/2026-08-21-14-playbook-not-rector-nfrs.md` | Playbook is a frame, not authority |
| `02-bmad-analysis/2026-08-21-15-2x2-audit.md` | Four consideration questions, PRD session |
| `02-bmad-analysis/2026-08-21-18-heartbeat-into-files.md` | Heartbeat use documented in the files |
| `03-bmad-architecture/2026-08-21-06-golden-master-proposal.md` | One golden-master test replaces unit test |
| `06-implementation/2026-08-22-28-reevaluate-story-count.md` | Agents investigate whether stories over-engineer |
| `06-implementation/2026-08-22-31-ratify-the-cut.md` | D24: seven stories become four deliverables |
| `06-implementation/2026-08-22-32-integral-scope-review.md` | Cut what was built, not asked |
| `06-implementation/2026-08-22-40-fix-the-guard-then-judge-the-claim.md` | Fix the guard; judge claim after |
| `07-hardening/2026-08-22-47-fresh-clone-timed-3-38.md` | Timed fresh-clone run: 3 min 38 |
| `08-submission/2026-08-22-51-three-decisions-ship-it-deeper.md` | Model, pricing, ship-it: analyse deeper |
| `08-submission/2026-08-22-52-challenge-frame-document-not-fix.md` | Challenge frame: document B45, not fix |
| `08-submission/2026-08-22-53-elicitation-5-3-1.md` | Provenance check; three more methods first |
