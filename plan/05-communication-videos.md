# Phase 5 — Communication: The Two Videos (Aug 24)

**Goal**: both required videos recorded, uploaded, and linked. The personal video is an
**auto-reject if missing** — this phase cannot slip past Aug 24.

## Setup (once, ~15 min)

| Task | Owner |
|---|---|
| OBS scene: screen capture + webcam bubble (bottom-right) + mic check, 1080p | Both (Claude guides, 3 steps) |
| Test clip: 30 s, verify audio levels and framing | Pablo |
| Choose host: YouTube unlisted (no length cap) or Drive share link — verify link opens in incognito | Pablo |

## Video 1 — Personal (3–5 min)

| Task | Owner |
|---|---|
| Outline (bullets, not script): who I am → relevant background → why this role (async, ownership, BMAD/AI-heavy) → why I fit (evidence, not adjectives) | Pablo drafts, Claude reviews |
| One practice take, one real take. Language: English (role is written/async English) | Pablo |

## Video 2 — Walkthrough (5–10 min)

Backbone comes from Phase 4 outputs. Suggested structure (~90 s each):

1. Live demo: URL → results table; then a PDF/photo, pointing at confidence badges
2. What I built and why: architecture in one diagram, key trade-offs (from DECISIONS.md)
3. How BMAD drove it: brief → PRD → architecture → stories → build (show artifacts)
4. What was cut and why (the guardrails working)
5. **What breaks in production**: the failure-modes list (4.4) — hallucinated allergens,
   fragile URL fetching, provider limits, hostile inputs
6. What comes next if this shipped for real
7. **Business, ~45 s** (JOB.md asks for "business risk" in this video): the BUSINESS.md
   numbers, said once — $0.0069 measured for a 34-dish menu, €2 per menu with an input
   cap, the platform as customer; 38 of 38 rows to review on real menus (B42) and the 6
   false `reliable` rows the measurement found (B45); the three-tier ship-it answer
   (internal after three fixes in hours; paid after two to three weeks and a measured
   review time; unreviewed never). Same numbers as the paragraph — no new ones on camera.

| Task | Owner |
|---|---|
| Assemble demo path with the test-menu set (happy + one hostile case) | Claude |
| Record (max 2 takes — authentic beats polished) | Pablo |
| Upload both, links into README + submission page | Both |

**Exit criteria**: two links, playable in incognito, within time limits; linked from README.
