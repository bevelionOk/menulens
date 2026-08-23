# MenuLens submission — independent evaluation (pre-video state, branch `docs/phase-5-videos` @ 65c8710)

## 1. Rubric scores

| Row | Weight | Score | Evidence | What moves it up |
|---|---|---|---|---|
| BMAD fluency | 25 | **21** | Full chain brief → PRD (36 FR, `prds/.../prd.md`) → spine with `binds: FR1-FR36` (`ARCHITECTURE-SPINE.md:11`) → `epics.md:161-206` FR coverage map → 8 story specs with code maps → code comments citing AD/FR/T ids (`server/src/core/arbiter.ts:6`). Reviews were acted on: normalization-order bug found by adversarial lens → pinned at `SPINE:120-122`; OE-1 HIGH → D19 ladder → exercised in D24. Sprint-status evolved over 16 commits, not one dump. | (a) `implementation-artifacts/sprint-status.yaml:38-58` says epics `done` while all 8 built stories are `review` and merged ones `backlog` — contradicts its own legend; (b) no retrospective although the file advertises the slot; (c) `spec-1-8` lines 83 and 156 still describe the `db:generate`+`git diff` guard that D26 replaced; (d) spine conventions still list `/history` and FR20 with no "superseded by D24" note. |
| Prompt quality | 20 | **15** | 134 verbatim entries, all with Outcome; strong judgment prompts: `03-…-06-golden-master-proposal.md` (supersedes unit-test choice → D16), `06-…-40-fix-the-guard-then-judge-the-claim.md` (corrects the assistant's sequencing → D26), `08-…-52-challenge-frame-document-not-fix.md`. Only 1/134 is a bare slash command. Runtime prompt `prompts/runtime/extraction-v1.md` is well-designed (verbatim price, null policy, evidence-quote substring rule, self-flag triggers). | 39/134 (29%) are ≤12-word approvals ("merged!", "x", "bien!") — the substance is in the assistant-written Outcome, so the *candidate's* voice is thin in a third of the log. Two numbering schemes (per-day in 01–05, global in 06–08); `07-hardening/2026-08-23-45-…` sorts after 46–48. Three file layouts vs one promised in `prompts/README.md`. Personal-tooling jargon (heartbeat, 2×2 audit, worktree, Opus handoff) has no reader's key. `In English` lines were added in bulk in Phase 4 (`DECISIONS.md:774-777`) but `prompts/README.md` does not say so. Runtime prompt: no inline schema, no rule for `evidence_quote` on image/PDF input. |
| Stack competence | 15 | **13** | Fastify app factory with injected `extract` seam (`server/src/app.ts:13-27`), shared error envelope (`errors.ts:20-53`); real drizzle-kit migration + journal + snapshot (`server/drizzle/0000_pale_tana_nile.sql`, `meta/_journal.json`) applied by `db/migrate.ts:12` and in CI; structured outputs via `responses.parse`+`zodTextFormat` (`extraction-adapter.ts:53,125`), vision `input_image` (`:103`), native PDF `input_file` (`:92`); Zod at env/body/LLM boundaries; `core/` has no I/O imports; TanStack polling driven by server state (`web/src/routes/run.tsx:49-53`); real shadcn (`web/components.json`, `components/ui/*`); zero `any`. | `web/tsconfig.app.json` has no `"strict": true` (server/shared do). Seriality gate is TOCTOU (`routes/runs.ts:90-100`, acknowledged as B1). No Pino `redact`; `db/client.ts:13` and `env.ts:23` use `console.*`; adapter logs refusal/parse error text (`extraction-adapter.ts:143,172`) despite the README's "never quoted text" claim. Actions pinned by tag (B39). No server `build`/`start` script. |
| Critical thinking | 15 | **13** | Visible course-corrections with evidence: D10 (target retracted), D16 (unit → golden-master), D24 (cut ladder exercised with measured spec:code ratios), D26 (first version of the guard admitted wrong and replaced), D28 §7 (brief's "zero false-reliables by construction" retracted after measurement). `plan/production-breaks.md` B1–B46 each with trigger/first fix; D25 names what the one test does not cover. | DECISIONS.md is 853 lines; the signal (D4, D16, D24–D28) is buried under session minutes (D21–D23 are build-session triage logs). B45/B10/B14 are "hours each, in `core/`" and left unfixed two days out (D28 §6) — defensible, but a reviewer can read it as neglect unless the README states the trade-off in one line where "Known limitations" does. |
| Business mindset | 10 | **8** | `BUSINESS.md`: €2/menu, customer named (the platform), cost measured $0.0069 on a real 34-dish menu, terra tier measured at 9× and rejected, three-way "would you ship it" (internal / paid / unattended), liability framing on allergens, value anchor explicitly marked unmeasured. Backed by `planning-artifacts/business/ship-readiness-2026-08-22.md` and committed payloads. | The paragraph is 355 words and cites B42/B45/D8/D28 codes a reviewer has not met yet. No alternative pricing model considered (per-seat, included-in-platform, per-reviewed-row). The "would I ship it" conditions are solid; the price reasoning stops at "a quarter of the saving" without naming what a competitor or manual transcription service costs. |
| Communication | 10 | **4 now** (decision-log half ≈ 4/5; videos 0/5 pending) | Log: clear format (context → options → decision → why), entries dated, cross-referenced from README/BUSINESS. Scripts exist and are good: `plan/videos/walkthrough.md` (7:50 target, every number sourced, beats for built/why/cut/breaks/next/price), `plan/videos/personal.md` (3:18 target, fact sheet). | **The videos must deliver**: personal — who, why this role, why a fit, in English, 3–5 min, repo URL + email on screen (script §5 does this); walkthrough — one live run, BMAD chain shown on screen (brief → FR15–21 → spine → story 1.6 → arbiter → test), D24 cuts, **B45/B42/B28 from committed payloads** (never a live non-deterministic repeat), price + three ship answers. Then: links in README + Notion page, playable in incognito. Projected row score if delivered to script: 8–9. |
| Independent judgment | 5 | **4** | D2 (own multi-agent loop kept out of the build), D12 (one minimal CI job, cuts listed), D24 (deleted two stories with numbers), REQUIREMENTS §4 guardrails written on day one. | The process apparatus itself (6 plan files, 853-line decision log, 134 prompts, 46-row register for a 2.3 kLOC app) is the one place a "judgment, not hours" reviewer could push back; a single sentence owning that trade-off would close it. |

**Total: 78 / 100 now; ~83 once both videos land as scripted.**

## 2. Auto-reject checklist

| Tripwire | Verdict | Evidence |
|---|---|---|
| No prompts / blind copy-paste | **PASS** | 134 entries, 1 bare slash command, 49 cite D-numbers, visible corrections (prompt 40 corrects 39; prompt 06 in 03 supersedes 05). |
| BMAD as decoration | **PASS** | Artifacts constrain each other and changed under review (`review-adversarial.md` holes → AD-4/5/10; `prd.md:357-390` annotated for D24 cuts); 31 of 143 commits touch `_bmad-output`. |
| Over-engineering | **PASS** | No queue/redis/auth/event bus/worker; one Fastify service, one Vite app, one compose service; `REQUIREMENTS.md §4` lists the cuts. |
| Secrets in repo | **PASS** | `.gitignore:2-4`; `.env` never tracked; tree and all revisions grep clean for `sk-…`; gitleaks over full history in `ci.yml`. |
| No personal video | **PENDING** — script at `plan/videos/personal.md`; not recorded. Fails by default until done. |
| Cannot explain what breaks in production | **PASS** | `plan/production-breaks.md` B1–B46 by category; D27 hostile sweep table; three failure modes *measured* (B42, B45, B46) with payloads in `planning-artifacts/business/measurement-2026-08-22/`. |

## 3. Required-stack checklist

| Item | Verdict | Evidence |
|---|---|---|
| Fastify + TS | PASS | `server/src/app.ts:16`, `server/tsconfig.json` strict |
| Postgres + Drizzle, real migration | PASS | `server/drizzle/0000_pale_tana_nile.sql` (38 lines: FK, unique, numeric, bytea), `meta/_journal.json`, `db/migrate.ts`, CI `db:migrate` + drift guard |
| React + Vite + TS + Tailwind + shadcn/ui | PASS (web tsconfig not strict) | `web/vite.config.ts`, `components.json`, `src/components/ui/` (8 components), `index.css:1-3` Tailwind v4 |
| OpenAI SDK JSON mode + vision | PASS | `extraction-adapter.ts:53` zodTextFormat, `:125` `responses.parse`, `:103` `input_image`, `:92` `input_file` |
| Pino | PASS | Fastify `logger: true` (`app.ts:16`); structured fields in `run-pipeline.ts:103`, `extraction-adapter.ts:148-161`; no `redact` |
| Exactly one meaningful test, justified | PASS | `server/test/golden-master.test.ts:237` single `test()`; `vitest.config.ts:7` includes only that file; justification D16 + D25; CI drift guard is a shell grep, not a test (D26) — defensible. Note: `.claude/skills/**/scripts/tests/test_*.py` (10 vendored BMAD pytest files, plus 5 committed `.pyc`) will show up for any reviewer who greps for tests. |
| `.env.example` only | PASS | placeholders only; `TEST_DATABASE_URL` documented |
| Prompts in `prompts/` | PASS | 134 files + `runtime/extraction-v1.md` |
| BMAD artifacts checked in | PASS | `_bmad-output/` 52 files; `_bmad/` config; `.claude/skills/` vendored v6.11.0 |

## 4. Highest-leverage in-scope improvements (score impact ÷ effort)

1. **Fix `sprint-status.yaml`** — 8 stories → `done`, 2.1/2.2/3.1 → `done # inside M1 (D24)`. 0.5 h. Risk: none. Hits the 25% row; it is the first file a BMAD-literate reviewer opens to check "real vs cosmetic", and it currently contradicts itself.
2. **README: orientation before commands.** Move "How to read this repo" (line 161) to right under the intro; add a 6-row deliverables map (app, DECISIONS D25 for the test, BMAD path, prompts, BUSINESS, videos, contact email — the brief requires a working email; README has none). Add a "Videos" section with placeholders now. 1 h. Risk: low.
3. **`prompts/README.md` reader's key** — 10 lines: what heartbeat / 2×2 audit / worktree / "close ritual" mean, that approvals are logged on purpose, that `In English` lines were added in Phase 4, and a "15 prompts that show judgment" index. 1 h. Risk: none. Directly addresses the 20% row's weakest signal (29% micro-prompts).
4. **Stale-text sweep** — `plan/00-OVERVIEW.md:17` Phase 4 "next up" (closed per D27); `spec-1-8` lines 83/156 (old guard); spine `:228,232` one-line "superseded by D24"; README "36 requirements" → "36 FRs + 5 NFRs"; D27 "122 entries" → "134". 0.5–1 h. Risk: none.
5. **`"strict": true` in `web/tsconfig.app.json`** and fix what surfaces. 1–2 h. Risk: moderate (may expose null-handling in `submit.tsx`/`run.tsx`); cheapest real point on the stack row.
6. **B45 fix in `core/arbiter.ts` (declaration marker)** — spec already written in D28 §8, golden unchanged. 2–3 h incl. one verification run. Risk: contradicts the D28 §6 "not fixed on purpose" record — if done, amend D28 rather than delete it. Converts the README's most alarming limitation ("a reliable row can be wrong") into a fixed-and-measured story. Reviewer's call; the current documented stance is defensible.
7. **Run `bmad-retrospective` on Epic 1** and commit it. 1–2 h. Risk: adds more prose to an already heavy repo; keep it to one page.
8. **BUSINESS.md trim** — keep one paragraph, target ≤220 words, drop internal codes or gloss them once ("B45 — an ingredient word passing as a declaration"). 0.5 h. Risk: losing the measured nuance; keep the numbers.

Not recommended: prompt-file renumbering (breaks `DECISIONS.md:791,824,827` references by number; gains little).

## 5. What confuses a reviewer in the first 10 minutes

- README: nine commands before any statement of what to read or where the deliverables are; "How to read this repo" is at line 161. No email, no video links.
- `plan/00-OVERVIEW.md` says Phase 4 is "next up"; DECISIONS D27 and git say it closed on Aug 22.
- `sprint-status.yaml`: epics `done`, stories `review`/`backlog`.
- README quick start says la-parra gives "two, sometimes three" `reliable` rows; D25 and the test say "one row reliable" — the test mocks the model, the live run does not, and nothing says so where both numbers appear.
- "36 requirements" (README) vs 36 FR + 5 NFR; "122 entries" (D27) vs 134 files; commit `e1efbe4` says "62 ACs".
- DECISIONS.md is written in the assistant's voice ("approved by Pablo", "Pablo's call") — the candidate appears in the third person in his own decision log. A reviewer will ask who authored it; nothing states the authorship convention.
- `BUSINESS.md` cites B42, B45, D8, D28 before the reader knows what a B-number is.
- Prompts: two numbering schemes, three layouts, one file dated 08-23 sorting after 46–48, and unexplained tooling vocabulary (heartbeat, superloop, 2×2 audit, Opus handoff) in `prompts/` and `plan/RISKS.md` R-11.
- `.claude/skills/` (248 vendored files incl. `__pycache__/*.pyc` and pytest files) sits next to the one-test claim; README says "Not my code" only at line 175.
- Git: two author identities (Pablo Javier / bevelion) and a clone URL (`menulens`) that differs from the working folder name (`full-stack-challenge`) — explained in README, but the repo is still private, so none of it is verifiable yet.