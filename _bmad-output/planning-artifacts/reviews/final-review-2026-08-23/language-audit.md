## Language audit — `full-stack-challenge` (read-only, HEAD `65c8710`)

Script: `/private/tmp/claude-501/.../scratchpad/audit_prompts.py` (Python; parses metadata bullets, `## Prompt*` / `## Outcome` sections, stopword+accent language scoring per section). Every flagged line below was re-read by hand.

### 1. Prompt files — totals

| Metric | Count |
|---|---|
| Prompt files (excl. `runtime/`, `README.md`) | **134** |
| Has date (H1 or `**Date**`), tool, model, phase | 134 / 134 |
| Has `**Intent**` | 70 |
| Has `**In English**` line | 76 |
| Has both Intent and In English | 12 (all of `07-hardening/`, `08-submission/`) |
| Intent only (no `In English`) | **58** |
| In English only (no `Intent`) | **64** |
| Has `## Prompt` body | 134 / 134 |
| Has `## Outcome` | 134 / 134 |
| Prompt body Spanish | 128 |
| Prompt body English | 0 |
| Prompt body mixed | 0 |
| Body language-neutral (`x`, `C!`, `/bmad-product-brief`, `merged!`, `merged`, `merged! teardown!`) | 6 |
| Metadata or Outcome containing Spanish prose | **0** (detector hits were single words like "no"/"a"; verified false positives) |
| `In English` summary mis-stating the prompt | **0** — all 76 compared by hand against the body; all faithful |

Two metadata formats coexist, which is the root of the 58/64 split:

- Format A (`01-planning/…-13`, all of `02`, `03`, `04`): H1 date, Tool/Model/Phase/**In English**, no `Intent`.
- Format B (`01-planning/01–12` and `2026-08-21-01`, `05`, all of `06`): `Date`/Tool/Model/Phase/**Intent**, no `In English`.
- Format C (`07`, `08`): both.

Structural findings (not language breaches, but README-vs-reality — see §4):

| Files | Issue | Fix |
|---|---|---|
| 58 files: `01-planning/*` except `-13`; `05-bmad-sprint-planning/*`; all 43 of `06-implementation/*` | No `**In English**` line (the `Intent` line is an English paraphrase, but not the field the README and D27 promise) | Add an `In English` bullet, or reword README/D27 to say "Intent or In English" |
| 64 files: `01-planning/…-13`, all of `02`, `03`, `04` | No `**Intent**` field (README lists intent as required metadata) | Add `Intent`, or document that `In English` stands in for it |
| `prompts/07-hardening/2026-08-23-45-readme-tone-pass.md` | Dated 2026-08-23 in filename, H1 and `Date`; its commit (`1d0c485`) is 2026-08-22 10:48, before prompt 47 (`2b17c04`, 2026-08-22 13:43). Sorts after 46–48, breaking the "chronological order" claim | Rename/re-date to `2026-08-22-45-…` |
| `02-bmad-analysis/2026-08-21-02`, `03-bmad-architecture/…-03`, `…-05` | "Prompt" is a reconstruction of menu selections (`[Selector] … -> "Coaching"`, `Paradigma → **…**`), not typed text; headings label this honestly | None required; README could mention selection-style entries |
| `07-hardening/2026-08-22-44-phase-4-open.md` | Extra section of *paraphrased* orchestration prompts issued by the session; labelled as such | None required |

Only unquoted Spanish found inside a `## Prompt` section: `08-submission/2026-08-22-51-three-decisions-ship-it-deeper.md` line "Selected: \`Medir terra ahora\` · \`Plataforma, por menú procesado\`" — quoted option labels in backticks, not a breach.

### 2. Non-prompt docs, `_bmad-output/**`, `web/src`, `server/src`, `shared/` — Spanish text

`web/src`, `server/src`, `shared/`: **clean**. Only accented characters are the HTML-entity table in `server/src/core/html-to-text.ts:29-37` (data, not prose). No Spanish code comments.

Repo `.md` (README, BUSINESS, DECISIONS, REQUIREMENTS, docs/, plan/): **no breaches**. Every hit is a quoted prompt or fixture:

| file:line | What it is | Verdict |
|---|---|---|
| `plan/guides/bmad-playbook.md:55-57` | Example brain-dump in a `>` quote under "*You*:" (what Pablo would say to the agent) | Deliberate example; fine |
| `plan/guides/bmad-playbook.md:63`, `:142` | Short quoted Spanish phrases ("fuera de alcance…", "lo que te parezca") | Quotes; fine |
| `plan/video-highlights.md:42, 105, 178, 188, 216` | Quoted Pablo prompts / menu line | Quotes; fine |
| `plan/guides/manual-test-guide.md:52-53` | Synthetic Spanish menu fixture | Fixture; fine |
| `_bmad-output/planning-artifacts/business/measurement-2026-08-22/README.md:13`, `ship-readiness-2026-08-22.md:160`, `compare.txt:14-15`, `*.json` | "según mercado", dish names from la-parra | Fixture data; fine |
| `_bmad-output/planning-artifacts/prds/…/review-bmad-fluency.md:68` | Quotes a memlog line | Quote; fine |

### 3. BMAD-generated artifacts in `_bmad-output` — Spanish prose

All deliverables (brief.md, addendum.md, prd.md, reconcile-*/review-*.md, ARCHITECTURE-SPINE.md + reviews, epics.md, spec-1-*.md, deferred-work.md, epic-1-context.md, ship-readiness, sprint-status.yaml) are **English**. Three committed `.memlog.md` files are entirely Spanish:

