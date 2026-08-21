# Review — Version & External-Claim Verification

- **Target:** `ARCHITECTURE-SPINE.md` (architecture-full-stack-challenge-2026-08-21)
- **Reviewer lens:** were committed technology decisions web-researched / reality-checked, or asserted from training data?
- **Method:** every Stack row checked against the npm registry (`npm view`, 2026-08-21); load-bearing external claims checked against current vendor docs and by **executing the actual libraries** in a scratchpad install (openai 7.5.0 + zod 4.4.3 helper call; pdfjs-dist 6.2.108 text extraction on a minimal PDF, with and without optional deps).
- **Date:** 2026-08-21

## Verdict: **pass-with-fixes**

The spine's research discipline is real: all 16 pinned versions match the registry exactly as of today, and every load-bearing external claim traces to genuine web evidence (the `.memlog.md` even records the Safari 17+ accept-list pitfall, which only appears in field reports, not vendor docs — not a training-data artifact). Two factual corrections and two build-notes below; none is structural.

---

## 1. Stack table vs npm registry — PASS (16/16 exact)

| Row | Spine | Registry (2026-08-21) | Status |
| --- | --- | --- | --- |
| TypeScript | 7.0.2 | 7.0.2 | match |
| fastify | 5.12.1 | 5.12.1 | match |
| @fastify/multipart | 10.1.1 | 10.1.1 | match |
| drizzle-orm | 0.45.2 | 0.45.2 | match |
| drizzle-kit | 0.31.10 | 0.31.10 | match |
| react | 19.2.8 | 19.2.8 | match |
| vite | 8.2.2 | 8.2.2 | match |
| tailwindcss | 4.3.3 | 4.3.3 | match |
| @tanstack/react-query | 5.101.4 | 5.101.4 | match |
| zod | 4.4.3 | 4.4.3 | match |
| openai | 7.5.0 | 7.5.0 | match |
| pdfjs-dist | 6.2.108 | 6.2.108 | match |
| pino | 10.3.1 | 10.3.1 | match |
| vitest | 4.1.11 | 4.1.11 | match |
| tsx | 4.23.12 | 4.23.12 | match |
| concurrently | 10.0.5 | 10.0.5 | match |

The "Reference snapshot verified against the npm registry 2026-08-21" claim in the spine is accurate. Postgres 16 (`postgres:16-alpine`) is not latest-major but is a deliberate conservative pin, fine.

---

## 2. Load-bearing external claims

### F1 — MEDIUM — pdfjs-dist v6 in Node is NOT canvas-free; it hard-requires `@napi-rs/canvas` even for text-only extraction

**Empirically tested**, not read off docs. With `npm install --omit=optional` (no canvas), importing `pdfjs-dist/legacy/build/pdf.mjs` on Node 24 **fails at import time** with `DOMMatrix is not defined` — before any page or text call. The legacy build polyfills `DOMMatrix`/`Path2D` from `@napi-rs/canvas`, which pdfjs-dist declares as an `optionalDependency` (`^1.0.0`).

