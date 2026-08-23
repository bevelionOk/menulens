# Phase 4 — Hardening & Adversarial Review (Aug 22; planned 23–24)

**Goal**: find what's wrong before the reviewer does, and produce the
"what breaks in production" material (an auto-reject if we can't answer it).

| # | Task | Owner | Notes |
|---|---|---|---|
| 4.1 | **Multi-agent adversarial review pass** — the one place our own orchestration is used (per D2): parallel reviewers over correctness / security / stack idiomatic-ness, findings verified before acting | Claude | In practice this ran per story inside the build loop (three parallel reviewers per diff); those prompts are logged in `prompts/06-implementation/` in sequence. Phase 4 is the whole-repo pass |
| 4.2 | Fix confirmed findings (each fix = normal commit) | Claude | No speculative refactors |
| 4.3 | Hostile-input sweep with the test-menu set: non-menu URL, huge PDF, blurry photo, menu with no prices, non-English menu | Both | Observed behavior → 4.4 |
| 4.4 | Write **production-failure-modes** section in DECISIONS.md: LLM hallucination of allergens, URL fetch fragility (JS-rendered sites, blocking), OpenAI outage/rate limits/cost spikes, oversized uploads, prompt-injection via menu content | Claude | This is the walkthrough-video backbone |
| 4.5 | Fresh-clone test: clean checkout → follow README only → running app, timed **< 5 min** | Pablo | Pablo does it without Claude's help — honest test |
| 4.6 | Secret scan over working tree + full git history | Claude | Must be empty by construction (D-gitignore), verify anyway |
| 4.7 | Prompt-log audit: sequence readable start to finish; outcomes filled in; optional English summaries if we judge they help the reviewer | Both | Reviewer-eye pass |

## Status — 2026-08-22 · **Phase closed**: exit criteria met (findings closed or registered, fresh-clone 3:38 < 5:00, failure modes written in D27, repo clean)

| # | Status |
|---|---|
| 4.1 | **Done** — three parallel reviewers (correctness / security / stack), 29 findings → 19 deduplicated: 4 fixed, 14 registered as B28–B41 (two of the 19 were already in the register). Method and results in D27; prompts in `prompts/07-hardening/` |
| 4.2 | **Done** — commit `466dc29`; the one test and typecheck green |
| 4.3 | **Done** — 18 inputs, results table in D27; the generator for the hostile set is in the manual-test guide |
| 4.4 | **Done** — D27 "Production failure modes" |
| 4.5 | **Done 2026-08-22** — fresh clone, README only, unaided: first pass **3:00** to the UI open, **3:38** to the sample run `done`; second pass on the corrected README, **3:00 including the sample run**. Four README defects found and fixed on the way (#19 the `.env` edit as a command; #20 where the sample file lands; #21 the clone folder name; PR #22: generate the sample before `npm run dev`). One UI finding, B44. One false start discounted — a leftover test container of mine with the clone's project name |
| 4.6 | **Done** — clean; D27 |
| 4.7 | **Done** — 64 English summaries added; "optional" became mandatory |

**Exit criteria**: review findings closed or consciously deferred (documented);
README fresh-clone test passes; failure-modes list written; repo clean.
