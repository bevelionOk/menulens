# The two videos — direction and recording setup

Scripts: [walkthrough.md](walkthrough.md) (5–10 min, target 9:00) and [personal.md](personal.md)
(3–5 min, target 4:05). Phase plan: [../05-communication-videos.md](../05-communication-videos.md).

The lines in both scripts are anchors, not a teleprompter (R-09: outlines, not scripts).
Every number spoken is on screen at the moment it is said, and every number has a source
line in the fact sheet at the end of each script. If the app does something other than
what the script expects, say what it did; do not stop the take.

## Format

| | Walkthrough | Personal |
|---|---|---|
| Frame | Screen capture 1920×1080, webcam bubble bottom-right | Webcam full frame, eye level, plain background |
| Audio | Same mic for both; one 30 s test clip, listen back | |
| Language | English (D7) | English (D7) |
| Takes | Max two (plan/05). Re-record one segment only if it went over time or stated a wrong number | Max two |
| Host | YouTube unlisted (D6); link checked in an incognito window | Same |
| Length | Brief: 5–10 min. Target 9:00, stop at 9:30 | Brief: 3–5 min. Target 4:05, stop at 4:45 |

## Spoken tone — REQUIREMENTS §4 applied to speech

- State the fact, the number and the date. Then stop. No sentence that explains why the
  fact is good.
- No "honestly", "basically", "as you can see", "the beauty of", "at the end of the day",
  "I'm proud", "robust", "battle-tested", "leverage", "passionate", "journey", "excited",
  "learned that", "it's important to note", "the point is". One phrase from the README —
  *witness, not a judge* — and no other aphorism.
- Nothing addressed to the evaluator. Not "you will notice"; "the table shows".
- One claim per sentence. A number said is a number visible.
- No lessons. What a viewer concludes is theirs.
- If a word from the repo's own vocabulary is needed — `reliable`, `uncertain`, `declared`,
  `inferred`, T1–T6 — say it as written and point at it.

## Pre-recording state — walkthrough

One live run on camera (`la-parra.pdf`, 9–12 s). Everything else is opened from the
*Recent extractions* list, seeded before recording, one run at a time, in this order:

1. `https://www.casalucio.es/carta/` → `no dishes found` (B40)
2. The Vox PDF by URL → 34 rows, `0 of 34 resolved`. Do not time it on camera (B25: ~25 s
   against the "about 9 to 12 seconds" copy).
3. The phone photo of the Italian lunch card → 4 rows, the `€ 6,00 € 5,70 - 5%` row
4. `menus/injection.pdf` → 3 rows, no `PWNED` (generator: `plan/guides/manual-test-guide.md`)
5. Optional: `menus/no-prices.pdf` → 5 rows, T2 + T5

Leave every seeded run at `0 of N resolved`. The live run is reviewed on camera.

Open before pressing record:

- Browser, zoom 125 %, bookmarks bar hidden, one window: `http://localhost:5173`
- Editor, font ≥ 16: `README.md`, `DECISIONS.md` at D24, `plan/production-breaks.md` at
  *By category*, `server/src/core/arbiter.ts`, `server/test/golden-master.test.ts`,
  `_bmad-output/planning-artifacts/business/measurement-2026-08-22/gpt-5.6-luna--vox.json`
  at the `Lobster bisque` row, `compare.txt` in the same folder, `BUSINESS.md`
- GitHub: the CI run of the last merge, log open at `Tests 1 passed (1)` and
  `[i] No changes detected`; the `_bmad-output/planning-artifacts/` tree
- Terminal, font ≥ 18, prompt cleared. **Never `cat .env` or echo any variable on camera.**
- Notifications off on the laptop and the phone. Other projects' windows closed.

Recount before recording and fix the script if the number moved:

```bash
find prompts -name '*.md' -not -name README.md -not -path '*/runtime/*' | wc -l
```

```bash
gh pr list --state merged --limit 100 | wc -l
```

## Pre-recording state — personal

Nothing on screen. A printed card with the beat names and the numbers of the "how I work"
beat (D2, D10, D24, D26, the four questions) is enough; reading a full script on camera
shows.

## After recording

1. Export 1080p, upload both as unlisted, titles `MenuLens — walkthrough` and
   `Pablo Javier — personal`.
2. Open both links in an incognito window; play 10 s of each.
3. Add a *Videos* section to `README.md` (two lines, two links) and the links to the Notion
   landing page (D9). Tick the two boxes in `REQUIREMENTS.md` §2 and §7.
4. Log the recording session's prompts in `prompts/08-submission/`.

## If a take runs long

Each script names what to drop per segment. The order of sacrifice for the walkthrough:
the photo run (§1), the stack sentence (§2), the second thread (§3), the "ordinary ones"
list (§5). Never drop §5's first three items or §7.
