# Reconciliation — REQUIREMENTS.md vs PRD (+ addendum)

Date: 2026-08-21
Input: `/Users/pablojavier/dev/full-stack-challenge/REQUIREMENTS.md`
PRD: `prd.md` · Addendum: `addendum.md` (this folder)
Scope of this review: product-scoped hard requirements R1–R9, §4 guardrails, §5 signals at
PRD altitude, §3 tripwires as provoked by PRD content. Process-level items (R10–R12,
videos, `prompts/`) are explicitly out of PRD scope and were not assessed as gaps.

## 1. Hard requirements R1–R9 — coverage matrix

| Req | Where satisfied / routed | Status |
|---|---|---|
| R1 Node + Fastify + TS | Constraints ("Node.js + Fastify + TypeScript") | ✅ |
| R2 Postgres + Drizzle + real migration | Constraints ("PostgreSQL + Drizzle with a real migration") | ✅ |
| R3 React + Vite + **TypeScript** + Tailwind + shadcn/ui | Constraints — but the frontend line reads "React + Vite + Tailwind + shadcn/ui": **TypeScript is dropped from the frontend transcription** | ⚠️ Gap 3 (minor) |
| R4 OpenAI SDK, JSON mode, vision for images | Constraints ("OpenAI SDK (JSON mode, vision for images)"); FR6/E7 bound the call | ✅ |
| R5 URL + uploaded PDF/image | FR1 (one source per run: URL / PDF / JPG-PNG-WebP) — but E6 excludes scanned PDFs, see Gap 2 | ✅ / ⚠️ |
| R6 name, price, allergens, one-line description, confidence flag; derivation documented | FR9 (cites R6); derivation FR15–FR21 (D4 closed in "Decisions closed in this PRD"), formal DECISIONS.md entry routed to session close | ✅ |
| R7 persisted to Postgres + clean UI | FR3 (born persistent), FR29 (cites R7), FG4 review screen, stock shadcn via Constraints | ✅ |
| R8 exactly one meaningful test, justified in DECISIONS.md | Constraints; Open items row routes choice + justification to architecture phase / DECISIONS.md, with the T1–T6 arbiter named as leading candidate (addendum) | ✅ routed with owner |
| R9 structured Pino logs | Constraints + NFR5 (stage transitions + fired triage rules logged) | ✅ |

## 2. §4 guardrail check — no violations found

Scanned every FR/NFR and both addendum ADR/roundtable sections against the §4 list:

- No microservices/k8s/event bus — one Fastify service; A4 (queue) explicitly cut as a
  direct guardrail violation (addendum ADR).
- No Redis/BullMQ/queues — in-process continuation + polling (A2); SSE/WebSocket also cut.
- No auth/accounts/roles (Scope Out, NFR4), no monorepo tooling, no deploy infra, no
  multi-env config anywhere in the PRD.
- Exactly one test preserved (Constraints + open item) — no suite creep.
- No custom design system; stock components implied by the Constraints stack.
- Speculative-feature check: every candidate (SSRF guard FR36, HEIC handling FR1, image
  downscaling, T6 verification, no-delete history FR31, menu-level notice FR20) carries an
  inline justification mapping to the brief or to a rubric row. FR32 explicitly refuses
  search/filter machinery. The addendum's cut lists (SSE, dynamic ETA, percentage bars,
  resumability, idempotency keys, reaper) actively enforce §4 rather than eroding it.

**Verdict: clean.** The processing-model ADR is the strongest §4 artifact in the set — it
names the queue guardrail and designs around it instead of past it.

## 3. §5 alignment signals at PRD altitude

- **Zod** — ⚠️ **Gap 1** (see below). Never named in PRD or addendum, and no open item
  routes it.
- **TanStack Query** — present (addendum ADR, A2 polling client). ✅
- **Playwright** — §5 makes it conditional ("the candidate *if* the single test is E2E");
  the PRD's leading candidate is the deterministic arbiter test instead, with the formal
  justification routed to DECISIONS.md at architecture (open item). A deliberate, routed
  divergence — not a gap. ✅
- **GitHub Actions / written communication** — process-level, out of PRD scope. n/a

## 4. §3 tripwire check — none provoked

- Over-engineering triad (microservices/k8s/event bus): absent and explicitly cut.
- BMAD-as-decoration: the PRD shows real flow (brief → PRD projection, in-session
  position evolutions recorded in "Decisions closed in this PRD").
- "Cannot explain what breaks in production": actively seeded — FR23 omission-blindness,
  FR19 image-quote limitation, FR36 SSRF, NFR5, addendum T6 notes all tagged as
  production-failure narrative material.
- Secrets / videos / prompts: process-level, n/a to PRD content.

## 5. Gaps

### Gap 1 — Zod has no landing spot (rubric-scored signal, §5 + §6)

Zod is the only §5 signal that is *named in the rubric itself* ("idiomatic
React/Fastify/Drizzle/**Zod**", Stack competence, 15%), and it appears nowhere in the PRD
or addendum. The underlying requirement exists only implicitly: FR4 has a `validating`
stage and E7 covers "invalid JSON after one retry", but no FR/NFR states that the LLM
output is validated against the extraction-contract schema (and API I/O validated) before
persistence — and unlike HEIC, staleness, or the single test, there is no Open-items row
carrying it to architecture. Risk: the one tool the rubric names by name arrives at
architecture unrouted. Fix is one line: either extend the Constraints stack sentence or
add an Open-items row ("schema validation of API I/O + LLM JSON contract — Zod — closes
at architecture").

### Gap 2 — E6 scanned-PDF exclusion narrows R5 without a recorded justification

R5's input path is "uploaded **PDF**/image"; E6 declares scanned PDFs (no text layer)
unsupported in v1. The exclusion is honest at the UI level (clear error + photo-path
suggestion), so it is not a *silent* drop — but it is a real scope reduction of a hard
requirement's input path, and unlike every other cut in the PRD it has **no recorded
reasoning**: it is absent from the Scope "Out" list, from the addendum cut lists, and from
the Open items. The obvious alternative — render PDF pages server-side and use the
already-required vision path (R4) — is never examined or rejected on record. Per the §4
guard question's own rule ("cut it *and log the cut in DECISIONS.md*"), this cut needs a
DECISIONS.md entry (or an addendum line) stating why v1 draws the line at the text layer.

### Gap 3 (minor) — R3's TypeScript dropped from the frontend Constraints line

The Constraints paragraph transcribes R1–R3 but renders R3 as "React + Vite + Tailwind +
shadcn/ui" — TypeScript, named for the backend, is missing from the frontend list. No real
drift risk (the repo will obviously be TS end-to-end), but the Constraints section is the
PRD's formal satisfaction of a hard requirement and should transcribe it whole. One-word
fix.

## 6. Verdict

**3 gaps (1 moderate, 1 moderate-process, 1 minor).** No guardrail violations, no
tripwires provoked, R1–R9 otherwise fully covered or routed with owners. The PRD is a
faithful, at points exemplary, projection of the lighthouse; all three gaps are
single-line-to-single-entry fixes.
