## Audit report — inconsistencies in `/Users/pablojavier/dev/full-stack-challenge` (branch `docs/phase-5-videos`, HEAD `65c8710`)

Verified against `git log --date=iso` (last commit 2026-08-22 21:09 +0200; nothing committed on the 23rd), file counts, and the measurement payloads. Read-only; nothing edited.

### 1. DATE anomalies

| file:line | what it says | what is true / contradicts | fix | severity |
|---|---|---|---|---|
| `plan/00-OVERVIEW.md:17` | Phase 4 "Aug 23–24 · 🔄 next up" | `plan/04-hardening-review.md:16` says "Phase closed 2026-08-22"; D27 dated 2026-08-22 | `✅ DONE (Aug 22) — D27` | blocker |
| `plan/00-OVERVIEW.md:18` | Phase 5 "⬜ proposed" | Scripts + recording setup committed 2026-08-22 21:09 (`65c8710`), phase in progress | `🔄 in progress — scripts in videos/` | minor |
| `plan/04-hardening-review.md:1` | title "(Aug 23–24)" | Work and close happened on Aug 22 (`:16`) | "(Aug 22; planned 23–24)" | minor |
| `plan/03-implementation.md:1`, `plan/00-OVERVIEW.md:16` | Phase 3 "Aug 22–23" | Story 1.1 landed 2026-08-21 21:59 (`ea1ec1b`), build closed 2026-08-22 04:30 (`4ef4154`) | "Aug 21–22" | minor |
| `plan/02-bmad-planning.md:1` | "(Aug 21)" | Product-brief session ran 2026-08-20 (`prompts/02-bmad-analysis/2026-08-20-*`, highlights Session 1 2026-08-20) | "(Aug 20–21)" | minor |
| `prompts/07-hardening/2026-08-23-45-readme-tone-pass.md:1,3` | date 2026-08-23 in filename and metadata | Committed 2026-08-22 10:48 (`1d0c485 … prompt 45`); file sorts *after* 46–48 (dated 08-22), breaking "in order" | rename to `2026-08-22-45-…`, metadata date 2026-08-22 | blocker (prompt log is 20% of rubric) |
| `REQUIREMENTS.md:59` | "Writing rule (2026-08-23)" | Introduced in `1d0c485`, 2026-08-22 10:48 | 2026-08-22 | minor |
| `plan/production-breaks.md:58` | "## By category (2026-08-23)" | Introduced in `6a7615a`, 2026-08-22 10:46 | 2026-08-22 | minor |
| `plan/video-highlights.md:12` | "Tone rule for the scripts (2026-08-23)" | Same commit `1d0c485`, 2026-08-22 | 2026-08-22 | minor |
| `DECISIONS.md:800` (D28), `plan/production-breaks.md:55` (B45), `plan/videos/walkthrough.md:49,76` | Vox gave "0 of 34 **a day earlier** / the day before" | B42 run registered `8030089` 2026-08-22 11:23; B45 measured 2026-08-22 14:38–14:40. `production-breaks.md:56` (B46) and `ship-readiness:37` correctly say "22 Aug morning / same morning" | "the same morning" in all four places (the video line will be spoken) | blocker |
| `BUSINESS.md:3`, `DECISIONS.md:829-830` (D28 §6), `plan/video-highlights.md:442,537`, `plan/videos/personal.md:30` | "two days out / two days before the deadline" | Written on Aug 22; deadline Aug 25 (`REQUIREMENTS.md:35`, D8) = three days | "three days out" (or state "on the 22nd, deadline the 25th") | minor |
| `plan/04-hardening-review.md:24` | "this PR: generate the sample before `npm run dev`" | Relative wording; that was PR #22 (`862b896`) | "#22" | minor |
| `_bmad-output/implementation-artifacts/sprint-status.yaml:31-32` | `generated: 08-21-2026 21:05`, `last_updated: 08-22-2026 04:40` | mm-dd-yyyy while every other doc uses ISO; otherwise correct | ISO dates | minor |

### 2. COUNT drift

