**Reviewer report — MenuLens (read-only, ~20 min)**

## Findings that score LOW or oversell

1. **Known false-`reliable` on allergens shipped on purpose.** `plan/production-breaks.md` B45: 6 of 34 rows reach `reliable` on an ingredient word. The fix is specified in `DECISIONS.md:829-835` (D28 §8), estimated "hours", in `core/arbiter.ts` (71 lines), and was not made. The submission's entire thesis is "witness not judge, deterministic gate" (`README.md:7-11`), and the gate has a measured hole the author chose to document rather than close while spending the same day on a 239-line ship-readiness analysis. Prompt 52 records the call ("no he decidido implementar las B45/B10 y B14"). A reviewer will read this as prioritizing paperwork over correctness in a safety path.
2. **Contradiction left in the PRD.** Brief amended (`briefs/.../brief.md:83-87`), but the PRD still asserts "Zero false-reliables on allergens, by construction" at `prd.md:80`. D28 §7 says the retraction was made "the PRD's convention" — it wasn't applied to the PRD.
3. **Prompt log covers only Pablo's chat turns.** 134 files, 177 KB total, avg ~1.3 KB; the prompt bodies are often one line ("Hola vamos a empezar con la implementacion: /bmad-build…", `prompts/06-implementation/2026-08-21-01`). The prompts that did the work — the 8 PRD-finalize subagents (D15), 3 parallel research agents (prompt 28), the 3-reviewer adversarial passes per story — are not in the repo, and `prompts/README.md` does not say so. The brief says "every prompt you fed to any LLM". The "Outcome" sections, which carry the thinking, are assistant-written. Memory notes prompts 56–57 exist and are unlogged "by ruling".
4. **Selective numbers in BUSINESS.md.** "38 of 38 uncertain (B42)" and "6 of 34 reliable (B45)" are the same Vox PDF on two runs; the paragraph uses each where it helps the argument (B46 explains why both are true, but the paragraph doesn't say they're the same input). The €2 was fixed by Pablo before the analysis ("el numero 2 euros esta correcto", prompt 52, pre-elicitation) — the 239-line analysis reads as post-hoc justification.
5. **Process weight.** D2 says custom orchestration is "out of the critical path", yet the log shows: a worktree + PR per story, "close ritual", "2x2 audit" after every story (prompts 03, 14, 33, 43), "run all five methods" elicitation three times (02-analysis 05, 02-analysis 04, 03-arch 08), party mode, conclave, "heartbeat-watched" subagents. 143 commits in 3 days for 3,725 lines of app code; ~5,400 lines under `_bmad-output/`, 853 in DECISIONS, ~900 in `plan/`. Docs:code ≈ 3:1. The repo's own `review-overengineering.md` flagged HIGH on day 2 and D24 only acted a day later.
6. **Stack nits.** `routes/runs.ts:66` hand-rolls `safeParse` + manual `new URL()` instead of a Fastify Zod type provider; `dishes.run_id` has no index (`0000_pale_tana_nile.sql`); `status`/`flag`/`review_status` are free `text` with no CHECK/pgEnum; uploads stored as `bytea` in Postgres; pipeline is fire-and-forget in-process (documented, B5). Brief says "JSON mode"; code uses Responses API structured outputs (`zodTextFormat`, `extraction-adapter.ts:53,125`) — justified at `DECISIONS.md:283`, fine, but a pedant notes it.
7. **README quick start** is 9 commands plus `nano` keystroke instructions and a sample-PDF generation step before `npm run dev`. Timed at 3:38 (prompt 47) — under 5 min, but the page is 248 lines and the "two, sometimes three reliable" caveat in the run instructions makes the demo sound flaky at first read.
8. **Secrets**: clean. Only `.env.example` tracked; gitleaks in CI over full history; no `sk-` pattern in tree or history; `.env` ignored.

## Scores (harsh, defensible)

