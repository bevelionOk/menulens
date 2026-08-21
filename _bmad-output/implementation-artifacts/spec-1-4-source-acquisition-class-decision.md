---
title: 'Story 1.4 — Source Acquisition & Class Decision'
type: 'feature'
created: '2026-08-22'
status: 'done'
review_loop_iteration: 0
baseline_commit: '06949b615b931b5062f5765448354ec21585299b'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A run is born persistent (1.3) but nothing ever moves it: no code fetches the URL, reads the PDF/image, decides whether the source has usable ground text, or records the first real stage — every run ends `interrupted`, and the URL field is still a potential door into the server's network.

**Approach:** Make `fetching_source` real. After `POST /api/runs` returns 201, an in-process pipeline transitions the run to `fetching_source`, acquires the source (SSRF-guarded plain GET for URLs; stored bytes for uploads), extracts ground text (HTML → text, PDF text layer via pdfjs), decides the class `text | visual` with one pure function over one config threshold, and persists text + class + content type. Fetch/text failures end the run `failed(unreachable_url | no_usable_text)`. Acquisition is the whole story: with no extraction stage yet, a successfully acquired run stays `processing` at `fetching_source` and reads `interrupted` through the staleness net — exactly as the epic predicts until 1.5 lands.

## Boundaries & Constraints

