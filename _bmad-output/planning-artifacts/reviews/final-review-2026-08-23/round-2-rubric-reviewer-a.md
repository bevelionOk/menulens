**Evaluation — `docs/phase-5-videos` @ 3ade311 (14 commits since 65c8710; 108 files, +1446/−200)**

## 1. Rubric scores

| Row | W | Now | Δ | Evidence | Why the delta |
|---|---|---|---|---|---|
| BMAD fluency | 25 | **22** | +1 | `sprint-status.yaml:38-58` stories now `done`, merged ones `done # shipped inside M1`; `spec-1-6…:89-114` gained *Review Findings* (bmad-code-review, 4 layers) + *Spec Change Log* (3 dated supersessions: AC6 visual, AC2 thousands, T6 marker); `prd.md:84-87` amendment under the "by construction" claim; `DECISIONS.md:7-25` index. | The late fix went through the same spec→review→change-log path as the stories — that is the "real, not cosmetic" signal. Held back: no retrospective (`sprint-status.yaml:47` still `optional`); `spec-1-8:83,156` still describe the `db:generate`+`git diff` guard D26 replaced; spine `:228,232` still list `/history`/FR20 unannotated; Review Findings list 12 items while D29 §2 says "14 findings: 8 patched, 3 deferred", and the 9 resolved items are `[ ]` while the 3 deferred are `[x]`. |
| Prompt quality | 20 | **16** | +1 | `prompts/README.md:33-66` reader's key (numbering, vocabulary, "one-word approvals logged on purpose", 15-prompt judgment index); `In English` on all 135 (`c106df8`, 58 files); `08-submission/2026-08-23-56-*.md` — verbatim Spanish prompt plus four verbatim follow-ups, including the reversal of prompt 52 ("yo habia elegido documentar y no arreglar…"). | The 20% row is scored from the prompts; 56 is the strongest judgment prompt in the log (challenges its own price with a number, orders a scored review, reverses a ruling with a reason). Unchanged: ~29% micro-approvals, two numbering schemes (now documented, not fixed). |
| Stack | 15 | **13** | 0 | `core/t6-verify.ts:19-40` marker list, price-strip before digit test, visual branch; `core/price.ts:41` thousands refusal; `golden-master.test.ts:296-345` extended inside the one `test()` (`vitest.config.ts:7` still one file). | Competent, pure-`core/` change with calibration comments. Nothing moved on the row's own criteria: `web/tsconfig.app.json` still not `strict`, B1 TOCTOU, no Pino `redact`. |
| Critical thinking | 15 | **14** | +1 | `DECISIONS.md:875-937` D29: reverses D28 §6 with the reviewers' argument quoted, records that §8's "golden unchanged" was wrong (§2), admits the live re-run "had nothing to check" (§3); `measurement-2026-08-23/README.md` "Neither B10 nor B14 had an input to fire on"; `replay-0822-vox.txt` 19 quotes, 0 markers. | The repo argues against itself in writing and keeps the losing text (D28 intact, amended inline at `:847,859`). Deducted: BUSINESS/README say B10/B14 "re-measured" when the measurement file says they were not exercised. |
| Business mindset | 10 | **9** | +1 | `BUSINESS.md:3` — €0.50, cost $0.0069 + ≈€0.05 infra = €0.06, saving 5–10 min = €2.50–5, €2 = 40–80% of it, $0.03/page extractor anchor, reprice trigger (`reliable` > 30%), three ship answers; D29 §1 shows the arithmetic. | Now has a cost stack, a competitor anchor and a stated condition to reprice — the three things the previous review said were missing. Still ~400 words citing B42/B45/D28 before the reader meets them. |
| Communication | 10 | **4 now / 9 projected** | 0 / +0.5 | Log half ≈4.5/5: index at `DECISIONS.md:7-25`, D29 dated and cross-linked from README:147,196 and BUSINESS. Scripts: `walkthrough.md` 8:15, every number sourced in a fact sheet, business beat at 1:45, B45 shown from `gpt-5.6-luna--vox.json` + `replay-0822-vox.txt` (never live), D25 gaps named; `personal.md` 3:17, repo URL + email on screen; `recording.md:27` seed list and prompt-recount command. | Videos not recorded → row scores 4 until the links exist. If delivered as written: 9. |
| Independent judgment | 5 | **4** | 0 | D29 §2 reversal on evidence; D29 §5 "not changed" list (spine, test count, D28 text). | The process apparatus (6 plan files, 937-line log, 135 prompts, 5 review reports) is still unowned in one sentence anywhere a reviewer reads first. |

**Total: 82 / 100 now (was 78); ~87 with both videos delivered as scripted (was ~83).**

## 2. Auto-reject checklist

