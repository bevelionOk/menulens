# How We Read the Brief — Interpretation & Recommendations

Companion to the pinned verbatim sources: [BRIEF.md](BRIEF.md) (challenge) and
[JOB.md](JOB.md) (role). The operational checklist distilled from them is
[/REQUIREMENTS.md](../../REQUIREMENTS.md). This file records *interpretation* — what the
wording signals, and how we chose to respond. If upstream changes (they answer candidate
questions publicly), we diff against the pinned copy and update all three layers.

## Document layers (why three files)

1. **BRIEF/JOB (verbatim, pinned)** — source of truth; never edited.
2. **This file** — how we read it; judgment calls in interpreting ambiguity.
3. **REQUIREMENTS.md** — the checklist consulted before every task.

## What the wording signals → our response

| The brief says | What we read into it | Our response |
|---|---|---|
| "how you think, how you use BMAD, how you write prompts — **not how many hours you can burn**" | Process legibility outweighs feature count; restraint counts | Guardrails in REQUIREMENTS §4; cuts documented in DECISIONS.md |
| "The task is **deliberately unrelated** to our actual product" | Domain research earns nothing; what is tested is how decisions get made | No restaurant-industry deep dives; persona kept minimal but load-bearing (playbook §2) |
| "exactly **one** meaningful automated test … **justify the choice**" | A trap in both directions: zero tests fails, a suite fails too; the *justification* is the deliverable | Single integration/golden-master test; justification in DECISIONS.md (position in implementation playbook §2–3) |
| "confidence flag per row — **your choice how to derive it**" | An intentionally open design question; they want to watch us close it | D4 in DECISIONS.md: opened with evidence (smoke test), closes in the PRD session |
| "prompts … organized so a reviewer can **follow the thought sequence**" | Sequence > volume; parallel prompt floods would be illegible | D1 (verbatim log, phase folders) + D2 (multi-agent kept out of the critical path) |
| "BMAD used as **decoration** only" (auto-reject) | They will check artifacts constrain each other and decisions actually happened in-session | Playbook golden rule: traceability brief → PRD → arch → stories → code; R-07 contingency |
| "**Over-engineered** (microservices, k8s, event bus) for this slice" | The named list is exemplary, not exhaustive — queues, auth, heavy tooling qualify too | REQUIREMENTS §4 extends the list explicitly |
| "what would **break in production**" (auto-reject if unanswerable) | They expect a failure analysis, not assurances | Phase 4.4 produces the failure-modes list; it anchors the walkthrough video |
| "Effort is your call" + weekly-sync/async JOB culture | The submission's shape shows self-management | Dated plan with exit criteria, review gates, documented deadline policy (D8) |
| Rubric names **Zod**; JOB stack lists TanStack Query, Playwright, Pino | The rubric reflects their stack; align with it | Zod at all boundaries; TanStack Query in the frontend (REQUIREMENTS §5) |
| "We answer **publicly** so all candidates see the same information" | Questions are safe but shared; asking reveals our angle to competitors | Ask only if genuinely blocking (R-12); otherwise decide and document the assumption |
| "**open competition**: anyone can submit" | Competitors can see public work before the deadline | D5: repo private until submission |
| Personal video listed in auto-reject | Easy to lose by leaving it to the last day | Phase 5 scheduled Aug 24 with practice take, not deadline night |
| "up to EUR 60k/year … 20–40 h/week, mistakes have real financial consequences" (JOB) | They price correctness ownership, not raw output | BUSINESS.md risk framing (allergen liability); correctness-first implementation choices |

## Ambiguities we resolved by judgment (not asked upstream)

- **"Public restaurant menu URL"** — we read it as *fetchable without JS execution being
  guaranteed*; JS-rendered sites are a documented limitation, not a headless-browser
  requirement (guardrail vs over-engineering; production-gap material).
- **"Results are persisted … and shown"** — we read persistence as *user-visible*
  (a history list), not merely a DB write; kept minimal.
- **"Clean UI"** — tidy and obvious with stock shadcn/ui, not designed; visual novelty
  earns nothing in the rubric.
- **PDF scope** — text-layer PDFs supported; scanned PDFs redirected to the image/vision
  path (avoids native deps that would endanger the <5-min README). Documented limitation.

Each of these becomes final only when the corresponding BMAD session ratifies it
(artifacts win over this file — see playbook).