| file:line | what it says | what is true | fix | severity |
|---|---|---|---|---|
| `plan/04-hardening-review.md:20`, `DECISIONS.md:695-722` | "29 findings → 19 deduplicated → 4 fixed, 14 registered (B28–B41)" + "Two findings were already in the register" | 4 + 14 + 2 = 20 ≠ 19 | reconcile (e.g. "19 deduplicated: 4 fixed, 13 new rows + 1 finding split, 2 already registered") | minor |
| `_bmad-output/planning-artifacts/business/ship-readiness-2026-08-22.md:167` | "terra is 5–9× luna" | From its own table (`:156-163`): la-parra 0.0252/0.0014 = 18×; german 7.4×; no-prices 6.3×; Vox 8.8× | "6–18× (9× on the 34-dish menu)"; D28:807 "5–9×" same | minor |
| `plan/videos/walkthrough.md:1,5-15,19` | "target 7:50", "Eight minutes", "≈1,180 words ≈ 7:50" | Segment table: 0:00 + lengths = **8:25** (segment 8 starts 8:05 + 0:20); spoken text counts 1,184 words | shorten segments by ~35 s or set target 8:25 | minor |
| `plan/videos/walkthrough.md:49` | "Three were measured. B45 … B46 … B42 … B28" | B28 (hidden HTML text) is reasoned, not measured; B42, B43, B45, B46 are marked measured/live in the register | "Three measured: B42, B45, B46" and introduce B28 separately | minor |
| `README.md:195-196` | "the four behaviours it does not cover are in D25" | D25 lists **four** manual-only items (`:566-578`) and **five** "known gaps" (`:600-621`); walkthrough `:49,82` names four gaps | "the four manual-only checks and the five known gaps" | minor |
| `README.md:62-63` vs `README.md:193-194` | la-parra "two, sometimes three" `reliable`; "the same PDF the test uploads" … fixture "leaves one row `reliable`" | The test mocks the model (one reliable row by construction); live runs give 2–3 (`compare.txt`: 2) | add "(the test mocks the model output; live runs give two or three)" | minor |
| `plan/guides/manual-test-guide.md:71` vs `:95` | scenario 1 "Tortilla and Croquetas `reliable`" (2) vs "6 rows, 3 `reliable`" | `sample-menu.ts:10` prints "2 reliable, 4 uncertain"; README says 2–3 | make both lines "2, sometimes 3 (B46)" | minor |
| `plan/video-highlights.md:285,366` | two headings "Session 7"; no Session 5/6 headings (highlights 31–36 sit under "Session 4"); 9–12 absent | Git: session-5 = highlights 31–32 (`33689ef`), session-6 = 33–36 (`c6763a6`), Story 1.6/M1 session is not "7" | renumber headings or drop session numbers | minor |
| `plan/RISKS.md:20` | R-13 "TS 7, Vite 8, Zod 4, openai 7, pdfjs 6" | TypeScript landed 6.0.3 (D21 `DECISIONS.md:366`) | "TS 6" | minor |

Counts that **check out**: D1–D28 (28 entries); B1–B46 (46 rows); README category table 6/9/11/8/2/8/2 = 46; highlights #1–#67; prompts 134 total (14/34/11/18/2/43/5/7), walkthrough says 134; D27 "122 entries" was true at `7f0b029`; 13 stories 8+4+1, 84 ACs in `epics.md`, 11 cut (2.3×5 + 2.4×5 + 1.7 AC8), 73 shipped; FR1–FR36; 3:00/3:38 times match prompts 47–48; $0.0069 / $0.061 / 6 of 34 / 38 of 38 match `compare.txt`; 18 sweep inputs.

### 3. STATUS drift