| Tripwire | Verdict | Evidence |
|---|---|---|
| No prompts / blind copy-paste | PASS | 135 files (`find prompts -name '*.md' -not -name README.md -not -path '*/runtime/*'`), verbatim Spanish bodies, English metadata; prompt 56 reverses prompt 52 with a stated reason. |
| BMAD as decoration | PASS | Today's fix ran spec change log + code review inside `spec-1-6`; PRD amended rather than rewritten; sprint-status consistent with git. |
| Over-engineering | PASS | Diff touches `core/`, fixtures, one test, docs; no new dependency or service. |
| Secrets | PASS | `git diff 65c8710..HEAD` adds only run payloads/usage logs; `.env` untracked; gitleaks in CI unchanged. |
| No personal video | **PENDING — fails by default** | `README.md:43-44` "link pending — recorded 2026-08-24"; `REQUIREMENTS.md:32-33` unchecked. |
| Cannot explain what breaks | PASS | `production-breaks.md` B1–B46; three rows now carry "Fixed 2026-08-23" with the measurement path; D29 §3 names what the re-run did not prove. |

## 3. Introduced or left behind today

1. **Fixture row count.** `README.md:96` "six dishes" — the fixture is 7 (`menu-pdf.ts:23`, golden 7 rows); `README.md:103` says "7 of 7 resolved" twelve lines later. Also `DECISIONS.md:641` (D25) "the golden, which has six dishes" — line 638 was amended, 641 was not.
2. **Review-findings arithmetic.** `DECISIONS.md:900` and prompt 56 Outcome §4: "14 findings: 8 patched, 3 deferred". `spec-1-6…:93-104` lists 1 Decision + 8 Patch + 3 Defer = 12; the 9 resolved items are unchecked `[ ]`, the 3 deferred `[x]` — reads as inverted.
3. **"Re-measured" over-claim for B10/B14.** `BUSINESS.md:3` ("fixed 2026-08-23 with B10 and B14, re-measured, reviewed"), `README.md:147-149,196-200`; `measurement-2026-08-23/README.md` last paragraph: "Neither B10 nor B14 had an input to fire on". Only B45 was re-measured (and only via replay + la-parra, since Vox returned all `inferred`). B10/B14 are pinned by the test, not by a measurement.
4. **Stale category table.** `plan/production-breaks.md:66` still says "visual sources pass unverified" and first fix "B45 (declaration marker in T1)" — B45 landed in T6, B10 is fixed (rows 20, 24, 55 say so). Header at `:59` was moved *back* to "2026-08-22" in the consistency pass while the rows now carry 08-23 text.
5. **Ship-readiness left at €2 below the header.** `ship-readiness-2026-08-22.md:3` amends the price; `:201` "at 500 menus the platform pays €1,000… at 50, €100" and A1/A2 (`:208-209`) still compute against €2; A11 (`:217`) "the golden is unaffected" is contradicted by D29 §2. Highlight 70 owns this, the file does not.
6. **Measurement la-parra = 6 rows.** `measurement-2026-08-23/README.md` table shows la-parra 6 rows (18:31, before `9cce65b` added row 7). Correct, but a reviewer matching it to README "7 rows" finds no sentence saying the 7th row postdates the run.
7. **Reading lists disagree.** `README.md:26` ten-minute list: D4, D19, D24, D27, D28. `walkthrough.md:66` close: D4, D24, D25, D28, D29. D29 — today's headline decision — is absent from the README list.
8. **Small script drifts.** `personal.md:28` heading "3 · 1:40" vs table `:10` 1:36. `walkthrough.md:37` "€2 — a quarter of an operator's 15 to 30 minutes": at €30/h that is 13–27%; true only at the 15-min end.
9. **Consistent (checked, no issue):** prompt count 135 (README:19, recording.md command, file count); €0.50 in BUSINESS, D29, plan/05, both scripts; €2 appears only as history (D28, index, highlights). Arithmetic in BUSINESS (8×, 10–20%, 40–80%, 5×) holds.
10. **Carried over, not addressed:** spec-1-8 old-guard lines, spine `/history`/FR20, web `strict`, no retrospective — all named in the previous review's fix list.

## 4. Last-mile fixes (impact ÷ effort, each ≤ 30 min, docs only)

1. **README/D25 row count + reading list** (10 min): `README.md:96` six → seven; `DECISIONS.md:641` "six" → "seven"; add D29 (and D25) to `README.md:26`. The first thing a reviewer runs contradicts the README.
2. **Say "tested", not "re-measured", for B10/B14** (10 min): `BUSINESS.md:3`, `README.md:147-149,196-200` → "B45 re-measured; B10 and B14 pinned in the one test". Removes the only over-claim a reviewer can disprove from the repo's own file.
3. **Reconcile the review-findings count and checkboxes** (10 min): `spec-1-6…:93-104` tick the 9 resolved items (or state the convention in one line); D29 §2 and prompt 56 §4 "14/8/3" → the real 12/9/3 (or add the two missing items).
4. **`production-breaks.md` category row + header date** (10 min): `:66` drop "visual sources pass unverified", first fix → "B45 (done, T6), B42, B28"; `:59` date → 2026-08-23.
5. **Ship-readiness amendment lines** (15 min): one sentence under `:3` that §5 volume math and A1/A2/A11 are as of 08-22 and superseded by D29 §1–2; fix `personal.md:28` to 1:36.

Skip: renumbering prompts, retrospective, `strict` on web — not ≤30 min and not what moves the score before the videos. The two videos remain the only item that changes the auto-reject column.