| Row | Weight | Score | Evidence |
|---|---|---|---|
| BMAD fluency | 25 | **19** | Real chain brief→PRD→spine→epics→8 specs→sprint-status, with reconciliation reviews and a course-correction (D16, D24). Deduct: 36-FR PRD for "That's it", ritual elicitation reruns, `review-overengineering.md` ignored for a day. |
| Prompt quality | 20 | **12** | Thought sequence is followable (prompts 06-arch golden-master, 28, 22, 52 are genuinely good). Deduct: subagent/skill prompts absent, bodies thin, outcomes LLM-authored, unlogged prompts 56–57. |
| Stack | 15 | **11** | `core/` is pure and readable; test crosses real boundaries; CI drift guard is smart. Deduct: item 6 above. |
| Critical thinking | 15 | **13** | D24/D25/D27/D28 and 46-entry register are the strongest thing here. Deduct: PRD contradiction; B45 unfixed. |
| Business mindset | 10 | **6** | Cost measured, value admittedly unmeasured, three-tier ship answer. Deduct: price set before analysis; selective 38/38 vs 6/34 framing; "above 99% margin" on $0.0069 is a cost, not a business. |
| Communication (log half) | 5 of 10 | **3.5** | Entries are clear but D21–D23 are build diaries; no TL;DR at the top of 853 lines. Videos must carry: one live run, B45 shown from the committed measurement, the D24 cut, the €2 with its hedges, and a 30-second "why one test". |
| Independent judgment | 5 | **3** | Golden-master counter-proposal and the cut are real. Deduct: choosing to document a 3-hour safety fix rather than make it. |
| **Total** | | **67.5 / 95** (videos pending, +0–5) | |

## Direct answers

**Over-engineered?** Not the app — no queues/workers/auth, 3.7k LOC, 4 routes. The *process* is: worktree+PR per story, three-reviewer adversarial pass per story, 2x2 audits, repeated five-method elicitation, heartbeat-watched subagent fleets, 94 commits on Aug 22. "Judgment, not hours" is undermined by a repo that visibly burned hours on ceremony and then declined a 3-hour correctness fix.

**Docs volume.** Mixed. `production-breaks.md`, D24, D25, D28 are strengths. `_bmad-output/*/reviews/`, `reconcile-*.md` (9 files), `plan/video-highlights.md` (541 lines), `.memlog.md`s, and D21–D23 read as generated exhaust. Cut or move to an appendix: reconcile/review files, memlogs, video-highlights, build-session diaries. Front-load: a 15-line TL;DR at the top of DECISIONS (D4, D16, D24, D25, D28) and a 10-line README opener that says "B45 is open, here's why".

**Is €2 credible?** Partially. Cost side is real; value side is admitted to be unmeasured and the tool currently removes typing, not reading (38/38 review queue). €2 "a quarter of the saving" rests on an unsourced 15–30 min anchor (`ship-readiness.md:206`, marked Low confidence by the author). I'd put **€1 per menu after a 30-day pilot at €0**, with the pilot measuring review minutes; reprice to €2–3 only once `reliable` rows exceed ~30% on real menus (needs B45 + B42's legend reading). Stating a number you've shown you can't defend yet is the weaker move.

## Top 5 fixes (in scope)

1. **Make the three `core/` fixes** — B45 marker rule in `arbiter.ts`/`t6-verify.ts`, B10 no `reliable` on `visual`, B14 refuse three-digit groups in `price.ts`. Re-run the committed `measure.sh` on Vox and commit the payloads. **5–6 h.** Largest score lift: removes the "knew, didn't fix" narrative across three rubric rows.
2. **Amend `prd.md:80`** and add a dated retraction; add a 15-line decision index at the top of DECISIONS.md. **1.5 h.**
3. **Prompt log honesty**: one paragraph in `prompts/README.md` stating what is and isn't logged (subagent prompts, skill-internal prompts, 56–57) and why; drop the 5–6 ceremonial entries ("congratulations", "merged, teardown"). **1.5 h.**
4. **README**: quick start to 6 commands (default `.env` via `sed`, generate sample PDF inside `npm run dev` or ship it in `server/test/fixtures`); move "Scope" table below "How it works"; open with the B45 caveat in two lines. **2 h.**
5. **BUSINESS.md**: say 38/38 and 6/34 are the same PDF on two runs; state the €1/pilot or keep €2 but drop "margin above 99%" as a selling point. **0.5 h.**

Optional, not a rubric mover: second migration adding an index on `dishes.run_id` and CHECK constraints on the enum columns. **1 h.**