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

## Configuration

Every variable except the first two is optional and documented in `.env.example`:

| Variable | Default | What it does |
|---|---|---|
| `OPENAI_API_KEY` | — | Required. The extraction call is the only outbound API call. |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/menu_extraction` | Matches `docker-compose.yml`. |
| `PORT` | `3000` | Fastify listen port. |
| `OPENAI_MODEL` | `gpt-5.6-luna` | Extraction model. |
| `MODEL_TIMEOUT_MS` | `120000` | The single technical timeout. One retry, then the run fails honestly. |
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