**Always:**
- SSRF guard per AD-11, dependency-free: http/https only; host resolved with `dns.lookup({ all: true })` (IP literals checked directly); refuse if **any** address is in 10/8, 172.16/12, 192.168/16, 127/8, 0/8, 169.254/16, `::1`, `::`, `fc00::/7`, `fe80::/10`, or an IPv4-mapped IPv6 (`::ffff:a.b.c.d`) whose inner v4 is refused. `redirect: 'manual'`, max 5 hops, **every hop re-validated** (scheme + host). DNS rebinding = documented accepted residual — no pinning, no custom agent.
- One plain GET per hop using Node's built-in `fetch`; browser-like headers (`User-Agent` of a current desktop browser, `Accept`, `Accept-Language`); time cap `AbortSignal.timeout(15_000)` per request; size cap **10 MB** (the same constant as the upload cap) enforced while streaming the body — exceeding either is E2.
- Handling is decided by the **final content-type after redirects** (AD-6): `application/pdf` → PDF path; `image/jpeg|png|webp` → `visual` with bytes stored; `text/html`/`application/xhtml+xml` → HTML-to-text; other `text/*` → body as text; anything else → E3 `no_usable_text`. The URL's extension is never consulted.
- Class decision is one pure function in `server/src/core` importing nothing but `shared`: `text` iff usable chars ≥ `SOURCE_MIN_TEXT_CHARS` (env, validated at boot, default **200** — calibration data, not an invariant); `visual` for images and for PDFs below the threshold or failing to parse. URLs are text-class by definition: a URL yielding fewer chars than the threshold is E3, never `visual` (AD-6, AC4) — the *same* threshold value serves both decisions (one config, not two).
- "Usable chars" = length of the extracted text after whitespace collapse. HTML-to-text is dependency-free: drop `<script>`, `<style>`, `<noscript>`, `<template>`, comments and tags; decode the common named entities + numeric entities; collapse whitespace.
- PDF text via `pdfjs-dist` (legacy build, `getDocument({ data })`, all pages' `getTextContent()` joined with newlines per page); any throw ⇒ empty text ⇒ `visual`. `@napi-rs/canvas` arrives as pdfjs's optional dependency — the install is never run with `--omit=optional`.
- Persistence (AC7): `runs.source_class` + `source_artifacts` (`content_type` = final content type, `bytes` = fetched PDF/image bytes for URL runs, existing bytes untouched for uploads, `acquired_text` = extracted text or null for images) written in **one transaction**; for URL runs the artifact row is created here (1.3 creates none), for uploads it is updated. Writes stay guarded on `status = 'processing'`.
- Every transition goes through `transitionStage` / `finishRun` (1.3 primitives) — the pipeline never writes `stage`/`status` directly. One Pino line per transition and per terminal outcome carries `run_id`; an acquisition failure also logs the cause (`err`, final URL, status code) at `warn`.
- The pipeline promise is fire-and-forget from the route (`void runPipeline(log, runId)`), started after the transaction commits and not awaited by the request. An unexpected throw inside it is logged at `error` and leaves the run `processing` — the staleness net reads it `interrupted` (AD-14: every transition ends persisted or hits the net). No `internal` failure reason exists and none is added.
- Stages stay real (FR4): fetch + text extraction + class decision all happen under `fetching_source`; no `classifying` sub-stage.

**Ask First:**
- Any new env var beyond `SOURCE_MIN_TEXT_CHARS`; any new enum value; any new table/column; a third-party HTML/text parser; changing the 10 MB / 15 s / 5-hop caps; storing HTML source bytes for URL runs.

**Never:**
- Crawling beyond the submitted URL, JS rendering / headless browser, retry loops, third-party HTTP clients (AC8); proxies or an IP-pinned agent for rebinding; `extracting` or any model call (1.5); the arbiter / T6 (1.6); the web (1.7); test files (R8 — 1.8); `GET /api/runs/:id/artifact` (2.4); image transcoding or HEIC decoding; OCR.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Public HTML menu | `POST {url}` → 200 `text/html`, ≥200 chars after strip | stage `fetching_source`; artifact `{content_type:'text/html', bytes:null, acquired_text}`; `source_class='text'`; run stays `processing` (→ `interrupted` via net until 1.5) | N/A |
| URL → PDF by redirect | 301 → `application/pdf` with a text layer | PDF path: bytes stored, text extracted, class by threshold; `content_type='application/pdf'` | N/A |
| URL → image | final `image/png` | `visual`; bytes stored; `acquired_text=null` | N/A |
| JS-rendered / bot-blocked page | 200 `text/html`, body strips to <200 chars (or 403 with HTML) | 200 ⇒ `failed(no_usable_text)`; 403 ⇒ `failed(unreachable_url)` | logged `warn` with chars/status |
| Unexpected body type | final `application/json` / `application/octet-stream` | `failed(no_usable_text)` | logged |
| DNS fail / timeout / 4xx / 5xx | NXDOMAIN; >15 s; 404; 503 | `failed(unreachable_url)` | logged with cause |
| Private target | `http://127.0.0.1:5433/`, `http://169.254.169.254/`, `http://10.0.0.5/`, host resolving to RFC1918, `http://[::ffff:10.0.0.1]/` | refused **before** any request ⇒ `failed(unreachable_url)`; message never reveals the refusal rule | logged `warn` (`ssrf_refused`, host) |
| Redirect into private range | public 302 → `http://192.168.1.1/` | hop re-validated ⇒ `failed(unreachable_url)`; no request to the private host | logged |
| Redirect loop / >5 hops | 302 chain of 6 | `failed(unreachable_url)` | logged |
| Oversize body | `Content-Length` or streamed bytes > 10 MB | abort ⇒ `failed(unreachable_url)` | logged |
| Uploaded PDF with text layer | artifact bytes = digital PDF | `acquired_text` set on the existing artifact row; class by threshold | N/A |
| Scanned / corrupt PDF | no text layer or pdfjs throws | `source_class='visual'`; `acquired_text` = `''`/extracted remnant; no failure | parse error logged `info`, not `warn` |
| Uploaded image | JPG/PNG/WebP bytes | `source_class='visual'`; `acquired_text=null`; artifact untouched | N/A |
| Pipeline crash | e.g. Postgres drops mid-acquisition | `error` log with `run_id`; run left `processing` → reads `interrupted`; process survives | N/A |

</frozen-after-approval>

## Code Map

- `server/src/routes/runs.ts:78-85` -- POST creates the row in a transaction and replies 201; add `void runPipeline(request.log, created.id)` right after the transaction (before the reply is fine — it is not awaited). `request.log` is the Pino child carrying `reqId`.
- `server/src/pipeline/run-lifecycle.ts:9-22` -- `transitionStage(log, runId, stage)` / `finishRun(log, runId, outcome)`: the only writers of `stage`/`status`. Reuse verbatim.
- `server/src/db/runs-repo.ts:37-55` -- `setStage` / `setTerminal` pattern (guarded `status='processing'`, bump `stage_changed_at`). Add `setSourceClass(tx, id, source_class)` with the same guard (no anchor bump — not a stage transition).
- `server/src/db/source-artifacts-repo.ts:8-16` -- `insertArtifact(tx, runId, {content_type, bytes})`; `getArtifact(runId)` is the bytes reader the pipeline uses for uploads. Add `upsertArtifact(tx, runId, {content_type, bytes?, acquired_text})` via `onConflictDoUpdate({ target: sourceArtifacts.run_id, set: {...} })` — URL runs insert, uploads update; `bytes` omitted from `set` when undefined so upload bytes survive.
- `server/src/db/schema.ts:31-43,71-78` -- `runs.source_class` (nullable `SourceClass`), `source_artifacts` 1:1 with `bytes` (bytea Buffer) + `acquired_text` — both columns already exist; **no migration**.
- `server/src/env.ts:4-11` -- Zod env; add `SOURCE_MIN_TEXT_CHARS: z.coerce.number().int().positive().default(200)`; document in `.env.example` like `RUN_STALE_AFTER_MS`.
- `server/src/app.ts:11` -- `10 * 1024 * 1024` upload cap literal; lift into `server/src/limits.ts` (`MAX_SOURCE_BYTES`) so the fetcher and multipart share one constant. `errors.ts:32` message keeps naming 10 MB.
- `server/src/core/run-state.ts` -- the core style to copy: pure, structural input types, imports only `shared`.
- `shared/src/enums.ts:31-37,57,69` -- `storedFailureReasonSchema` (`unreachable_url`, `no_usable_text` already exist), `stageSchema` (`fetching_source`), `sourceClassSchema`. No enum change.
- `pdfjs-dist@6.2.108` (spine snapshot; engines `>=22.13 || >=24`, local Node 24.7) -- import `pdfjs-dist/legacy/build/pdf.mjs`; `getDocument({ data: Uint8Array }).promise` → `numPages` → `page.getTextContent()` → `items[].str`. Verify against the installed tarball that Node needs no explicit worker (R-13 practice); optional `@napi-rs/canvas` must be present in `node_modules` after install.
- Node `dns.lookup` (`node:dns/promises`, `{ all: true, verbatim: true }`), `net.isIP`, `fetch` with `redirect: 'manual'` (3xx surfaces as a response with `Location`) and `response.body` as a `ReadableStream<Uint8Array>` for the size-capped read.
- Read-only constraints: AD-4/5/6/11/14 (spine), PRD FR4/FR33/FR36 + E2/E3, epics Story 1.4 AC1–8, D20 (`unreachable_url` reuse; scope guard), D23 (`stage=null` at birth; lifecycle primitives). Deferred item owned here: none; items owned by 1.5/1.6/1.8 untouched.

## Tasks & Acceptance

**Execution:**
- [x] `server/package.json` -- add `pdfjs-dist` (^6.2.108) -- the only new dependency; confirm `node_modules/@napi-rs/canvas` exists after `npm install`.
- [x] `server/src/limits.ts` -- `export const MAX_SOURCE_BYTES = 10 * 1024 * 1024` -- one cap for upload and fetch; `app.ts` imports it.
- [x] `server/src/env.ts` + `.env.example` -- `SOURCE_MIN_TEXT_CHARS` (default 200) -- the single class threshold (AC4/AC5).
- [x] `server/src/core/class-decision.ts` -- pure `decideSourceClass(input: { kind: 'url' | 'pdf' | 'image'; text_chars: number }, minChars): SourceClass` plus `hasUsableText(text_chars, minChars)` used by the URL E3 check — one threshold, both decisions (AD-6).
- [x] `server/src/core/html-to-text.ts` -- pure `htmlToText(html): string` (strip script/style/noscript/template/comments/tags, decode entities, collapse whitespace) and `collapseWhitespace(text)` — the "usable chars" measure.
- [x] `server/src/core/ssrf.ts` -- pure `isRefusedAddress(ip: string): boolean` (ranges in Boundaries, v4-mapped unwrapping) — pure so the rule is reviewable in isolation; resolution stays in the shell.
- [x] `server/src/pipeline/fetch-url.ts` -- shell `fetchSource(url, log): Promise<{ content_type, bytes, final_url }>`; per hop: scheme check → host validate (`net.isIP` or `dns.lookup all`) → `fetch(redirect:'manual', headers, signal)` → 3xx: resolve `Location` against current URL, hop++ (max 5) → non-2xx: throw `UnreachableUrl` → stream body with the byte cap. Throws a typed `AcquisitionError(reason: 'unreachable_url')` for every E2 cause.
- [x] `server/src/pipeline/pdf-text.ts` -- shell `extractPdfText(bytes): Promise<string>`; catches every pdfjs throw → `''` with an `info` log.
- [x] `server/src/pipeline/acquire-source.ts` -- `acquireSource(log, run, artifact | null)` → `{ source_class, content_type, bytes?, acquired_text }` or throws `AcquisitionError('unreachable_url' | 'no_usable_text')`; branches on `run.source_type` then on final content type (URL); calls the core functions above.
- [x] `server/src/db/runs-repo.ts` + `source-artifacts-repo.ts` -- `setSourceClass`, `upsertArtifact` -- the two persistence writes (AC7), guarded/1:1 as noted in the Code Map.
- [x] `server/src/pipeline/run-pipeline.ts` -- `runPipeline(log, runId)`: load run (+ artifact for uploads) → `transitionStage('fetching_source')` → `acquireSource` → one `db.transaction` (`setSourceClass` + `upsertArtifact`) → `log.info({ run_id, source_class, content_type, text_chars }, 'source acquired')`; `AcquisitionError` → `finishRun({ status:'failed', failure_reason })`; any other throw → `log.error` only. Nothing after acquisition (1.5 appends `extracting`).
- [x] `server/src/routes/runs.ts` -- `void runPipeline(request.log, created.id)` after the create transaction -- the run starts moving without the request holding the process (AD-4).

**Acceptance Criteria:**
- Given a real public restaurant menu URL, when POSTed, then within seconds GET shows `stage: 'fetching_source'`, `source_class: 'text'`, and `SELECT length(acquired_text), content_type FROM source_artifacts` shows the stripped text; after `RUN_STALE_AFTER_MS` it reads `interrupted` with the class and text intact (AC7 + honest end state).
- Given `http://127.0.0.1:<port>/`, `http://169.254.169.254/latest/meta-data/`, and a public hostname redirecting to a private IP (scratchpad server), when POSTed, then the run ends `failed(unreachable_url)`, the scratchpad listener never receives a request, and the log line says `ssrf_refused` (AC1/AC2).
- Given a scratchpad HTTP server serving a 200 HTML page of 50 visible chars, a 404, a 6-hop redirect chain, and an 11 MB body, then the runs end `no_usable_text`, `unreachable_url`, `unreachable_url`, `unreachable_url` respectively, each with one Pino `run finished` line carrying `run_id` (AC3/AC4).
- Given an uploaded digital PDF and an uploaded scanned PDF, then classes are `text` and `visual`, `acquired_text` is set on the existing artifact row, and `bytes` are unchanged (`length(bytes)` before/after) (AC5/AC7).
- Given an uploaded image and a URL whose final content-type is `image/jpeg`, then both are `visual`; the URL run's artifact row holds the fetched bytes (AC6).
- Given the diff, then `server/src/core/*` imports only `shared`/Node-free pure code (no `node:` or `pipeline`/`db` imports), nothing exists beyond these tasks, and `npm run typecheck` is green on all workspaces.

## Spec Change Log

## Design Notes

**Why the run ends `interrupted` on success this session** — the honest alternative (writing `extracting` with nothing extracting, or `done` with no dishes) is the theatrical state FR4 bans and D23 already rejected. Leaving the run at `fetching_source` with class + text persisted is a truthful partial pipeline; 1.5 appends the next transition in `run-pipeline.ts` without touching this story's code.

**Rebinding residual (what breaks in production)** — `dns.lookup` validates, then Node's `fetch` resolves the hostname again; an attacker-controlled DNS answering public-then-private between the two lookups bypasses the guard. AD-11 accepts this; the dependency-free fix (pin the validated IP via a custom dispatcher) is the first thing to add if this ever runs beyond a single trusted operator.

**`no_usable_text` vs `unreachable_url` at the seam** — a 200 with too little text is E3 (the site works, the approach doesn't: suggest PDF/photo); any non-2xx, including a bot-wall 403 serving HTML, is E2 (retry or switch). The classifier never second-guesses a status code.

**Threshold default 200** — calibration data (spine Deferred): a one-screen menu in HTML strips to several hundred chars; a JS shell strips to a title and a cookie banner. Adjust from dev menus in 1.8's fixture work; the rule, not the number, is the invariant.

**Post-review amendments (3 layers, ~70 raw findings → 9 patch / 2 defer / rest rejected):** charset from the final `Content-Type` now drives decoding (`TextDecoder`, utf-8 fallback) — a Latin-1 menu no longer reaches the model as mojibake; the HTML4 Latin-1 entity table decodes `&eacute;`/`&ntilde;`; NUL and lone surrogates are stripped before the AC7 transaction (Postgres `text` would have thrown and left the run stuck `processing`); redirect hops carrying userinfo are refused; a 0-byte 2xx body is E3; `task.destroy()` can no longer discard extracted text; PDF lines follow `hasEOL`; the failure log keeps the `AcquisitionError` intact under `err` with `details` beside it. Deferred with owners (1.8): a table pin for `isRefusedAddress`, and upload-bytes preservation + route→pipeline wiring observed by the golden. Rejected under the guard: refusal ranges beyond AC1's list (100.64/10, NAT64, 6to4), PDF page caps, excluding `<head>` from the count, a body-read timer (undici aborts the stream with the same signal), an IP-pinned agent, tests in the repo (R8).

## Verification

**Commands:**
- `npm install` then `ls node_modules/@napi-rs/canvas` -- expected: present (pdfjs optional dep installed).
- `npm run typecheck` -- expected: green in `shared`, `server`, `web`.
- `docker compose up -d --wait` + `npm run -w server db:migrate` + `npm run -w server dev` -- expected: boot OK with `SOURCE_MIN_TEXT_CHARS` absent (default 200 applies).
- `curl -s -X POST …/api/runs -d '{"url":"<public menu URL>"}'` then `GET /api/runs/<id>` -- expected: `stage: 'fetching_source'`, `source_class: 'text'`; `psql -c "select content_type, length(acquired_text), bytes is null from source_artifacts where run_id='<id>'"`.
- Scratchpad `node` server (never committed) on `127.0.0.1:<p>` with routes: `/html-ok`, `/html-thin`, `/404`, `/loop` (6 hops), `/big` (11 MB), `/to-private` (302 → `http://192.168.1.1/`), `/pdf` (serves a digital PDF), `/img` (PNG) -- expected per matrix; POST each through a public-looking hostname only where redirects are the subject; direct loopback URLs must be refused before the listener logs a hit.
- `curl -F file=@digital.pdf`, `-F file=@scanned.pdf`, `-F file=@photo.jpg` -- expected: classes `text`/`visual`/`visual`; `length(bytes)` unchanged before/after acquisition.
- `grep -rn "node:\|from '\.\./pipeline\|from '\.\./db" server/src/core` -- expected: no matches.
- `git diff --stat main` -- expected: only files named in Tasks (+ `package-lock.json`).

## Suggested Review Order

**The pipeline: one real stage, fire-and-forget**

- Entry point — `fetching_source` → acquire → one transaction; `AcquisitionError` is the only path to `failed`.
  [`run-pipeline.ts:14`](../../server/src/pipeline/run-pipeline.ts#L14)

- Unexpected throw: logged, run left `processing` → the staleness net reads `interrupted` (AD-14).
  [`run-pipeline.ts:50`](../../server/src/pipeline/run-pipeline.ts#L50)

- Started after the create transaction, never awaited by the request (AD-4).
  [`runs.ts:87`](../../server/src/routes/runs.ts#L87)

**SSRF guard: validate before every request**

- Scheme, userinfo, IP literal or every resolved address — per hop, before the GET.
  [`fetch-url.ts:36`](../../server/src/pipeline/fetch-url.ts#L36)

- The pure refusal rule: listed ranges + IPv4-mapped unwrapping; unparseable is refused.
  [`ssrf.ts:49`](../../server/src/core/ssrf.ts#L49)

- Manual redirects, 5 hops max — a redirect into a private range dies at re-validation.
  [`fetch-url.ts:101`](../../server/src/pipeline/fetch-url.ts#L101)

- Streamed 10 MB cap shared with the upload limit; empty 2xx body is E3.
  [`fetch-url.ts:55`](../../server/src/pipeline/fetch-url.ts#L55)

**Class decision: final content-type, one threshold**

- Branch on `source_type`, then on the final content type — never the URL's extension (AD-6).
  [`acquire-source.ts:37`](../../server/src/pipeline/acquire-source.ts#L37)

- URLs are text-class by definition: too little text is E3, never `visual`.
  [`acquire-source.ts:64`](../../server/src/pipeline/acquire-source.ts#L64)

- The pure rule — one `minChars` for the PDF class and the URL E3 check.
  [`class-decision.ts:19`](../../server/src/core/class-decision.ts#L19)

- Charset-aware decoding (review patch) — Latin-1 menus decode correctly.
  [`acquire-source.ts:25`](../../server/src/pipeline/acquire-source.ts#L25)

**Ground text**

- Dependency-free HTML → text; `collapseWhitespace` is the "usable chars" measure (NUL stripped).
  [`html-to-text.ts:65`](../../server/src/core/html-to-text.ts#L65)

- pdfjs legacy build, all pages, `hasEOL` line breaks; any throw ⇒ `''` ⇒ `visual`.
  [`pdf-text.ts:9`](../../server/src/pipeline/pdf-text.ts#L9)

**Persistence (AC7)**

- Upsert: URL runs insert, uploads update — `bytes` omitted from the set when undefined.
  [`source-artifacts-repo.ts:14`](../../server/src/db/source-artifacts-repo.ts#L14)

- Class write guarded on `processing`; no anchor bump — not a stage transition.
  [`runs-repo.ts:58`](../../server/src/db/runs-repo.ts#L58)

**Peripherals**

- The single class threshold, validated at boot; default 200 = calibration data.
  [`env.ts:13`](../../server/src/env.ts#L13)

- One 10 MB cap for upload and fetch.
  [`limits.ts:3`](../../server/src/limits.ts#L3)

- Two deferrals for 1.8: SSRF table pin, bytes preservation + wiring in the golden.
  [`deferred-work.md:41`](deferred-work.md#L41)
