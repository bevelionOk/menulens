# Reconciliation Review — Spine vs REQUIREMENTS Lighthouse

- **Artifact under review:** `ARCHITECTURE-SPINE.md` (architecture-full-stack-challenge-2026-08-21, status: draft)
- **Lighthouse:** `/REQUIREMENTS.md` (§1 hard requirements R1–R12, §2 deliverables, §3 tripwires, §4 guardrails, §5 alignment signals, §6 rubric map)
- **Challenge sources:** `docs/challenge/BRIEF.md`, `docs/challenge/JOB.md`, `docs/challenge/INTERPRETATION.md`
- **Reviewer:** reconciliation lane (coverage + guardrails)
- **Date:** 2026-08-21

## Verdict: **pass-with-fixes**

The spine covers 11 of 12 hard requirements with a clear architectural home, stays inside
every §4 guardrail (no queues, no auth, no microservices, plain npm workspaces, Compose
for local Postgres only, exactly one test, stock shadcn), and trips no §3 auto-reject
wire. One coverage hole is real and cheap to fix (F1); the rest are documentation-level
alignments.

---

## Check 1 — Coverage: R1–R12 → architectural home

| Req | Requirement (short) | Home in spine | Status |
|---|---|---|---|
| R1 | Node + Fastify + TS | Stack table; AD-1 | Covered |
| R2 | Postgres + Drizzle, real migration file | Stack table; AD-8; seed `server/drizzle/` "generated SQL migrations (committed — the 'real migration')" | Covered |
| R3 | React + Vite + TS + Tailwind + shadcn/ui | Stack table; seed `web/`; Deferred ("stock shadcn, no custom design system") | Covered |
| R4 | OpenAI SDK, JSON mode; vision for images | AD-12 (structured outputs framed as "the current form of the challenge's 'JSON mode'"; vision/native-PDF for `visual` class via AD-6) | Covered — see F2 |
| R5 | URL + uploaded PDF/image | AD-6 (source class), AD-11 (URL fetch), @fastify/multipart in stack, FG1 row of capability map | Covered |
| R6 | Per dish: name, price, allergens, **one-line description**, confidence flag | AD-2/AD-7/AD-8; ER `DISHES` has name, price_raw, price_value, allergens, confidence_reasons, flag — **no description column** | **Gap — see F1** |
| R7 | Persisted to Postgres + clean UI | AD-4 (persist-first), AD-8, web pages in seed, conventions (TanStack Query, shadcn) | Covered |
| R8 | Exactly one meaningful test, justified in DECISIONS.md | AD-13 (integration golden-master; title cites R8) | Covered — see F3 |
| R9 | Structured Pino logs | Conventions "Logging" row (Pino via Fastify, stage transitions + fired T-rules with run_id, NFR5) | Covered |
| R10 | BMAD drives planning + implementation; artifacts in repo | The spine itself, frontmatter `sources:` chain (PRD → spine), binds FR1–FR36 | Covered — see F4 |
| R11 | Every prompt in `prompts/` | Seed `prompts/`; AD-12 rule: runtime extraction prompt is "a versioned file surfaced in `prompts/` (R11)" | Covered |
| R12 | `.env.example` only, no keys ever | Conventions "Config" row (env-only, Zod fail-fast, `.env.example` complete reference, D12 gitleaks CI); seed `.env.example` | Covered |

## Check 2 — Guardrails: every AD judged against §4 / §6

| AD | Judgment | Verdict |
|---|---|---|
| AD-1 one service/SPA/DB | Directly enforces §4 lines 1–2 (no microservices, no queues) and cites REQUIREMENTS §4 | Divergence-preventer |
| AD-2 shared contract | Maps to §6 "Stack competence — idiomatic Zod" and §5 Zod signal; the `.pick()/.extend()` rule prevents real drift | Divergence-preventer |
| AD-3 pure core | Enables R6 confidence-flag derivation (§6 critical-thinking row) and the AD-13 test without a suite | Divergence-preventer |
| AD-4 persist-first | Maps to R7; explicitly bans SSE/WebSockets/background daemons | Divergence-preventer |
| AD-5 derived-at-read | Actively prevents §4-banned machinery (reaper jobs, cron) | Divergence-preventer |
| AD-6 source class | Maps to R4/R5; collapses per-file-type branching | Divergence-preventer |
| AD-7 arbiter dominance | Houses the PRD-ratified D4 confidence design (R6 "derivation is our documented choice"); normalization pinning prevents two-builder divergence | Divergence-preventer; PRD-inherited complexity, not spine invention — see F5 |
| AD-8 data ownership | Maps to R2/R7/NFR4; `source_artifacts` in Postgres avoids a second store (S3 would violate §4 deploy-infra cut) | Divergence-preventer |
| AD-9 immutable extractions | Maps to FG4/FR22–28 (PRD-bound); keeps audit trail honest | Divergence-preventer |
| AD-10 server-side 409 | Maps to FR8/FR35 (PRD-bound) | Divergence-preventer, minimal |
| AD-11 SSRF guard | No direct §1–§2 line, but binds FR36 (PRD) and feeds the §3 "what breaks in production" answer + JOB's "correctness ownership"; dependency-free, ~small; DNS-rebinding residual documented rather than solved — the right size | Justified — see F6 |
| AD-12 injected OpenAI seam | Required by AD-13's mock (R8) and R4; prompt-in-`prompts/` rule serves R11 | Divergence-preventer |
| AD-13 one golden-master | Enforces R8 in both directions ("prevents: a smuggled test suite"); CI `checks` job is exactly what §5 permits ("typecheck + the single test once code exists") | Divergence-preventer |
| AD-14 failure containment | Maps to PRD E-states / NFR5; prevents invented states | Divergence-preventer |

