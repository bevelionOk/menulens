# Rubric Walker Review — ARCHITECTURE-SPINE.md

- **Artifact:** `ARCHITECTURE-SPINE.md` (architecture-full-stack-challenge-2026-08-21)
- **Reviewer:** rubric walker (good-spine checklist, 7 points)
- **Date:** 2026-08-21
- **Verdict: PASS-WITH-FIXES**

The spine is strong: rules are concrete and enforceable, the deferred list is mostly
data-not-decisions, the stack snapshot is plausible, the operational cut is stated rather
than silent, and the seed is lean. What keeps it from a clean pass is a small set of
genuine divergence points at the run-lifecycle edges (pre-run rejections, the meaning of
"active", the `stage`/`status` split) and two items where the deferral itself could let
two story-builders diverge (batch review API, SPA routing).

---

## Checklist walk

### 1. Fixes the real divergence points; misses none — PARTIAL

The big divergences are nailed: contract ownership (AD-2), pure/shell split (AD-3),
persist-first lifecycle (AD-4), derived state (AD-5), source-class keying (AD-6),
normalization pinning (AD-7 — exactly the "two builders normalize differently" trap,
closed with an explicit chain), review immutability (AD-9), seriality (AD-10), the
OpenAI seam (AD-12), and the single-test rule (AD-13). Probing for residual
incompatibilities surfaced the findings below (H1, H2, M1, M2, L3).

### 2. Every AD's Rule enforceable and divergence-preventing — PASS

No vague aspirations found. Each Rule is checkable in code review: "no IO imports under
`server/src/core/`" (AD-3), "no column stores them" (AD-5), "re-validate on every
redirect hop" (AD-11), "the failure handler itself never throws" (AD-14), "one base
schema per entity; variants derived, never re-declared" (AD-2). AD-7's normalization
chain (NFKC → lowercase → collapse whitespace → strip diacritics) is the model of an
enforceable divergence-preventer.

### 3. Nothing under Deferred lets two units diverge — PARTIAL

Threshold values, prompt content, model params, and the zod/openai-helper verification
(with a stated fallback) are safe: value-level data behind an already-fixed rule. Two
entries are not value-level: **SPA routing** (M3) and, mildly, **history pagination**
(if it lands, the endpoint shape is undecided — acceptable given FR32 makes it
unlikely; noted, no finding).

### 4. Named tech verified-current — PASS (plausibility spot-check)

The 2026-08-21 snapshot is internally coherent and plausible: Fastify 5.12.x /
multipart 10.x, Drizzle 0.45.x / kit 0.31.x, React 19.2.x, Vite 8.x, Tailwind 4.3.x,
TanStack Query 5.101.x, Zod 4.4.x, openai SDK 7.x, pdfjs-dist 6.x, Pino 10.x, Vitest
4.x are all consistent with each project's release cadence. The TS 7 "fresh major —
take what the scaffold gives" note and the "scaffold-pinned, never hand-upgraded"
policy are exactly the right guard. Model ids (`gpt-5.6-luna`/`-terra`) are env data
per AD-12/D3, not an npm claim. No findings.

### 5. Every owned dimension decided, deferred, or open — PASS with low findings

The operational/environmental envelope is handled correctly: local-only is a *stated,
recorded cut* ("no deploy target, no environments beyond dev — REQUIREMENTS §4 cut,
recorded"), and within that cut the envelope is actually specified (compose, dev
runner, proxy, CI jobs). Testing (AD-13), observability (conventions + AD-14),
security (AD-8 artifact serving, AD-11 SSRF, gitleaks/config conventions), data
migration (committed drizzle SQL), error handling (envelope + shared enum) — all
present. Gaps are minor: capability-map omissions (L2) and the UI label language (L4).

### 6. Seed stays minimal — PASS

The tree names only structure the ADs require (core/pipeline/routes/db is AD-3 made
physical; `drizzle/` committed is the migration decision; `prompts/` is R11). Column
details, plugin layout, and design tokens are explicitly pushed to code. The ER
diagram flirts with over-specification (column lists) but the Deferred section
explicitly cedes column details to code, so it reads as illustration — except for the
`stage`/`status` pair, which creates ambiguity instead (M1). No over-specification
finding beyond that.

### 7. Diagrams — PASS with a low note

Both blocks are valid mermaid (flowchart `graph TD` with piped edge labels; `erDiagram`
with quoted relationship label) and depict real structure: the dependency-direction
rule and the three-table ownership model. No placeholders. One legibility note (L5).

---

## Findings

### Critical

None. Nothing invalidates the spine's shape or its ADs.

### High

- **H1 — Pre-run rejections vs persist-first: does a rejected submission create a run?**
  AD-4 says "`POST /api/runs` creates the run row and returns its id before processing
  starts", and the error-envelope convention maps codes to "the `shared` failure-reason
  enum (E1–E9 mapping)". But the PRD makes E1 (malformed URL), E4 (unsupported type),
  and E5 (over-cap upload) *pre-run* rejections ("rejected *before* processing starts",
  FR2). The spine never says whether these are plain 4xx responses with no run row, or
  failed runs. Two story-builders can diverge visibly: one History shows rejected
  uploads as failed runs, the other never records them; one client handles a 400
  envelope, the other polls a run id. **Fix:** one sentence in AD-4 or AD-14, e.g.
  "E1/E4/E5 are synchronous 4xx rejections — no run row is created; the run inventory
  starts at E2." (Cites: AD-4, AD-14, conventions "Error envelope".)

