## Consistency recheck — `docs/phase-5-videos` @ 3ade311 (read-only)

### 1. Numbers

**Price — every remaining "€2"** (all historical-by-design unless marked):

| file:line | text | verdict |
|---|---|---|
| BUSINESS.md:3 | "the €2 first written here (D28) took 40–80 %" | by design |
| DECISIONS.md:22, :837, :839 | D28 index row / D28 §4 | by design (§5 of D29 keeps D28 intact) |
| DECISIONS.md:885, :889, :898, :932 | D29 "was €2", Pablo's quote, "not changed" | by design |
| ship-readiness-2026-08-22.md:208–209 | A1/A2 table | by design (amended header line 3) |
| plan/video-highlights.md:538 (#66), :553–556 (#68) | | by design |
| plan/videos/walkthrough.md:37, :87; plan/05:35 | "was two euros / was €2" | by design |
| reviews/final-review-2026-08-23/* | reviewer reports | evidence, frozen |
| README.md | no price at all; points to BUSINESS.md | nothing stale |

**Prompt count**: `find` = 135. README.md:19 "135 entries" ✓. "134" appears only in the five reviewer reports and in prompt 56 Outcome §3 (the language audit result, counted before prompt 56 existed) — acceptable. DECISIONS.md:794 (D27) still says "Prompt-log audit: 122 entries" with no "at the time" — minor (reviewer A had flagged it).

**Fixture rows (7)**: `menu-pdf.ts` 8 dish lines + legend ✓; `sample-menu.ts` prints "7 dishes: 2 reliable, 5 uncertain" ✓; manual-test-guide:73 ✓, :97 qualified ✓; walkthrough:25, :72 ✓; recording.md ✓; D26 line 638 amended ✓. Stale:

| file:line | issue | fix |
|---|---|---|
| README.md:96 | "the same PDF the test uploads: six dishes" — contradicts README:103 "`7 of 7 resolved`" and the walkthrough's "seven rows" | "seven dishes" |
| DECISIONS.md:641 | D26 "the golden, which has six dishes" — three lines after the amended 638 | "(seven since 2026-08-23)" or drop the count |

Historical 6-row mentions that are correct as dated: measurement-2026-08-23/README.md (run at 18:31, before fixture commit 9cce65b 18:52), ship-readiness:158/:194, measurement-22, highlights #65.

**Decisions D1–D29**: REQUIREMENTS.md:29 ✓; DECISIONS index row D29 ✓. **Register**: 46 `| B..` rows ✓; B10/B14/B45 carry "**Fixed 2026-08-23**" ✓; README category table 6+9+11+8+2+8+2 = 46 ✓.

**Dates**: all 14 commits 2026-08-23; `model-usage.jsonl` epochs = 18:31:28–18:32:09 on 08-23 ✓ (D29 §3, measurement README); prompt 56 metadata 08-23 ✓; prompt 45 file and `**Date**` 08-22 ✓; B45 "Measured 2026-08-22 … Fixed 2026-08-23" ✓; B46 "22 Aug morning / afternoon" ✓; highlights #71 ✓. One anomaly:

| file:line | issue | fix |
|---|---|---|
| README.md:43–44 | "link pending — recorded 2026-08-24" states a future recording as fact | "to be recorded 2026-08-24" |

### 2. Cross-references

All cited paths exist: `docs/challenge/INTERPRETATION.md`, `sprint-status.yaml`, `epics.md`, `server/drizzle/0000_*.sql`, `t6-verify.ts`, `reviews/final-review-2026-08-23/` (5 reports), `measurement-2026-08-23/` (11 files). All 12 commit hashes cited in D29/prompt 56 are in the log. `menus/injection.pdf` is git-ignored and recording.md says so. `prompts/04-implementation/` appears only as the corrected stale path. `replay-0822-vox.txt`: 19 entries, all `marker=false`, "reliable after replay: 0 of 34" ✓. `compare.txt`: vox 0 rel / $0.0063; la-parra T6 ×2 on Ensalada ✓. measurement README: "every Vox allergen `inferred` this run" ✓. Two soft mismatches:

| file:line | issue | fix |
|---|---|---|
| README.md:26 vs walkthrough.md:66 | ten-minute list "D4, D19, D24, D27, D28" vs spoken "D4, D24, D25, D28, D29" | pick one list; add D29 to README |
| DECISIONS.md:902 vs spec-1-6:91–104 | "14 findings: 8 patched, 3 deferred" — spec lists 12 items; patched rows are `[ ]`, deferred rows `[x]` | reconcile count; flip checkboxes |
| prompts/README.md:18; plan/04-hardening-review.md:8 | "the one multi-agent pass (D2)" / "the one place our own orchestration is used" vs personal.md:30 "ran twice, 22nd and 23rd" and D29's five parallel reviewers | "first multi-agent pass" / note D29 |
| REQUIREMENTS.md:34 | BUSINESS.md "(2026-08-22, D28 …)" — rewritten 08-23 under D29 | add "revised 2026-08-23, D29" |
| BUSINESS.md:3; DECISIONS.md:919 | "$0.0069 … measured 2026-08-22 and again on the 23rd" / "Cost unchanged ($0.0063)" — the 23rd gave $0.0063 | "$0.0069 / $0.0063" as the walkthrough fact sheet does |

### 3. Language
No unquoted Spanish in today's added lines outside prompt bodies. D29 §1 quotes Pablo in Spanish (quoted, attributed); reviewer reports quote prompt text. `Leyenda de alérgenos`, `Bogavante del día`, `Aliño con mostaza…` are fixture text.

### 4. Writing rule §4 over today's text
D29, BUSINESS.md, README edits, "Reading the log", prompt 56 outcome, highlights 68–71, both scripts: no second-person, no "honest/robust/the point", no justifying codas found. Residuals (pre-existing words inside rows edited today):

| file:line | issue | fix |
|---|---|---|
| plan/production-breaks.md:20 (B10) | "The gate is only as **honest** as her review" — row is on camera (walkthrough §5 screen) | "only as good as" |
| plan/production-breaks.md:24 (B14); deferred-work.md:67 | "the **honest** fix is to refuse" | "the fix is to refuse" |
| prompts/README.md:48 | heading "Prompts that carry **judgment**" — banned word in a reader-facing file | "Prompts that decide something" |

### 5. Git hygiene
`git status` clean. No `.env`, `.pyc`, `la-parra.pdf`, `menus/` tracked (the `la-parra` grep hit is `gpt-5.6-luna--la-parra.json`, a run payload). `measure.sh` contains only the local `postgres:postgres@localhost:5433` dev URL; no key patterns in the measurement files. `golden-master.json` diff: `dish_count`/`total` 6→7 in both snapshots, rows 2–4 `declared`→`inferred` with T6 + T1 reasons, new position-6 Bogavante row (T2, `price_value: null`) — nothing else.

**Count: 1 blocker (README.md:96 "six dishes"), 12 minor.** No edits made.