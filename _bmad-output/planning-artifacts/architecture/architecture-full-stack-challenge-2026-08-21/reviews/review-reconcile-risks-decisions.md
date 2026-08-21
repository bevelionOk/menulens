# Reconciliation Review — ARCHITECTURE-SPINE vs RISKS.md (R-01..R-12) and DECISIONS.md (D1–D15)

- **Reviewer:** reconciliation lane (risks + decisions)
- **Date:** 2026-08-21
- **Artifact under review:** `ARCHITECTURE-SPINE.md` (draft, 2026-08-21)
- **Inputs:** `plan/RISKS.md`, `DECISIONS.md`

## Verdict: **pass-with-fixes**

The spine is broadly faithful to both registers. Every architecture-touching risk
mitigation is either carried verbatim or strengthened (SSRF guard, artifact isolation,
one-retry, secrets conventions, single-test discipline), and no spine statement flatly
contradicts a closed decision. The two declared evolutions (AD-13 test shape, AD-6/E6
elimination) are coherent in substance. The fixes needed are: one settled-as-fact claim
that D15 left contingent on a verification the spine never records (E6), one closed
decision silently absent from the spine (D14 descriptions), and two smaller carry-gaps.

---

## Part 1 — Risk register reconciliation

### R-02 · LLM extraction quality — **respected**

Mitigations carried: model upgrade path luna→terra via env (AD-12, citing D3); the
runtime extraction prompt as a versioned file in `prompts/` (AD-12, supports the
prompt-iteration protocol); class threshold "calibrated on dev test menus" (Deferred)
presumes the day-one test-menu set. Contingency (documenting failure classes honestly)
is compatible with AD-14's closed failure-reason inventory. No weakening found.

### R-03 · URL fetching fails on JS-rendered / bot-blocking sites — **respected, one carry-gap**

Carried: server-side fetch with size/time caps surfacing as E2/E3 (AD-4, AD-11 — AD-11
cites R-03 explicitly); no headless browser appears anywhere in the spine (guardrail
held); upload remains the fallback ingestion path (FG1 mapping).

**Finding F3 (LOW):** the register's mitigation names "realistic headers" on the
server-side fetch; neither AD-4 nor AD-11 carries it. AD-11 is written as the *security*
rule for the fetch; the *compatibility* half of the R-03 mitigation (headers that don't
scream bot) has no home in the spine and could be silently dropped by a builder
implementing AD-11 to the letter. One clause in AD-11 (or the conventions table) fixes it.

### R-04 · OpenAI outage / rate limits / key exhaustion — **respected**

Budget-tier default (dev `gpt-5.6-luna`) in AD-12; "one-retry policy, no loops" carried
as "invalid output gets exactly one retry, then `failed`" (AD-12) and "retry = new run"
(AD-4) — no automatic retry loops anywhere; the single ~120 s timeout bounds hang
exposure (AD-4). Note the register's one-retry is about API failure and AD-12's is about
invalid output; both paths terminate in `failed` with no loop, so the policy's intent
(bounded spend, no runaway) is preserved.

### R-05 · Secret leak (auto-reject) — **respected**

Conventions: env vars only, fail-fast Zod validation at boot, `.env.example` as the
complete reference, "no secrets in repo (D12 gitleaks CI)"; CI section keeps gitleaks on
every push. Nothing in the spine stores or logs a key (logging convention logs stage
transitions and T-rules, not config).

### R-06 · Over-engineering creep (auto-reject) — **respected**

The spine is structurally on the right side of this: AD-1 explicitly *prevents* a second
runtime piece; AD-13 caps testing at one test; the Deferred list pushes seven decisions
down instead of resolving them speculatively; the D13 cut list (queue, SSE, reaper,
idempotency keys) is honored by AD-1/AD-5/AD-10; stock shadcn, no custom design system;
plain npm workspaces. No spine element re-introduces a recorded cut.

### R-10 · Reviewer can't run the app in <5 min — **respected in structure, weakened by one dependency claim (see F1)**