Guardrail sweep of non-AD sections: npm workspaces without Nx/Turbo/pnpm (seed comment)
complies with §4 "plain workspace layout"; Compose is Postgres-only; operational envelope
explicitly records the §4 deploy-infra cut; no Redis/BullMQ, no auth, no i18n/export
features, no custom design tokens (deferred to "stock shadcn"). Nothing in the stack table
lacks a consumer. §3 tripwires: no named over-engineering, secrets handling covered
(R12 + gitleaks), prompts first-class (R11 in AD-12), BMAD traceability present
(frontmatter binds + capability map), production-failure material explicitly banked
(AD-11 residual, AD-4 timeout policy, 400-dish truncation in Deferred).

---

## Findings

### F1 — MAJOR (coverage): `description` missing from the DISHES entity
- **Where:** Structural Seed ER diagram, `DISHES` block (spine lines ~253–262).
- **Lighthouse:** REQUIREMENTS §1 R6 — "Extracted per dish: name, price, allergens (list), **one-line description**, confidence flag". Also BRIEF.md task block, bullet 4.
- The only concrete dish schema in the spine omits one of the five hard-required fields.
  Everything else in R6 has a column (name, price_raw/price_value, allergens jsonb, flag).
  The Deferred section hands "Drizzle column details" to code, but an ER diagram that
  enumerates eight columns and skips a hard-required one will be read as the contract —
  and AD-2 makes `shared` schemas authoritative, so the omission can propagate.
- **Fix:** add `text description` to the DISHES entity in the ER diagram (and ensure the
  `shared` Dish base schema lists it). One-line change.

### F2 — MINOR (tripwire hygiene): "structured outputs" vs the brief's literal "JSON mode"
- **Where:** AD-12 rule.
- **Lighthouse:** §1 R4; BRIEF.md "OpenAI SDK with JSON mode".
- The spine's reading ("the current form of the challenge's 'JSON mode'") is technically
  right and the parenthetical is good, but the divergence from the brief's literal wording
  is exactly the kind of judgment call §6's critical-thinking row pays for — and, undocumented,
  the kind a reviewer might mis-read as a missed requirement.
- **Fix:** one DECISIONS.md line (structured outputs = strict-schema successor of JSON
  mode; why it satisfies R4). No spine change needed.

### F3 — MINOR (deliverable linkage): R8's justification lives in DECISIONS.md, spine doesn't say so
- **Where:** AD-13.
- **Lighthouse:** §1 R8 — "type chosen and **justified in DECISIONS.md**"; §7 checklist
  ("DECISIONS.md covers: single-test justification").
- AD-13 chooses and defends the type inside the spine, but the graded artifact for the
  justification is DECISIONS.md. Ensure the choice is (or will be) logged there; a
  pointer in AD-13 ("justification recorded as D-xx") closes the loop.

### F4 — LOW (coverage completeness): structural seed omits the non-code deliverables
- **Where:** Structural Seed tree (rooted at `/`).
- **Lighthouse:** §1 R10, §2 deliverables (DECISIONS.md, BUSINESS.md, README, BMAD
  artifact folders committed).
- The tree is rooted at repo `/` yet shows only code + `prompts/` + CI. The deliverable
  files already exist in the repo, so this is presentation, not a real gap — but a seed
  claiming the root should either show `_bmad-output/`, `DECISIONS.md`, `BUSINESS.md`,
  `README.md`, `docs/` or state it depicts only the code workspace.
- **Fix:** one comment line in the tree, or add the four entries.

### F5 — ADVISORY (over-engineering watch, not a violation): T1–T6 arbiter surface area
- **Where:** AD-7, AD-3, AD-13.
- **Lighthouse:** §4 guard question; §6 critical-thinking row; R6 ("your choice how to derive").
- Six rules + evidence-quote verification + pinned four-step normalization is the most
  sophisticated machine in the spine. It is PRD-ratified (D4) and it is the rubric's
  showcase for confidence derivation, so it stays — but it is the one place where build
  hours can silently multiply. The spine already contains the containment (pure functions,
  one fixture firing all rules). Keep the rules table-driven and resist per-rule
  configurability; if build-phase pressure appears, cutting a rule with a DECISIONS.md
  line is cheaper than shipping it half-tested.

### F6 — ADVISORY (guardrail note, resolved correctly): AD-11 SSRF guard has no direct §1–§2 line
- **Where:** AD-11.
- **Lighthouse:** §4 guard question; §3 "cannot explain what breaks in production"; §6
  independent-judgment row.
- Strictly applying the §4 guard question, AD-11 maps to no §1–§2 line — it maps to PRD
  FR36 and the production-failure narrative. Accepting URLs server-side without it would
  itself be a production-breaks answer given rather than engineered away, and the spine's
  version is dependency-free with a documented residual (DNS rebinding) instead of a
  solved one. This is the right size; flagged only so the DECISIONS/walkthrough material
  claims the credit ("what breaks in production: DNS rebinding — accepted, here's why").

## Not findings (checked and clean)

- No queue/worker/event-bus/websocket surface anywhere (AD-1, AD-4, AD-5 actively forbid them).
- No auth, roles, or accounts; no delete paths (AD-9 aligns with scope).
- Plain npm workspaces; Nx/Turbo/pnpm explicitly excluded in the seed.
- No deploy target, single env, Compose Postgres-only — §4 cut explicitly recorded in the operational envelope.
- Exactly one test; CI scope matches §5's permitted minimum, nothing beyond.
- Stock shadcn; design tokens deferred to code; no custom design system.
- Stack table has zero speculative rows — every entry traces to R1–R4, §5 signals, or a named AD.
- History pagination, SPA routing, model params correctly parked in Deferred rather than built.