| file:line | Fix |
|---|---|
| `_bmad-output/planning-artifacts/briefs/brief-full-stack-challenge-2026-08-20/.memlog.md:2, 6-18` (topic + all 13 entries, e.g. "Extracción estructurada de menús…", "Pablo se retracta de '<1 min'…") | Translate entries, or state in README/REQUIREMENTS that memlogs are working memory in `communication_language` |
| `_bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/.memlog.md:6-30` (25 entries, Spanish) | same |
| `_bmad-output/party-mode/memories/installed/.memlog.md:2, 6-11` (topic "Sala por defecto…", 6 entries) | same |

Caveat, verified: `_bmad/scripts/memlog.py:10-11` defines a memlog as "NOT a deliverable"; skills write it in `communication_language` (Spanish). So this is a gray area, not a clear `document_output_language` breach — but the files are committed under `_bmad-output/` with no note explaining the language. The architecture memlog (`…/architecture-full-stack-challenge-2026-08-21/.memlog.md`) is in English, so the three sessions were inconsistent with each other.

### 4. `prompts/README.md` claims vs reality

| Claim (line) | Reality | Fix |
|---|---|---|
| "Metadata: date, tool (…), model, phase, intent" (l.25) | 64 files have no `intent` field | Add `Intent` to those 64, or amend the list |
| "Each entry's metadata, `In English` line and outcome are in English" (l.31-32) | 58 files have no `In English` line at all (metadata/outcome are English everywhere) | Add the line to the 58, or rephrase to "Intent / In English line" |
| "in chronological order" (l.3-4) | `2026-08-23-45-…` sorts after 46–48 and its date contradicts its commit date (08-22) | Re-date file 45 |
| "Prompt: the exact text sent, unedited" (l.26) | 3 selection-style entries + 1 paraphrased-orchestration section (all labelled in their headings); prompt 55 notes the attached draft is omitted | Optional footnote |
| `07-hardening/` "prompt-log audit" (l.18) and `DECISIONS.md:774-777` / `plan/04-hardening-review.md:26` / `plan/video-highlights.md:480`: "every entry now carries an `In English` summary" | Commit `7f0b029` added 64 lines only to Format-A files; the 58 Format-B files were never touched. The "122 entries" count is also stale (134 now) | Either add the 58 missing lines or correct D27 / plan 04 / highlights to "64 of the 122 that lacked any English paraphrase" |

No edits were made.