Carried: Docker Compose for Postgres only; `npm run dev` two-process dev loop; no exotic
system deps — pdfjs-dist is pure JS, consistent with "a factor in PDF-path decision".
**However**, the scanned-PDF path (AD-6 `visual` class → AD-12 "vision/native-PDF
input") depends on the OpenAI native-PDF input working as assumed — see Finding F1. If
that assumption fails and the fallback is local rasterization, the fix would drag in
native system deps, which is precisely what D15 says endangers the 5-minute README.
R-10 is respected only as long as F1 holds.

### R-12 · Scope misread — **respected**

The spine binds FR1–FR36 + NFR1–NFR5, lists the PRD, addendum, REQUIREMENTS.md, RISKS.md
and DECISIONS.md as sources, and records the operational-envelope cut against
REQUIREMENTS §4. Nothing in the spine invents scope beyond the bound FRs.
(*Informational, outside this artifact:* D12's text cites the secrets tripwire as "R12";
in the register that is R-05 — a mis-cite in DECISIONS.md, not in the spine.)

### Other register rows

R-01 (schedule) — touched only indirectly; see F4. R-07/R-08/R-09/R-11 — process/video
risks with no architecture surface; nothing in the spine affects them. R-11's heartbeat
policy governs sessions, not the app; the spine correctly stays silent.

---

## Part 2 — Decision-log reconciliation

| Decision | Spine status |
| --- | --- |
| D1 prompt logging | Consistent — `prompts/` in the structural seed holds the session log *and* the runtime prompt (AD-12/R-11 tie-in). |
| D2 single-threaded / no orchestration | Not touched by the spine (correct — build-process decision). |
| D3 model strategy | Carried exactly: env-driven dev luna / final terra, cited in AD-12. |
| D4 confidence flag (CLOSED) | Carried in full: signals-only model, T1–T6 final arbiter, T6 downgrade before triage, `confidence_reasons` persisted (AD-3, AD-7). Test-shape evolution: see below. |
| D5–D9 (repo, video, deadline, Notion) | No architecture surface; no contradiction. |
| D10 ~3-min target | Consistent — waiting-UI convention (static expectation copy, no ETAs) and the 30–90 s copy deferred for calibration. |
| D11 cuts | Honored: review fields are status + note + decided-at timestamp only — no reviewer identity (AD-9); no flag-rate analytics anywhere. |
| D12 minimal CI | Carried exactly: one workflow, gitleaks + `checks` (typecheck + the one test) added when scaffold lands. |
| D13 persist-first (CLOSED) | Carried exactly and cited by name in AD-4; every D13 cut (queue, SSE, reaper, idempotency keys, resumability) stays cut (AD-1, AD-5, AD-10). |
| D14 descriptions provenance (CLOSED) | **Silently absent — Finding F2.** |
| D15 finalize-gate outcomes | E6 justification carried into AD-6; T4/T6 scoping generalized image→`visual` class coherently; speculative mechanisms (downscaling, HEIC lib) stay out. **But** the E6 verification precondition is not discharged — Finding F1. |

### Declared evolution 1 — single test: unit-arbiter → integration golden-master (AD-13) — **coherent**

D4 closed with "T1–T6 is the leading candidate for the single test (R8) — formal
justification lands in the architecture phase." That wording explicitly delegated the
final shape to this artifact, so AD-13 is the promised resolution, not a contradiction.
The evolution is substantively coherent: AD-13's *Prevents* line names "the arbiter
losing coverage," and the rule requires the mocked model response to fire **every rule
T1–T6 including the T6 downgrade plus one reliable row** — the golden-master strictly
subsumes the unit-arbiter candidate's coverage while also exercising API, pipeline,
persistence, and polling. **Finding F5 (INFO):** AD-13 never cites D4's front-runner
language, so the reader must reconstruct the lineage; one clause ("subsumes D4's
unit-arbiter candidate: same rules fired, through the real pipe") would close the loop
that D4 explicitly left open for "formal justification."

### Declared evolution 2 — E6 eliminated via source-class invariant (AD-6) — **coherent in design, unproven in fact (F1)**

AD-6's `text | visual` class is a genuine improvement over the D15-era per-file-type
framing: it removes the scanned-PDF hole by construction and generalizes D4's
"T6 scoped to text sources; images verified by Ana" to class-keyed verification —
exactly the direction D15's gate fix pointed. The redirect rule (final content-type
decides) is a good hardening. The problem is not the design but the discharge of D15's
stated precondition — see F1.

---

## Part 3 — Findings

### F1 · MEDIUM — E6 elimination stated as settled while D15 left it contingent on an unrecorded verification

D15: "a zero-dep OpenAI native-PDF input is **queued for verification in architecture —
a yes eliminates E6**." The spine asserts the outcome ("E6 is eliminated", AD-6;
"vision/native-PDF input for `visual`-class runs", AD-12) but records neither the
verification result nor a fallback, and the Deferred list — which *does* defer the
adjacent `zodTextFormat` compatibility question with an explicit fallback — is silent on
native-PDF input. If the assumption fails at build time, the obvious fallback
(rasterize locally) reintroduces native system deps, which D15 itself names as the
R-10 threat. **Fix:** either record the verification (SDK/model support for PDF file
input confirmed, date, source) in the spine or DECISIONS.md, or move "native-PDF input
support" into Deferred with a named zero-dep fallback (e.g. pdfjs page render to PNG is
*not* zero-risk — decide and write it down). Until then the spine silently converts a
conditional decision into a fact.

