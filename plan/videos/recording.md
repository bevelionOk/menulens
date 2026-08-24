# The two videos — recording setup and spoken tone

Scripts: [walkthrough.md](walkthrough.md) (5–10 min, target 8:15) and [personal.md](personal.md) (3–5 min, target 3:30). Phase plan: [../05-communication-videos.md](../05-communication-videos.md).

## Format

| | Walkthrough | Personal |
|---|---|---|
| Frame | Screen capture 1920×1080, webcam bubble bottom-right | Webcam full frame, eye level, plain background |
| Audio | Same microphone for both; one 30 s test clip, listened back | |
| Language | English (D7) | English (D7) |
| Takes | Max two (plan/05). Re-record one segment only for a wrong number or an overrun | Max two |
| Host | YouTube unlisted (D6); link opened in an incognito window | Same |
| Length | Target 8:15, stop at 9:00 | Target 3:30, stop at 4:30 |

## Spoken tone — REQUIREMENTS §4 applied to speech

- State the fact, the number and the date. Then stop. No sentence that explains why the fact is good.
- No "honestly", "basically", "as you can see", "the beauty of", "at the end of the day", "I'm proud", "robust", "leverage", "passionate", "journey", "excited", "learned that", "it's important to note", "the point is". One phrase from the README — *witness, not a judge* — and no other aphorism.
- Nothing addressed to the evaluator. Not "you will notice"; "the table shows".
- One claim per sentence. A number said is a number visible.
- No lessons. What a viewer concludes is theirs.
- Repo vocabulary — `reliable`, `uncertain`, `declared`, `inferred`, T1–T6 — said as written, pointed at on screen.
- If the app does something other than what the script expects, say what it did; do not stop the take.

## Pre-recording — walkthrough, in order

Each step runnable from the repo root on current `main`. Stop at any ☐ that fails; fix before recording.

1. ☐ `git checkout main && git pull` — the take shows today's state (7-row fixture, D29).
2. ☐ App up, per the README quick start: `docker compose up -d --wait`, `npm install`,
   `npm run -w server db:migrate`, `npm run dev`. Port clash → README *Port already in use?*.
3. ☐ Sample menu (7 rows since 2026-08-23):
   ```bash
   npx tsx server/scripts/sample-menu.ts
   ```
4. ☐ Hostile set (`menus/` is git-ignored, so it must be regenerated): run the *hostile set*
   heredoc from [../guides/manual-test-guide.md](../guides/manual-test-guide.md) — it writes
   `menus/injection.pdf` among others.
5. ☐ Locate the phone photo — Pablo's own file, outside the repo (a printed Italian lunch
   card, ~43 KB). No photo, no photo beat: drop it per the script's "if long" cut.
6. ☐ Seed three runs, in this order, and leave every one at `0 of N resolved`:
   1. URL `https://www.casalucio.es/carta/` → expect `empty` (the site must still serve the
      same page; if not, say on camera what it returned).
   2. The phone photo → rows and rules are whatever this run gives (B46): say what the
      screen shows.
   3. `menus/injection.pdf` → expect 3 rows, no PWNED.
   Live on camera goes only `la-parra.pdf`.
7. ☐ Open, browser at 125 %, editor ≥ 16 pt: README; DECISIONS D24 and D29;
   production-breaks *By category*; `arbiter.ts`; `golden-master.test.ts`;
   `measurement-2026-08-22/gpt-5.6-luna--vox.json` at a `declared` row;
   `measurement-2026-08-23/replay-0822-vox.txt` and `compare.txt`; BUSINESS.md;
   the GitHub CI log at `Tests 1 passed (1)` and `[i] No changes detected`.
8. ☐ Never on screen: `.env`, this scripts folder, the agent harness.
9. ☐ Recount prompts for the §3 line:
   ```bash
   find prompts -name '*.md' -not -name README.md -not -path '*/runtime/*' | wc -l
   ```
10. ☐ Audio: one 30 s test clip, listened back. Then record — max two takes.

## Pre-recording state — personal

Nothing on screen. A card with the beat names and the dates is enough; reading a full script on camera shows.

## After recording

1. Export 1080p; upload as unlisted — title `MenuLens — walkthrough` (personal: done
   2026-08-23, `MenuLens — personal`, https://youtu.be/xOdAmo6ocsA).
2. Open the link in an incognito window; check length against the brief (walkthrough 5–10;
   personal 3–5 ✓).
3. Link into `README.md` *Videos* and the submission page; tick the walkthrough row in
   `REQUIREMENTS.md` §2 (personal row ticked 2026-08-23).
