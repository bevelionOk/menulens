# MenuLens

Paste a public restaurant menu URL — or upload a menu PDF or photo — and get a structured
list of dishes: name, price, allergens, a one-line description, and a confidence flag on
every row. Results are persisted to Postgres and shown in the UI.

The flag is the point. An LLM will happily invent an allergen; this app treats the model as
a **witness, not a judge**. The model reports what it saw and quotes the menu text it saw it
in; deterministic code then verifies those quotes against the source and decides whether a
row is `reliable` or `uncertain` — and says which rule fired. A row is `reliable` only when
no rule fired.

## Quick start

Requirements: **Node ≥ 22.13**, **Docker** (for Postgres), and an **OpenAI API key**.

```bash
git clone <repo-url> && cd full-stack-challenge
```

```bash
cp .env.example .env
```

Put your key in `.env` (`OPENAI_API_KEY=sk-…`). The default `DATABASE_URL` already matches
the bundled `docker-compose.yml`; everything else has a working default.

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
proxies `/api` to the server). Open the UI and paste a menu URL.

**Port already in use?** Postgres is the usual clash. Change the host port in
`docker-compose.yml` and the port in `DATABASE_URL` to match. For the API, set `PORT` in
`.env` and change the proxy target in `web/vite.config.ts` to the same port — Vite does not
read `.env`.

## What's built, what I cut, and why

I wrote a full PRD — 36 requirements, 84 acceptance criteria — before writing code, because
that is what BMAD is for and because deciding on paper is cheaper than deciding in
TypeScript. Then I built six stories and measured what they cost: two of them produced more
lines of specification than of code. On 22 August I stopped and cut.

| Area | Status |
|---|---|
| Run lifecycle, persistence, honest failure states | **Shipped** |
| Source acquisition — URL fetch with an SSRF guard, PDF text layer, `text`/`visual` class decision | **Shipped** |
| Extraction — one model call behind a seam, one retry, one timeout | **Shipped** |
| The triage arbiter — six rules, evidence verification, persisted match offsets | **Shipped** |
| Submit, watch, review — the UI and the review endpoint | **Shipped** |
| Recent runs on the submit page | **Shipped** |
| The one automated test + CI | **Shipped** |
| Batch review, reopen, per-row notes (story 2.3) | **Cut — D24** |
| The evidence panel with source-vs-extraction highlighting (story 2.4) | **Cut — D24** |

Of the 84 acceptance criteria: **73 shipped, 11 deleted in writing on 22 August.** The
decision lives in [`DECISIONS.md`](DECISIONS.md) as **D24**.

### Why there are more requirements than features

Stories 2.3 and 2.4 are deleted, not deferred-in-spirit: FR20, FR23, FR26 and FR27's reopen
affordance will not exist in this submission. The PRD still contains them, annotated as cut,
because deleting the requirement would hide the decision — and the decision is the part worth
reading. I would rather show you a requirement I chose not to build than pretend I never
wanted it.

The correction is dated in the repo, not reconstructed after the fact. My own adversarial
review flagged the requirement mass as HIGH severity on 21 August
(`_bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/review-overengineering.md`). D19 answered it weakly — a
priority ladder that let scope be cut later, which is a plan to decide rather than a
decision. D24 exercised that ladder a day later, before the deadline forced it: eleven
acceptance criteria deleted, three stories merged into one, and the remaining test surface
capped at exactly one test.

### What I would build next, in order

1. The rest of M1 — the review actions are the product's thesis: the app's job is to hand a
   human a shorter, honest list, and her verdict is the deliverable.
2. The evidence panel. Cheap now: story 1.6 already persists the character offsets of every
   verified quote, so highlighting the source needs no re-matching.
3. The items in `_bmad-output/implementation-artifacts/deferred-work.md`, in that file's order.

### Known limitations

- **A confirmed row cannot be reopened from the UI.** The review endpoint accepts `reopen` —
  the action enum is whole on the server — but the affordance belonged to story 2.3, which is
  cut. Undoing a verdict currently means a request, not a click.
- **The recent-runs list is unpaginated.** Fine for one operator; it grows without bound.
- **Evidence quotes are shown, not highlighted in the source.** The offsets are persisted and
  correct; the panel that would use them is story 2.4, cut.

## What breaks in production

The full register is [`plan/production-breaks.md`](plan/production-breaks.md) — 18 named
failure modes collected story by story, each with why it was accepted or what the first fix
would be. The ones I would fix first:

- **DNS rebinding (B2).** The SSRF guard validates the resolved address, then Node's `fetch`
  resolves again — a hostile host can answer with a private IP on the second lookup. The fix
  is a pinned-address dispatcher.
- **No retry on a transient 429 (B6).** "One retry, one timeout" is kept literal, so a rate
  limit fails the run and a human has to resubmit.
- **Visual sources cannot be machine-verified (B10).** With no ground text, an evidence quote
  passes through unverified — the flag is only as honest as the human's visual check.
- **`"1.250 €"` parses as 1.25 (B14).** A single separator is read as a decimal. The honest
  fix is to refuse the value and flag the row, not to guess.

## How to read this repo

If you have ten minutes: [`DECISIONS.md`](DECISIONS.md) (D4, D19, D24),
`_bmad-output/planning-artifacts/prds/prd-full-stack-challenge-2026-08-21/prd.md`, and
`prompts/06-implementation/`.

| Path | What it is |
|---|---|
| `docs/challenge/` | The brief, pinned verbatim, and how I read it (`INTERPRETATION.md`). |
| `_bmad-output/planning-artifacts/` | PRD, architecture spine, epics — and the adversarial reviews that attacked each of them. |
| `_bmad-output/implementation-artifacts/` | One spec per story, plus the deferred-work register. |
| `prompts/` | Every prompt I wrote, verbatim, in order — plus the runtime extraction prompt. |
| `plan/` | How I ran the five days. Working notes, not a deliverable. |
| `.claude/skills/` | Vendored BMAD v6.11.0, so the toolchain is reproducible. Not my code. |

## The one test

The brief asks for exactly one meaningful automated test, and for the choice to be argued.
It is a golden-master over the whole path:

```bash
npm test
```

It needs no setup beyond the quick start above: `docker compose up -d --wait` creates a
second, disposable database (`menu_extraction_test`) alongside the dev one, and the test
applies the committed migrations to it itself. It **truncates every row** in the database it
runs against, so it refuses to start against any database whose name does not end in
`_test` — pointing it at your dev database fails with instructions rather than deleting your
history.

It builds the app with the model seam as its only mock, POSTs a fixture through the real
HTTP surface, polls the run to completion against real Postgres, and compares the payload to
one committed golden. The fixture is crafted so **every triage rule T1–T6 fires at least
once and one row stays fully `reliable`** — and each rule is asserted by its id, so a
regression fails saying *which* rule stopped firing rather than diffing a blob. The
reasoning, and the list of behaviours that stay verified by hand instead, are in
[`DECISIONS.md`](DECISIONS.md) as **D25** — including the four blind spots this single test
cannot see, named rather than left for you to find.

CI runs it against a Postgres service container, and one step before it checks that the
committed migrations actually produce the schema the code declares — a check, not a second
test, argued in **D26**.

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

- **Persist first.** The run row exists before any work starts, so a crash is visible as a
  state, never as a silent loss.
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