### F2 · MEDIUM (low-side) — D14's provenance-labeled descriptions are absent from the spine

D14 (CLOSED) requires every dish description to carry provenance `extracted | generated`
(visibly labeled) and states the rule "description provenance never touches the
confidence gate." The spine never mentions descriptions: the `DISHES` entity in the ER
diagram has no description/provenance fields, `shared`'s enumerated contract contents
(AD-2) don't include it, and no AD owns the "never touches the gate" rule. The ER
diagram is avowedly abbreviated (Drizzle details deferred), so this is omission rather
than contradiction — but D14's gate-isolation rule is exactly the kind of invariant the
spine exists to hold, and AD-7's closed T1–T6 list only *implicitly* excludes
description provenance from triage. **Fix:** one line — add description + provenance to
the AD-2 contract inventory (or the ER sketch) and a clause in AD-7 or AD-9 that
description provenance is display metadata, never a triage input (D14).

### F3 · LOW — R-03's "realistic headers" mitigation not carried

AD-11 covers the security half of the URL fetch; the compatibility half of the R-03
mitigation (realistic request headers to reduce bot-blocking) appears nowhere. Add a
clause to AD-11 or the conventions table so the builder doesn't ship a bare
`undici`-default fetch that fires R-03 more often than the register planned for.

### F4 · LOW — New risk not in the register: fresh-major toolchain convergence

The stack table knowingly rides several fresh majors (TS 7.0.2 "a fresh major", Vite 8,
Zod 4, openai SDK 7) and the spine's own Deferred list already hedges one interaction
(`zodTextFormat` × Zod 4). The register has no row for "scaffold-time ecosystem
incompatibility burns schedule near the deadline" — it is R-01-adjacent but distinct,
because the spine *chose* the exposure. Mitigation is partially in place
("scaffold-pinned, never hand-upgraded"); what's missing is a register row or a spine
sentence naming the contingency (fall back to the previous major at scaffold time if the
combo fights). Recommend adding it to RISKS.md rather than growing the spine.

### F5 · INFO — AD-13 evolution lineage implicit

See Part 2. Coherent and coverage-preserving; add one clause citing D4's unit-arbiter
front-runner so the "formal justification lands in the architecture phase" promise is
visibly discharged.

### Checked and clean (no finding)

- Artifact serving (AD-8): user-supplied bytes served with nosniff + MIME allowlist —
  the spine mitigates a stored-content risk the register never carried; no gap.
- DNS rebinding: named as an accepted, documented residual (AD-11) — correctly carried,
  not silently ignored.
- Server restart mid-run: covered by AD-5's read-time staleness net; no reaper needed —
  consistent with D13's cut.
- Seriality race: AD-10 makes 409 server truth; UI mirror only — no new race risk.
- `bytea` artifacts in Postgres: bounded by fetch/upload size caps, excluded from list
  queries; acceptable at this scope, no register row needed.
