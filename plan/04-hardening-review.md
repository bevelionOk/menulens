# Phase 4 — Hardening & Adversarial Review (Aug 23–24)

**Goal**: find what's wrong before the reviewer does, and produce the
"what breaks in production" material (an auto-reject if we can't answer it).

| # | Task | Owner | Notes |
|---|---|---|---|
| 4.1 | **Multi-agent adversarial review pass** — the one place our own orchestration is used (per D2): parallel reviewers over correctness / security / stack idiomatic-ness, findings verified before acting | Claude | All agent prompts logged in `prompts/05-review-hardening/`, labeled as the multi-agent pass |
| 4.2 | Fix confirmed findings (each fix = normal commit) | Claude | No speculative refactors |
| 4.3 | Hostile-input sweep with the test-menu set: non-menu URL, huge PDF, blurry photo, menu with no prices, non-English menu | Both | Observed behavior → 4.4 |
| 4.4 | Write **production-failure-modes** section in DECISIONS.md: LLM hallucination of allergens, URL fetch fragility (JS-rendered sites, blocking), OpenAI outage/rate limits/cost spikes, oversized uploads, prompt-injection via menu content | Claude | This is the walkthrough-video backbone |
| 4.5 | Fresh-clone test: clean checkout → follow README only → running app, timed **< 5 min** | Pablo | Pablo does it without Claude's help — honest test |
| 4.6 | Secret scan over working tree + full git history | Claude | Must be empty by construction (D-gitignore), verify anyway |
| 4.7 | Prompt-log audit: sequence readable start to finish; outcomes filled in; optional English summaries if we judge they help the reviewer | Both | Reviewer-eye pass |

**Exit criteria**: review findings closed or consciously deferred (documented);
README fresh-clone test passes; failure-modes list written; repo clean.
