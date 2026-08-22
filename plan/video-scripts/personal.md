# Personal video — script (3–5 min; target 3:45, stop at 4:30)

The brief: *who you are, why you want this role, why you're a fit*. The listing, for what
"fit" means to them: business outcomes as the KPI; ownership of correctness where mistakes
have financial consequences; production features shipped with BMAD, not tutorials; crisp
writing, trade-offs; no daily standups, no detailed tickets, no pairing to decide; one
weekly sync, otherwise autonomous; 20–40 h/week, remote, English.

**Status: beats 0, 1, 3 and 4 need Pablo's answers (questionnaire at the end). Beat 2 is
drafted from the repo and stands on its own.** Recording setup: [README.md](README.md).

| # | Beat | Starts | Length | Needs |
|---|---|---|---|---|
| 0 | Name, place, what I do now | 0:00 | 0:15 | Q1, Q2 |
| 1 | Background — two or three facts with dates and numbers | 0:15 | 0:55 | Q3, Q4 |
| 2 | How I work — from this repo | 1:10 | 0:55 | — |
| 3 | Why this role | 2:05 | 0:45 | Q5 |
| 4 | Why a fit — availability, working mode, first weeks | 2:50 | 0:40 | Q6, Q7 |
| 5 | Close | 3:30 | 0:15 | — |

Frame: webcam only, eye level. A card with the beat names and the numbers of beat 2 in
hand. Two takes at most.

---

## 0 · Name, place, what I do now — 0:00

> I'm Pablo Javier, [city, country — Q1]. [One sentence: current role, company, since when
> — Q2.]

---

## 1 · Background — 0:15

Two or three facts. Each one: a system, a date, a number, what a mistake cost. No
adjectives. Shape:

> [Years] years building [kind of systems]. [System 1]: [what it did, for whom, scale —
> Q3]; [what a wrong value cost there]. [System 2]: [same shape]. [Where the multi-agent
> setup comes from and since when — Q4.]

The line about timeouts, if Q3 gives its origin: *"[System] taught me that timeouts are
treacherous; that is why this app has one, and derives everything else at read time."* —
only if the story is real and fits in one sentence.

---

## 2 · How I work — from this repo — 1:10

Drafted from the record; every number is a DECISIONS entry.

> How I work is in the repository. On day one I had a multi-agent setup ready and kept it
> out of the build: BMAD single-threaded, my own orchestration reserved for one review at
> the end — D2, used once, on the 22nd. On the 20th I retracted my own target, under a
> minute per menu, to about three — D10. On the 22nd, six stories in, I stopped and
> measured my own plan: two stories deleted, eleven acceptance criteria cut, in writing,
> two days before the deadline — D24. When a reviewer showed that a CI guard did not check
> what I had written it checked, I replaced the guard so that the sentence became true —
> D26. Every session closed with the same four questions: what did I consider that I
> should have; what did I consider that I should not have; what did I miss; what did I
> rightly leave alone. The answers are in the prompt log, with the misses.

Word count ≈ 150 → 55–60 s at speaking pace. If long, drop the D26 sentence.

---

## 3 · Why this role — 2:05

Pablo's reason, in his words (Q5), then one mapping to the listing. Shape:

> I applied because [the real reason — Q5]. The working mode in the listing — build,
> explain in writing, get reviewed, ship — is how this repository was made: [N] pull
> requests, each reviewed before merge, and a decision log written as the decisions
> happened. [What I am not looking for — Q5, if he wants it said.]

**Recount N** (`gh pr list --state merged --limit 100 | wc -l`) before recording.

---

## 4 · Why a fit — 2:50

> [Hours per week, start date, time zone and overlap — Q6.] [Freelance or remote.com —
> Q6.] English is my working language in writing; [one sentence on spoken English, if
> Q7 wants it addressed — otherwise nothing]. First weeks: read the codebase, take one
> feature from brief to PR through BMAD, and put what breaks in production in writing
> before the weekly sync.

---

## 5 · Close — 3:30

> The work is at [repo URL]; the walkthrough is the second video. pablo@bevelion.com.

---

## Evidence map — claims the listing asks for, and where the proof is

Use in beats 2–4 only as pointers; never as a list read aloud.

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

---

## Questionnaire — what the script needs from Pablo

1. **Name and place.** The name as it should appear, city and country, time zone (to state
   the overlap with a reviewer in Europe).
2. **Today.** Bevelion in one sentence; the role there and since when; team size. Can it be
   named on camera, or should it be described without the name?
3. **Track record.** Total years. Two production systems you were responsible for: what
   they did, for whom, scale (users, transactions, money), stack, and what a mistake cost
   there. If "timeouts are treacherous" (prompt 2026-08-21-03) comes from one concrete
   case, which one.
4. **BMAD and agents.** Since when with Claude Code and BMAD; what the multi-agent
   orchestration is (what it does, since when, what it is used for). Anything in production
   built with BMAD before this challenge? If not, the script says so: this repo is the first.
5. **Why this role, in your own words.** Three unpolished lines. Which line of JOB.md made
   you apply. What you are not looking for, if it should be said.
6. **Availability.** Hours per week, earliest start date, freelance or remote.com.
   Recommendation: no money figures on camera.
7. **English and camera.** How speaking English on camera feels (R-09). One sentence that
   names it, or nothing? Beats on a card, or from memory?
8. **Limits.** Employers, clients or numbers that must not be said.
