# 2026-08-22 — 58 — The personal-video script, beats 0–5

- **Date**: 2026-08-22
- **Tool**: Claude Code (text drafted by Pablo with his own agent, outside this repo's sessions)
- **Model**: Claude Fable 5
- **Phase**: 08-submission (Phase 5, videos)
- **Intent**: Answer the eight questions of `plan/video-scripts/personal.md` as a finished script rather than as answers.
- **In English**: The message is the script itself, in English: name and place, background (Decentralise e.V. 2023–2025, Bevelion since 2025, the 405 and the timeout stories), how he works (D2, D10, D24, D26, the four questions), why this role (the reviewer line in the listing), fit (20–30 h/week from September, CET, freelancer in Spain), close.

## Prompt

```text
Personal video — script (target 3:45, stop at 4:30)
#	Beat	Starts	Length
0	Name, place, what I do now	0:00	0:15
1	Background	0:15	0:55
2	How I work — from this repo	1:10	0:55
3	Why this role	2:05	0:45
4	Why a fit	2:50	0:40
5	Close	3:30	0:15

0 · 0:00

I'm Pablo Javier. I live between Barcelona and Dresden, on Central European Time. Since January 2025 I have been building Bevelion, a white-label operating system for service studios in Europe — I am its founder and its only engineer.

1 · 0:15

Before software, project management: Decentralise e.V. in Liechtenstein, a blockchain education association, 2023 to 2025 — three hundred members, the Cryptobus and its podcasts, the CryptoVille festival. I started writing software in January 2025, when the models could. Bevelion began as an idea for freelancers drafted with Gemini and Grok; from September 2025 it was built with Roo Code and a local Qwen — those rules are still in the repository; Claude Code since July 2026; parallel agents since August 13th. Today: 30 Rust crates, 71 migrations on Postgres, 203 merged pull requests, 57 of them in August. A mistake there costs money. On August 12th I found every video generation was being queued, paid for and thrown away — the provider returned 405 after charging, and "completed" meant finished, not succeeded. Bevelion also taught me that timeouts are treacherous: a ten-minute test timeout fired on every cold compile and read as failing tests. That is why this app has one timeout and derives everything else at read time.

2 · 1:10

How I work is in the repository. On day one I had a multi-agent setup ready and kept it out of the build: BMAD single-threaded, my own orchestration reserved for one review at the end — D2, used once, on the 22nd. On the 20th I retracted my own target, under a minute per menu, to about three — D10. On the 22nd, six stories in, I stopped and measured my own plan: two stories deleted, eleven acceptance criteria cut, in writing, two days before the deadline — D24. When a reviewer showed that a CI guard did not check what I had written it checked, I replaced the guard so that the sentence became true — D26. Every session closed with the same four questions I have asked before every action in Bevelion since August 9th: what did I consider that I should have; what did I consider that I should not have; what did I miss; what did I rightly leave alone. The answers are in the prompt log, with the misses.

3 · 2:05

I applied because of one line in the listing: a seasoned engineer who owns the product vision and reviews your PRs. In Bevelion I am the only human — agents review agents, and I sign the decisions. What that repository cannot give me is a reviewer who knows the business and reads my pull requests. The rest of the listing is how I already work: a live product in an established industry, mistakes that cost money, build, explain in writing, get reviewed, ship. This repository was made that way: 23 pull requests, each reviewed before merge, and a decision log written as the decisions happened. What I am not looking for: standups, tickets, or someone to decide for me.

4 · 2:50

Twenty to thirty hours a week to start, from September, as a freelancer registered in Spain — more later if it suits both sides. Central European Time, Barcelona and Dresden: full overlap with a reviewer in Europe. English is my working language in writing. One weekly call is enough; more when the work asks for it. First weeks: read the codebase, take one feature from brief to PR through BMAD, and put what breaks in production in writing before the weekly sync.

5 · 3:30

The work is at github.com/bevelionOk/menulens; the walkthrough is the second video. pablo@bevelion.com.
```

## Outcome

Text placed verbatim in `plan/video-scripts/personal.md`, beats 0–5; the questionnaire
removed. Measured at 150 wpm: 595 words ≈ 4:05 (beat 1 1:10, beat 2 1:10, beat 3 0:50,
beat 4 0:35); the table re-timed, stop line moved to 4:45, the brief's cap is 5:00. Prose
lens findings returned as proposals, none applied to Pablo's sentences: the unverifiable
"those rules are still in the repository", the antecedent in "when the models could", the
pull-request count to recount before recording (24 at the time of writing, PR #24 open).
The prompts Pablo used with his own agent to draft this text are not in this log yet (R11
— every prompt to any LLM); he was asked to paste them as entry 59. Next prompt 59 (or 60
if 59 is that paste).
