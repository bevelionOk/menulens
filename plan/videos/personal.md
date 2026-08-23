# Personal video — script (3–5 min; target 3:30, stop at 4:30)

Brief: *who you are, why you want this role, why you're a fit*. Language: English (D7). Webcam only, nothing on screen except the repo URL and the address at the close. Lines are anchors, not a teleprompter (R-09). Tone: [recording.md](recording.md). Phase plan: [../05-communication-videos.md](../05-communication-videos.md).

| # | Beat | Words | Starts | Length |
|---|---|---|---|---|
| 0 | Name, place, what I do now | 39 | 0:00 | 0:16 |
| 1 | Background | 147 | 0:16 | 0:59 |
| 2 | Why this role | 55 | 1:14 | 0:22 |
| 3 | How I work — from this repo | 175 | 1:36 | 1:10 |
| 4 | Why a fit | 65 | 2:47 | 0:26 |
| 5 | Close | 12 | 3:13 | 0:05 |

Spoken total ≈ 493 words ≈ 3:17 at 150 wpm.

## 0 · 0:00

I'm Pablo Javier. I live between Barcelona and Dresden, on Central European Time. Since January 2025 I have been building Bevelion, a white-label operating system for service studios in Europe. I founded it and I am its only engineer.

## 1 · 0:16

Before software, I ran projects at Decentralise in Liechtenstein, a blockchain education association, 2023 to 2025, three hundred members. I started writing software in January 2025. Bevelion began as an idea for freelancers and became an operating system for service studios. I have built it with agents since September 2025, in parallel since August 13th. Today it is 36 Rust crates and 203 merged pull requests, 57 of them in August. Studios feed it text, photos and clips, and it produces reels for their social channels. A mistake in Bevelion costs money. On August 12th I found every video generation was being queued, paid for and thrown away. The provider charged, then rejected the request. I fixed it the same day: one queue client instead of six copies, the provider's own tracking URLs, and a job counts as completed only when the fetched result carries the file.

## 2 · 1:14

I applied because of one line in the listing: a seasoned engineer who owns the product vision and reviews the PRs. In Bevelion I am the only human. Agents review agents, and I sign the decisions. What Bevelion cannot give me is a reviewer who knows the business and reads my pull requests.

## 3 · 1:36

How I work is in this repository. On day one I had a multi-agent setup ready and kept it out of the build. BMAD ran single-threaded. My own orchestration ran for the two reviews, on the 22nd and the 23rd; once, inside a build session, it ran in parallel and the agents collided — that is in the log too. *(D2, D27, D29; prompt 42)* On the 20th I retracted my own target, from under a minute per menu to about three minutes. *(D10)* On the 22nd, six stories in, I measured my own plan and cut two stories and eleven acceptance criteria, three days before the deadline. *(D24)* A reviewer showed that a CI guard did not check what I had written it checked. I replaced the guard so the sentence became true. *(D26)* Each of those is a numbered entry in the decision log. Four build sessions and the phase close ended with the same four questions I have asked in Bevelion since August 9th: what did I consider that I should have, what did I consider that I should not have, what did I miss, what did I rightly leave alone. The answers are in the prompt log, misses included.

## 4 · 2:47

Twenty to thirty hours a week from September, as a freelancer registered in Spain. More later if both sides want it. Full overlap with a reviewer in Europe. I work in English. One weekly call is enough. More when needed. First weeks: read the codebase, take one feature from brief to PR through BMAD, and write down what breaks in production before the weekly sync.

## 5 · 3:13

The work is at github.com/bevelionOk/menulens. The walkthrough is the second video. pablo@bevelion.com. *(both on screen as text)*

## Fact sheet

| Said | Value | Source |
|---|---|---|
| Bevelion | white-label operating system for service studios; founded January 2025; one engineer | Pablo |
| Decentralise, Liechtenstein, 2023–2025, 300 members | | Pablo |
| Built with agents since September 2025; in parallel since August 13th | first commit 2025-09-02; agent config in the repo | Bevelion repository, checked 2026-08-22 |
| 36 Rust crates; 203 merged pull requests, 57 in August | workspace members; `gh pr list --state merged` | Bevelion repository, checked 2026-08-22 |
| August 12th: one queue client instead of six copies | commit of 2026-08-12 | Bevelion repository |
| Multi-agent setup kept out of the build; used for the reviews of 22 and 23 August | D2, D27, D29 | `DECISIONS.md` |
| Target retracted, under a minute → about three minutes, 20 August | D10 | `DECISIONS.md` |
| Two stories and eleven acceptance criteria cut, 22 August | D24 | `DECISIONS.md`; `README.md` *Scope* |
| CI guard replaced after review | D26 | `DECISIONS.md` |
| Four close-out questions | session-close audits | `prompts/02-bmad-analysis/2026-08-20-07`, `…/2026-08-21-15`, `03-bmad-architecture/2026-08-21-10`, `06-implementation/2026-08-21-03`, `…-08`, `…/2026-08-22-14`, `…-33`, `…-43` |