| file:line | what it says | what is true | fix | severity |
|---|---|---|---|---|
| `REQUIREMENTS.md:28` | "☑ Repo with runnable app + README — the timed fresh-clone run (plan 4.5) is Pablo's, **still pending**" | 4.5 done 2026-08-22, 3:38 and 3:00 (`plan/04:24`, prompts 47–48) | drop the clause, or "fresh-clone run 3:38/3:00, 2026-08-22" | blocker (self-contradicting line on the checklist a reviewer reads) |
| `REQUIREMENTS.md:97-102` | §7 ☐ fresh-clone test, ☐ secret scan (history), ☐ prompts complete with outcomes, ☐ BMAD folders committed, ☐ DECISIONS covers four topics | All done per D27 (4.5, 4.6, 4.7), `_bmad-output/` tracked, D25/D4/D27/D24 exist | tick with dates, leave videos/language/link open | minor |
| `_bmad-output/implementation-artifacts/sprint-status.yaml:39-46` | stories 1-1 … 1-8 all `review` | Epic-1 `done` (`:38`); every story merged to `main` with PRs #6–#14; README/epics say SHIPPED | set to `done` | minor |
| `sprint-status.yaml:50-51,57` | 2-1, 2-2, 3-1 `backlog` | README counts them as delivered inside M1; comments explain, status does not | `done` with the same comment | minor |
| `sprint-status.yaml:45` | key `1-7-submit-watch-an-honest-waiting-ui` | spec file is `spec-1-7-m1-submit-watch-review.md` | align key or add comment | minor |
| `plan/00-OVERVIEW.md:48` | "BUSINESS.md — Draft exists; distilled in 6" | Done 2026-08-22 (`plan/06:8`, D28) | "Done 2026-08-22 (D28)" | minor |
| `README.md:110` | Next #4: "`deferred-work.md`, in that file's order" | File is append-only with no closure marks; at least 6 entries are already done: healthcheck (`docker-compose.yml:22`), `connectionTimeoutMillis` (`server/src/db/client.ts:8`), CI dummy key (`ci.yml:64`), tsconfig include (`server/tsconfig.json:13`), list row + review round-trip in the golden (D25), atomic done+dishes (1.6) | strike-through done entries or add "(closed by …)" per entry | minor |
| `plan/guides/manual-test-guide.md:1-25` | Part A written as a future instruction ("Start the stopwatch…") | 4.5 done; guide `:20` still says "one run has reached `done`" while the UI now shows `extracted` (B44) | add "Done 2026-08-22 — 3:38/3:00" header; `done` → `extracted` | minor |
| `plan/RISKS.md` (whole) | "Reviewed at the start of each phase"; no reference to any B-row | `production-breaks.md:7` says the register "feeds … the RISKS register"; R-02/R-03 never point at B42/B40 | one line per risk citing the B-rows that realised it | minor |
| `DECISIONS.md:722` (D27) | "Not fixed, registered: B28–B41 **above**" | They are in `plan/production-breaks.md`, not above in DECISIONS | "in `plan/production-breaks.md`" | minor |

### 4. Dangling references

| file:line | what it says | what is true | fix | severity |
|---|---|---|---|---|
| `plan/03-implementation.md:24` | "Every `/bmad-build` session prompt → `prompts/04-implementation/`" | Folder is `prompts/06-implementation/` (`04-` is epics-stories) | `prompts/06-implementation/` | blocker (wrong path in a plan file the reviewer follows) |
| `plan/videos/personal.md:53` | close-out audits: `2026-08-20-07, 08-21-03, 08-21-08, 08-21-10, 08-22-14, 08-22-33, 08-22-43` (no folder) | `2026-08-20-07` exists in **two** folders (`01-planning`, `02-bmad-analysis`); `08-21-03/-08/-10` each exist in **four** folders; `02-bmad-analysis/2026-08-21-15-2x2-audit.md` is omitted | prefix each with its folder | minor |
| `plan/00-OVERVIEW.md:51-60` | Detailed guides: RISKS, bmad-playbook, implementation-playbook | `plan/guides/manual-test-guide.md` (referenced by D27:783) not listed | add the row | minor |
| `_bmad-output/planning-artifacts/epics.md:451,475` | `GET /api/runs/:id/artifact`, `/history` | Neither built (`web/src/App.tsx:7,23-24`); documented by D28 §5 as left as-is | none needed — consistent by decision | — |