- **H2 — "While a run is active" is undefined against the staleness net.** AD-10
  returns 409 "while a run is active"; AD-5 derives `interrupted` at read time for a
  stale run that never reached a terminal state. Is a stale-but-not-terminal run
  "active"? One builder blocks all submissions until someone retries (409 forever on a
  crashed run); another unblocks at the staleness threshold. This is a real
  incompatibility in the system's most visible behavior after a crash. **Fix:** define
  "active" in AD-10 — e.g. "active = non-terminal AND within the AD-5 staleness
  threshold; a derived-interrupted run does not block new submissions." (Cites: AD-5,
  AD-10, FR7/FR8/FR35.)

### Medium

- **M1 — `stage` vs `status` columns: undefined split.** The ER diagram gives RUNS both
  `stage` and `status`, but AD-4 defines a single chain
  (`fetching_source → … → done | failed | empty`) that mixes stages and terminal
  outcomes. Which column holds `done`? Is `status` = processing/terminal and `stage` =
  position? Undefined; two builders will model it differently, and AD-13's golden
  asserts the payload. **Fix:** either drop one column from the diagram (code owns
  columns per Deferred) or add one line defining the split. (Cites: AD-4, ER diagram.)

- **M2 — Batch review has no API shape.** FR26 requires "confirm all auto-checked" and
  free multi-row resolution, but the conventions list only `/api/dishes/:id/review`.
  One builder ships N per-dish calls, another invents `/api/runs/:id/review-batch` —
  incompatible client/server pairs. **Fix:** one convention row — either "batch = the
  per-dish endpoint called per row; no batch endpoint exists" or name the batch route.
  (Cites: conventions "Naming", FR26, AD-9.)

- **M3 — SPA routing deferred as "code decides" is a cross-unit divergence point.**
  Submit, review, and history pages plus the FR30 History→review navigation all depend
  on it; if separate stories build pages in parallel, react-router URLs vs state
  navigation collide (deep-linking a run's review screen behaves differently). Rubric
  point 3 violation as written. **Fix:** either decide it (one line: "react-router,
  routes `/`, `/runs/:id`, `/history`" — or "no router, single page-shell state") or
  constrain the deferral to a single owning story. (Cites: Deferred "SPA routing",
  FR30.)

### Low

- **L1 — E6 eliminated, but the enum is still called "E1–E9 mapping".** AD-6 says "E6
  is eliminated", yet AD-14 and the error-envelope convention both say the shared enum
  maps "the PRD's E-states / E1–E9". A builder may faithfully include an unreachable
  `E6` code. One clarifying phrase ("E1–E9 minus the eliminated E6") closes it.
  (Cites: AD-6, AD-14, conventions.)

- **L2 — Capability map omits NFR1 and NFR3.** NFR1 (latency) is effectively governed
  by AD-4/AD-12 and NFR3 (disclaimer copy) is story-level UI, but the map claims to
  cover the binding surface (`binds: FR1-FR36, NFR1-NFR5`) and lists only NFR2/NFR5
  (NFR4 appears only inside AD-8's binds). Two rows finish the map. (Cites:
  frontmatter `binds`, Capability → Architecture Map.)

- **L3 — Dish ordering is nobody's decision.** AD-13 demands "stable ordering" for the
  golden and Ana reviews the table against the original menu, but nothing decides how
  dish order is persisted/returned (insertion order? position column? sort at read?).
  Cheap to state, mildly annoying to converge later. (Cites: AD-13, AD-8, FR23.)

- **L4 — "UI renders localized labels" for allergens leaves the language unstated.**
  PRD FR14 fixes a single-language assumption; the convention row should name the UI
  label language (or point at FR14's assumption) so "localized" isn't read as an i18n
  mechanism. (Cites: conventions "Allergens", FR13/FR14.)

- **L5 — Dependency diagram mixes edge semantics.** In the paradigm flowchart,
  `WEB -->|HTTP /api| ROUTES` is a runtime call while `WEB --> SHARED` is an import
  edge; both render identically. Real structure is still conveyed and the prose rule
  below the diagram disambiguates, so this is cosmetic. (Cites: Design Paradigm
  diagram.)

- **L6 — `source_artifacts` 1:1 with bytes for URL runs.** The ER shows a mandatory
  1:1 with `bytea bytes`, but URL runs have no uploaded bytes (FR23 Original tab for
  URLs is an external link). Nullability is a code-owned column detail, but the "1:1,
  bytes + acquired text" phrasing in AD-8 could read as bytes-always. One word
  ("uploaded bytes, when any") suffices. (Cites: AD-8, ER diagram, FR23.)

---

## Gate recommendation

**pass-with-fixes** — merge after H1 and H2 are answered in the spine (one sentence
each) and M1–M3 are resolved (a convention row / a one-line decision each). The lows
are editorial and can ride along or be batched.
