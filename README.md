# MenuLens

Paste a public restaurant menu URL — or upload a menu PDF or photo — and get a structured
list of dishes: name, price, allergens, a one-line description, and a confidence flag on
every row. Results are persisted to Postgres and shown in the UI.

The model is treated as a **witness, not a judge**. It reports what it saw and quotes the
menu text it saw it in; deterministic code verifies those quotes against the source and
marks each row `reliable` or `uncertain`, naming the rule that fired. A row is `reliable`
only when no rule fired.

## Quick start

Requirements: **Node ≥ 22.13**, **Docker** (for Postgres), and an **OpenAI API key**.

```bash
git clone <repo-url> && cd full-stack-challenge
```

```bash
cp .env.example .env
```

```bash
nano .env
```

Replace `sk-...` on the first line with your OpenAI key, then save (`Ctrl-O`, `Enter`,
`Ctrl-X`). Any editor works — `open -e .env` on macOS, `code .env` with VS Code. Leave the
rest: `DATABASE_URL` already matches the bundled `docker-compose.yml`, and everything else
has a working default.

```bash
docker compose up -d --wait
```

```bash
npm install
```

```bash
npm run -w server db:migrate
```

```bash
npm run dev
```

The API listens on **http://localhost:3000** and the UI on **http://localhost:5173** (Vite
proxies `/api` to the server).

To try it without hunting for a menu, generate the sample one and upload it in the UI:

```bash
npx tsx server/scripts/sample-menu.ts
```

It writes `la-parra.pdf` into the folder you ran it from — the repo root. In the UI,
choose *upload* and pick it from there (`open -R la-parra.pdf` reveals it in Finder). It is
the same PDF the test uploads: six dishes, two come back `reliable`, four `uncertain` with
the rule named under each row.

What to try on the result: confirm a `reliable` row, mark an `uncertain` one as follow-up
with a note, then go back to `/` — the run in the recent list shows how many rows are
resolved. The extracted columns never change; a review is a verdict, not an edit.

A public URL that also works: `https://vox-restaurant.de/wp-content/uploads/2026/07/Vox-Speisekarte-Englisch-1.pdf`
(34 dishes, every row `uncertain` — see B42 under *What breaks in production*).

**Port already in use?** Postgres is the usual clash. Change the host port in
`docker-compose.yml` and the port in `DATABASE_URL` to match. For the API, set `PORT` in
`.env` and change the proxy target in `web/vite.config.ts` to the same port — Vite does not
read `.env`.

## Scope

Planned with BMAD: a PRD with 36 requirements and 84 acceptance criteria, broken into
three epics and 13 stories (8 + 4 + 1). After the first six stories I measured what each
had cost and cut scope ([`DECISIONS.md`](DECISIONS.md), **D24**): 1.7, 2.1 and 2.2 merged
into one deliverable, 2.3 and 2.4 deleted, 3.1 folded into the submit page, the test
surface capped at one test. 11 stories delivered, 2 cut; 73 of the 84 acceptance criteria
shipped, the 11 deleted ones stay in the PRD, marked as cut.

| Area | Status |
|---|---|
| Run lifecycle, persistence, failure states | **Shipped** |
| Source acquisition — URL fetch with an SSRF guard, PDF text layer, `text`/`visual` classification | **Shipped** |
| Extraction — one model call behind a seam, one retry on invalid output, one timeout | **Shipped** |
| The triage arbiter — six rules, evidence verification, persisted match offsets | **Shipped** |
| Submit, watch, review — the UI and the review endpoint | **Shipped** |
| Recent runs on the submit page | **Shipped** |
| The one automated test + CI | **Shipped** |
| Batch review, reopen, per-row notes (story 2.3) | **Cut — D24** |
| The evidence panel with source-vs-extraction highlighting (story 2.4) | **Cut — D24** |

### Next, in order

1. The review actions cut from story 2.3: batch confirm, reopen, per-row notes.
2. The evidence panel. Story 1.6 already persists the character offsets of every verified
   quote, so highlighting the source needs no re-matching.
3. `_bmad-output/implementation-artifacts/deferred-work.md`, in that file's order.

### Known limitations

- **A confirmed row cannot be reopened from the UI.** The review endpoint accepts `reopen`;
  the button belonged to story 2.3. Undoing a verdict is a request, not a click.
- **The recent-runs list is unpaginated.** It grows without bound.
- **Evidence quotes are shown, not highlighted in the source.** The offsets are persisted;
  the panel that would use them is story 2.4.
- **Image and JS-rendered menus behind a URL come back `empty`.** Upload the menu as a PDF
  or a photo instead.

## What breaks in production

The register is [`plan/production-breaks.md`](plan/production-breaks.md): 43 failure modes,
each with why it was accepted or what the first fix would be. The summary, and the
hostile-input sweep that checked it, is **D27**. By kind:

| Category | Entries | What fails |
|---|---|---|
| Reaching the menu — URL fetch, SSRF, JS/image sites | 6 | JS or image menus come back `empty`; residual SSRF ranges; redirect stalls |
| The model call — availability, cost, drift | 9 | A 429 fails the run; no char cap on billed text; no PDF page/time budget; SDK pinned to one version |
| What the arbiter cannot see | 9 | Every row is `uncertain` on a menu that declares no allergens in prose; visual sources pass unverified; hidden HTML text verifies |
| Lifecycle and clocks | 8 | Non-atomic seriality gate; two timeouts that can disagree; DB and Node clocks on one anchor |
| One process, no bounds | 2 | Unpaginated list; unbounded strings |
| Copy and contract drift | 7 | The screen says something other than what the server did |
| Trust boundary | 2 | No auth on any route; CI actions pinned by tag |