Checked and present: `web/vite.config.ts`, `.gitleaks.toml`, `_bmad/_config/files-manifest.csv`, `.claude/skills` (49), `prompts/runtime/extraction-v1.md`, PRD path `prds/prd-full-stack-challenge-2026-08-21/`, business/measurement folder (8 payloads, `compare.txt`, `model-usage.jsonl`), `fetch-url.ts:96`, `price.ts:3`, `arbiter.ts:13-15`, prompts 38/47/48/51/52 exist and say what D28/plan cite; BMAD 6.11.0 matches `_bmad/_config/manifest.yaml`.

### 5. Contradictory claims between documents

| file:line | claim | contradicts | fix | severity |
|---|---|---|---|---|
| `DECISIONS.md:800`, `production-breaks.md:55`, `walkthrough.md:49,76` vs `production-breaks.md:56`, `ship-readiness:37` | "a day earlier / the day before" vs "22 Aug morning / same morning" | git: both runs on 2026-08-22 | see §1 | blocker |
| `plan/videos/walkthrough.md:1,19` vs `:5-15` | 7:50 / "Eight minutes" vs segments summing to 8:25 | internal | see §2 | minor |
| `README.md:193` vs `README.md:62`, `sample-menu.ts:10`, `manual-test-guide.md:71/95` | "one row reliable" (test) vs 2 / 2–3 / 3 (live) | same PDF, different model outputs | clarify mock vs live | minor |
| `ship-readiness:167`, `DECISIONS.md:807` "5–9×" vs `ship-readiness:156-163` | la-parra terra/luna = 18× | own table | see §2 | minor |
| `REQUIREMENTS.md:28` vs `plan/04:24` | "still pending" vs "Done 2026-08-22" | — | see §3 | blocker |
| `plan/00-OVERVIEW.md:17` vs `plan/04:16`, D27 | "next up" vs "closed" | — | see §1 | blocker |
| `prompts/README.md:24-25` | naming `YYYY-MM-DD-NN` | `NN` restarts per day in folders 01–05 (e.g. `01-planning/2026-08-20-01` and `2026-08-21-01`) but runs continuously 01–43 in `06-implementation` and 44–55 across 07/08 | state the convention (per-day in planning folders, global from 06 on) | minor |

Consistent across docs (no finding): cost $0.0069 / 9× / €2 / 200 k cap / >99 % / 15–30 min / €30 h (BUSINESS, D28, plan/05, walkthrough, ship-readiness); model `gpt-5.6-luna` (README, `.env.example:25`, D3, D28); 46 rows; 38 of 38; 6 of 34; 3:38 / 3:00; one retry on invalid output, none on timeout (README:93,211, D27, walkthrough:69); 134 prompts; English-docs/Spanish-prompts language rule; D1–D28 in REQUIREMENTS:29.

### 6. Prompt log gaps

| file:line | finding | severity |
|---|---|---|
| `prompts/07-hardening/2026-08-23-45-readme-tone-pass.md` | Only file dated 08-23; committed 08-22 10:48; sorts after 46–48 so the folder reads 44, 46, 47, 48, 45 | blocker (see §1) |
| All 134 files | Filename date == first date in metadata for every file (scripted check, 0 mismatches); header numbers == filename numbers for 06/07/08 (0 mismatches) | — |
| Numbering | No holes or duplicates: 06 = 01–43, 07 = 44–48, 08 = 49–55; global series 41–55 intact. Per-day restarts in 01–05 create same-`NN` files across days (not holes, but ambiguous when cited without folder — see §4 personal.md) | minor |

### Totals

- **Blocker for a reviewer: 6** — Phase 4 "next up" in the overview; REQUIREMENTS:28 "still pending"; prompt 45 dated 08-23 (ordering); "a day earlier" in D28/B45/walkthrough (spoken on camera); `prompts/04-implementation/` path; (the date/status items above counted once each).
- **Minor: 29** — mostly the 08-23 labels committed on the 22nd, "two days out", 8:25 vs 7:50, 5–9× vs 18×, sprint-status `review`/`backlog`, stale §7 and overview rows, deferred-work entries already closed, highlight session numbering, TS 7 in R-13, ambiguous prompt citations.