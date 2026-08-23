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

## Pre-recording state — walkthrough
Seed, in order, before pressing record, leave all at `0 of N resolved`: the casalucio URL `https://www.casalucio.es/carta/` (`empty` — the site must still serve the same page; if it does not, say what it returned), the phone photo (Pablo's own file, outside the repo — locate it first; the rows and rules it gives are re-seeded live and may differ from earlier runs, B46: say what the screen shows), `menus/injection.pdf` (3 rows, no PWNED — `menus/` is git-ignored; generate it with the heredoc in `plan/guides/manual-test-guide.md`, *hostile set*). Live on camera: only `la-parra.pdf` (7 rows since 2026-08-23; regenerate it with `npx tsx server/scripts/sample-menu.ts` from the current branch). Open: browser at 125 %; editor ≥ 16 pt on README, DECISIONS D24, production-breaks *By category*, `arbiter.ts`, `golden-master.test.ts`, the luna Vox payload of the 22nd (`measurement-2026-08-22/gpt-5.6-luna--vox.json`), `measurement-2026-08-23/replay-0822-vox.txt` and `compare.txt`, BUSINESS.md, DECISIONS D29; GitHub CI log at `Tests 1 passed (1)` and `[i] No changes detected`. Never show `.env`. Recount prompts: `find prompts -name '*.md' -not -name README.md -not -path '*/runtime/*' | wc -l`.


## Pre-recording state — personal

Nothing on screen. A card with the beat names and the dates is enough; reading a full script on camera shows.

## After recording

1. Export 1080p; upload both as unlisted — titles `MenuLens — walkthrough` and `MenuLens — personal`.
2. Open each link in an incognito window; check length against the brief (5–10, 3–5).
3. Links into `README.md` (top) and the submission page; tick the two video rows in `REQUIREMENTS.md` §2.