- With a **plain `npm install`** (optional deps on, npm's default), text extraction works: my minimal one-page PDF round-tripped `getDocument → getPage(1) → getTextContent()` and returned the exact text layer. `@napi-rs/canvas` ships **prebuilt N-API binaries** — no node-gyp, no cairo, no compile toolchain — so the project's npm-only / README-<5-min constraint **holds**.
- But the `.memlog.md` OPEN-3 record calls pdfjs-dist "**pure JS**" — that is wrong for v6 in Node. Any `npm ci --omit=optional`, minimal Docker image, or unsupported platform breaks the `text`-class PDF path at import, which would silently push every PDF to `visual` class or fail runs.
- Also note `pdfjs-dist@6.2.108` declares `engines: node >=22.13.0 || >=24` — "current LTS" satisfies this today, but it's a real floor worth stating.
- Minor: text extraction emits a non-fatal `standardFontDataUrl` warning; pass `standardFontDataUrl` (or ignore) at scaffold.

**Fix:** add one line to the spine (Stack note or Deferred): "pdfjs-dist v6 requires its optional `@napi-rs/canvas` (prebuilt, default-installed) for Node use — never install with `--omit=optional`; Node ≥22.13." Correct the "pure JS" characterization wherever it survives into downstream docs.

Sources: local execution (scratchpad, Node v24.7.0); `npm view pdfjs-dist@6.2.108 optionalDependencies engines`.

### F2 — LOW — OpenAI PDF caps stale: current docs say 50 MB, no documented 100-page limit

`input_file` native PDF input on the Responses API **exists as described**: base64 / Files-API id / URL, text + page images extracted server-side on vision-capable models, `detail` control — all confirmed in current docs. But the caps recorded in `.memlog.md` ("100 pages / 32MB per request") are the **old** documented limits; the current file-inputs guide states "each file must be under 50 MB. The combined limit across all files in the request is 50 MB" and no longer documents a page cap. Nothing in the spine depends on the specific numbers (upload caps surface as E2/E3 per AD-4 regardless), so this is informational — but the app's own upload cap should be chosen against the 50 MB figure, and note the old 100-page limit may still be enforced server-side even if undocumented.

Structured outputs + PDF input: the docs treat these as orthogonal (input-side `input_file` vs output-side `text.format`); no documented incompatibility, and the combination is in wide community use. Residual risk is negligible and is covered anyway by the AD-12 one-retry-then-E7 rule.

Sources: https://developers.openai.com/api/docs/guides/pdf-files , https://developers.openai.com/api/docs/guides/file-inputs (fetched 2026-08-21); old caps corroborated as historical at https://learnprompting.org/blog/openai-api-works-with-pdfs and https://community.openai.com/t/direct-pdf-file-input-now-supported-in-the-api/1146647

### F3 — INFO (positive) — openai v7 + Zod 4 helper: the deferred item can be CLOSED, verified working

The spine defers "`zodTextFormat`/openai-SDK-v7 helper compatibility with Zod 4 — verify at scaffold; fallback is passing the derived JSON schema explicitly." The defer was sound when written (the Zod-4 breakage was real: openai/openai-node#1602, SDK ≤5.11 produced `type: 'string'` schemas under Zod 4), but it is now **resolved and verified**:

- `openai@7.5.0` declares peer dependency `zod: '^3.25 || ^4.0'` — Zod 4 is officially supported.
- **Executed:** `zodTextFormat(z.object({...}), 'menu')` under openai 7.5.0 + zod 4.4.3 returns a correct `{ type: 'json_schema', strict: true, schema: { type: 'object', ... } }` — the historical bug does not reproduce.

**Fix (optional):** collapse the deferred bullet to "verified 2026-08-21: openai 7.5.0 helper works with Zod 4.4.3" and keep the explicit-JSON-schema fallback line as belt-and-braces.

Sources: local execution; `npm view openai@7.5.0 peerDependencies`; https://github.com/openai/openai-node/issues/1602

### F4 — PASS — Safari HEIC→JPEG auto-conversion claim

The `.memlog.md` OPEN-4 record matches current field evidence precisely: iOS Safari transcodes HEIC→JPEG on upload when the input's `accept` list excludes HEIC (e.g. `image/jpeg,image/png,image/webp`), and — the telltale sign of real research — it records the **Safari 17+ inverse pitfall** (listing `image/heic` in `accept` can convert uploads TO .heic), which appears only in developer field reports. The documented residual (raw `.heic` via macOS drag / Files app → E4, no conversion lib) is the right containment; one extra caveat worth knowing at build time: conversion also depends on the user's iOS camera/transfer setting ("Most Compatible" vs "Keep Originals"), so the server-side E4 rejection of unknown bytes must stay authoritative — which the design already ensures.

Sources: https://developer.apple.com/forums/thread/743049 (Safari 17+ accept pitfall), https://shkspr.mobi/blog/2020/12/coping-with-heic-in-the-browser/ , https://news.ycombinator.com/item?id=23268189

### F5 — PASS — shadcn/ui CLI with Tailwind 4.3 + Vite 8 + React 19

- `@tailwindcss/vite@4.3.3` peer-supports `vite: ^5.2.0 || ^6 || ^7 || ^8` — Vite 8.2.2 is in range.
- shadcn CLI (current: `shadcn@4.18.0`) initializes Tailwind v4 projects, and all components are updated for Tailwind v4 + React 19 per the official docs; the Vite installation guide is current.
- "CLI-current (components vendored)" is the right way to pin this — no version to go stale.

Sources: `npm view @tailwindcss/vite peerDependencies`, `npm view shadcn version`; https://ui.shadcn.com/docs/tailwind-v4 , https://www.shadcn.io/ui/installation/vite

---

## 3. Other spine content scanned for staleness

- **TS 7.0.2 "fresh major: take what the scaffold gives"** — sound and correctly humble; TS 7 is the native-compiler major and downstream tooling (vitest/tsx) compat is exactly a scaffold-time question. No action.
- **Node "current LTS"** — fine, but F1's `>=22.13.0` engine floor from pdfjs-dist is the binding constraint worth writing down.
- **Model ids `gpt-5.6-luna` / `gpt-5.6-terra` (D3)** — project-internal decision inputs (challenge-supplied), not verifiable against a public registry; env-injected per AD-12, so no staleness risk in the spine itself. Out of scope.
- **SSRF ranges, EU-14 allergen enum, error envelope, naming conventions** — internal/standards-stable; nothing web-dependent. No action.

## Summary of required fixes

| # | Severity | Fix |
| --- | --- | --- |
| F1 | MEDIUM | Spine note: pdfjs-dist v6 needs default-installed `@napi-rs/canvas` (prebuilt) in Node — never `--omit=optional`; Node ≥22.13. Kill the "pure JS" phrasing downstream. |
| F2 | LOW | Update PDF caps knowledge to current 50 MB docs; size the app upload cap against it. |
| F3 | INFO | Optionally close the Zod-4 helper deferred item as verified working (keep the fallback line). |
