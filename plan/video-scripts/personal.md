# Personal video — script (3–5 min; target 4:05, stop at 4:45)

The brief: *who you are, why you want this role, why you're a fit*. The listing, for what
"fit" means to them: business outcomes as the KPI; ownership of correctness where mistakes
have financial consequences; production features shipped with BMAD, not tutorials; crisp
writing, trade-offs; no daily standups, no detailed tickets, no pairing to decide; one
weekly sync, otherwise autonomous; 20–40 h/week, remote, English.

Text by Pablo, 2026-08-22 (prompt 58). Spoken text 595 words ≈ 4:05 at 150 wpm.
Frame: webcam only, eye level; a card with the beat names and the numbers of beat 2 in
hand; two takes at most. Recording setup: [README.md](README.md).

| # | Beat | Starts | Length |
|---|---|---|---|
| 0 | Name, place, what I do now | 0:00 | 0:15 |
| 1 | Background | 0:15 | 1:10 |
| 2 | How I work — from this repo | 1:25 | 1:10 |
| 3 | Why this role | 2:35 | 0:50 |
| 4 | Why a fit | 3:25 | 0:35 |
| 5 | Close | 4:00 | 0:05 |

---

## 0 · Name, place, what I do now — 0:00

> I'm Pablo Javier. I live between Barcelona and Dresden, on Central European Time.
> Since January 2025 I have been building Bevelion, a white-label operating system for
> service studios in Europe — I am its founder and its only engineer.

---

## 1 · Background — 0:15

> Before software, project management: Decentralise e.V. in Liechtenstein, a blockchain
> education association, 2023 to 2025 — three hundred members, the Cryptobus and its
> podcasts, the CryptoVille festival. I started writing software in January 2025, when
> the models could. Bevelion began as an idea for freelancers drafted with Gemini and
> Grok; from September 2025 it was built with Roo Code and a local Qwen — those rules
> are still in the repository; Claude Code since July 2026; parallel agents since August
> 13th. Today: 30 Rust crates, 71 migrations on Postgres, 203 merged pull requests, 57
> of them in August. A mistake there costs money. On August 12th I found every video
> generation was being queued, paid for and thrown away — the provider returned 405
> after charging, and "completed" meant finished, not succeeded. Bevelion also taught me
> that timeouts are treacherous: a ten-minute test timeout fired on every cold compile
> and read as failing tests. That is why this app has one timeout and derives everything
> else at read time.

---

## 2 · How I work — from this repo — 1:25

> How I work is in the repository. On day one I had a multi-agent setup ready and kept
> it out of the build: BMAD single-threaded, my own orchestration reserved for one
> review at the end — D2, used once, on the 22nd. On the 20th I retracted my own target,
> under a minute per menu, to about three — D10. On the 22nd, six stories in, I stopped
> and measured my own plan: two stories deleted, eleven acceptance criteria cut, in
> writing, two days before the deadline — D24. When a reviewer showed that a CI guard
> did not check what I had written it checked, I replaced the guard so that the sentence
> became true — D26. Every session closed with the same four questions I have asked
> before every action in Bevelion since August 9th: what did I consider that I should
> have; what did I consider that I should not have; what did I miss; what did I rightly
> leave alone. The answers are in the prompt log, with the misses.

---

## 3 · Why this role — 2:35

> I applied because of one line in the listing: a seasoned engineer who owns the product
> vision and reviews your PRs. In Bevelion I am the only human — agents review agents,
> and I sign the decisions. What that repository cannot give me is a reviewer who knows
> the business and reads my pull requests. The rest of the listing is how I already
> work: a live product in an established industry, mistakes that cost money, build,
> explain in writing, get reviewed, ship. This repository was made that way: 23 pull
> requests, each reviewed before merge, and a decision log written as the decisions
> happened. What I am not looking for: standups, tickets, or someone to decide for me.

**Recount before recording:** the pull-request count (`gh pr list --state merged --limit 100 | wc -l`).

---

## 4 · Why a fit — 3:25

> Twenty to thirty hours a week to start, from September, as a freelancer registered in
> Spain — more later if it suits both sides. Central European Time, Barcelona and
> Dresden: full overlap with a reviewer in Europe. English is my working language in
> writing. One weekly call is enough; more when the work asks for it. First weeks: read
> the codebase, take one feature from brief to PR through BMAD, and put what breaks in
> production in writing before the weekly sync.

---

## 5 · Close — 4:00

> The work is at github.com/bevelionOk/menulens; the walkthrough is the second video.
> pablo@bevelion.com.

---

## Evidence map — claims the listing asks for, and where the proof is

Pointers for beats 2–4; never read aloud as a list.

| The listing says | Evidence in the repo |
|---|---|
| Business outcomes as the KPI | `BUSINESS.md`: measured cost, a price, three ship-it conditions; D28 |
| Ownership of correctness, financial consequences | D4 (the red pixel), T1–T6, B45 measured and registered instead of hidden; the brief's claim retracted by a dated amendment |
| Production features with BMAD, not tutorials | brief → PRD → architecture → epics → 8 specs → code, with the reviewer reports committed; D15, D18 |
| Crisp writing, trade-offs | D24, D25, D26; `README.md` |
| No standups, no tickets, decides alone | D8 deadline policy; D24 cut; prompt log shows the decisions and who made them |
| Weekly sync, async | every change went through a PR with a written explanation |

## Do not say

"passionate", "journey", "thrive", "leverage", "fast learner", "team player",
"results-driven", "excited", "humbled", "I believe", "I'm confident that", "as you can
see". No adjective about oneself; a fact with a date instead.