The ones I would fix first:

- **DNS rebinding (B2).** The SSRF guard validates the resolved address, then Node's `fetch`
  resolves again; a hostile host can answer with a private IP on the second lookup. Fix: a
  pinned-address dispatcher.
- **Every row is `uncertain` on a menu without allergen prose (B42).** Measured on two real
  menus: 38 of 38 rows. `reliable` needs a menu that declares allergens in text. Fix: read
  icon legends and letter-code keys, or make "no allergens stated" a run-level fact.
- **Hidden HTML text passes evidence verification (B28).** The arbiter checks that a quoted
  phrase exists in the page text, not that a diner could see it. Fix: drop hidden elements
  in the stripper.
- **No retry on a transient 429 (B6).** A rate limit fails the run and a human resubmits.
- **Visual sources cannot be machine-verified (B10).** With no ground text, an evidence
  quote passes through unverified.
- **`"1.250 €"` parses as 1.25 (B14).** Fix: refuse the value and flag the row.

## How to read this repo

Ten minutes: [`DECISIONS.md`](DECISIONS.md) (D4, D19, D24, D27), the PRD at
`_bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/prd.md`, and
`prompts/06-implementation/`.

| Path | What it is |
|---|---|
| `docs/challenge/` | The brief, pinned verbatim, and how I read it (`INTERPRETATION.md`). |
| `_bmad-output/planning-artifacts/` | PRD, architecture spine, epics, and the review of each. |
| `_bmad-output/implementation-artifacts/` | One spec per story, plus the deferred-work register. |
| `prompts/` | Every prompt I wrote, verbatim, in order, plus the runtime extraction prompt. |
| `plan/` | How I ran the five days. Working notes. |
| `.claude/skills/` | Vendored BMAD v6.11.0. Not my code. |

## The one test

The brief asks for exactly one automated test and a justification of the choice. It is a
golden-master over the whole path:

```bash
npm test
```

It needs no setup beyond the quick start: `docker compose up -d --wait` creates a second
database (`menu_extraction_test`) next to the dev one, and the test applies the committed
migrations to it. It **truncates every row** in the database it runs against, so it refuses
to start against any database whose name does not end in `_test`.

It builds the app with the model seam as its only mock, POSTs a fixture through the real
HTTP surface, polls the run to completion against real Postgres, and compares the payload
to one committed golden. The fixture makes every triage rule T1–T6 fire at least once and
leaves one row `reliable`; each rule is asserted by its id, so a regression names the rule
that stopped firing. Why this test and not another, and the four behaviours it does not
cover, are in **D25**.

CI runs it against a Postgres service container. The step before it checks that the
committed migrations produce the schema the code declares (**D26**).

## Configuration

Every variable except the first two is optional and documented in `.env.example`:

| Variable | Default | What it does |
|---|---|---|
| `OPENAI_API_KEY` | — | Required. The extraction call is the only outbound API call. |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/menu_extraction` | Matches `docker-compose.yml`. |
| `PORT` | `3000` | Fastify listen port. |
| `OPENAI_MODEL` | `gpt-5.6-luna` | Extraction model. |
| `MODEL_TIMEOUT_MS` | `120000` | The single technical timeout. Exceeding it fails the run as `model_timeout` — no retry. |
| `RUN_STALE_AFTER_MS` | `180000` | A `processing` run with no stage change for this long reads as `interrupted`. |
| `SOURCE_MIN_TEXT_CHARS` | `200` | Below this, a source is treated as `visual` (sent as an image) instead of `text`. |

## How it works

```
POST /api/runs ──▶ fetching_source ──▶ extracting ──▶ validating ──▶ saving ──▶ done
                   (SSRF-guarded         (one model     (T1–T6         (dishes +
                    fetch, PDF text,      call, one      arbiter)       terminal
                    class decision)       retry)                        status in one tx)
```

- **Persist first.** The run row exists before any work starts; a crash shows as a state.
- **`text` vs `visual`.** A source with enough extractable text is sent as text; a scan or a
  photo is sent as an image. The class is decided from the source, not guessed by the model.
- **Six triage rules.** T1 allergen provenance, T2 price not unambiguous, T3 non-EUR or mixed
  currency, T4 dish name not traceable in the source, T5 the model's own self-flag, T6 an
  evidence quote that does not verify against the source text. Every fired rule is persisted
  with a human-readable reason.
- **Structured logs.** Fastify's built-in Pino instance: every stage transition, every
  triaged dish (rule ids only, never dish names or quoted text) and every model call with its
  token usage is one JSON line.
- **Nothing derived is stored.** `interrupted`, review progress and done-ness are computed at
  read time from timestamps and rows.

## Project layout

| Path | What lives there |
|---|---|
| `server/src/core` | Pure decision code — no I/O, no database. The arbiter, the normalization chain, the price parser, the SSRF rule. |
| `server/src/pipeline` | The staged pipeline and the one seam that talks to OpenAI. |
| `server/src/db` | Drizzle schema, migrations and repositories. |
| `shared/src` | Zod schemas shared by server and web — one definition of the contract. |
| `web/src` | React + Vite + Tailwind UI. |
| `prompts/` | Every prompt used to build this, logged verbatim, plus the runtime extraction prompt. |
| `docs/`, `plan/`, `_bmad-output/` | The BMAD trail: brief, PRD, architecture, epics, per-story specs. |
| `DECISIONS.md` | Every ratified decision, including what was cut and why. |
