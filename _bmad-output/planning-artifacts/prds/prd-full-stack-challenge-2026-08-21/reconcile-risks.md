# Reconciliation — RISKS.md vs PRD (2026-08-21)

Input: `plan/RISKS.md` (12-risk register). Target: `prd.md` + `addendum.md` in this
directory. Scope per review charter: only risks whose mitigation/contingency touches
product territory — **R-02, R-03, R-06, R-10**. Process/schedule risks (R-01, R-04*,
R-05, R-07, R-08, R-09, R-11, R-12) are out of PRD scope and were not assessed as gaps.
(*R-04 is operational/budget; its product-visible edge — one-retry policy — appears in E7
"invalid JSON after one retry" and is consistent.)

**Verdict: 2 gaps.**

---

## Risk-by-risk assessment

### R-02 — LLM extraction quality poor on messy real menus → HONORED

- The PRD's core design *is* the mitigation: extraction-quality failure is routed to Ana
  through deterministic triage (FR15–FR21), not hidden. Doubt resolves toward `uncertain`
  (FR18); zero dishes is a defined terminal state distinct from failure (E9); partial
  extraction is explicitly not a failure state and omission-blindness is compensated by
  the Original tab (FR23 rationale, FR34).
- The mitigation's test-menu set surfaces in the PRD as the calibration source for FR5
  copy and the FR7 threshold (Open items).
- The model upgrade path (luna→terra, D3) is carried by NFR2's tier-dependent cost
  envelope.
- The contingency ("document failure classes honestly") is structurally pre-honored: E3,
  E6, and FR19's unverifiable image quotes are already written up as documented
  limitations. No gap.

### R-03 — URL fetching fails on JS-rendered / bot-blocking sites → GAP 1 (mitigation half-dropped, and contradicted)

The **contingency** is fully honored: no headless browser appears anywhere; E3 is exactly
"documented limitation + point to the PDF/photo path"; E2 offers the same fallback.

The **mitigation** is not: R-03 prescribes "server-side fetch with realistic headers,
**size/time caps**". Realistic headers are legitimately architecture mechanics (FR36
routes fetch mechanics there). But the caps were silently dropped — and worse, the PRD
now *forecloses* one of them:

- **FR6** states: "The only timeout in the system is on the model call (~120 s) ... No
  client- or route-level timeouts exist." Taken literally, the server-side URL fetch has
  **no time bound** — a hanging host or slow-loris response stalls `fetching_source`
  indefinitely. The run degrades to FR7's 3-minute staleness *rendering*, not a clean E2
  failure, while the in-process promise stays hung; under FR35 (one active run) this is
  the worst waiting experience the PRD's own Operating Principle exists to prevent.
- **No size cap on fetched content exists anywhere.** FR2's 10 MB cap covers *uploads*
  only. A URL pointing at an arbitrarily large response has no stated bound.
- **Internal contradiction:** E2 itself lists "timeout" among unreachable-URL causes —
  the failure-state inventory presupposes a fetch timeout that FR6 says does not exist.

**Suggested repair:** scope FR6's claim to what the ADR actually argued (no *HTTP
request-lifetime* timeouts — the browser never waits on a long-lived request), and add
fetch time/size caps either to FR36 or to Open items alongside the SSRF mechanics. This
restores R-03's mitigation without touching the persist-first ADR.

### R-06 — Over-engineering creep → HONORED (exemplary)

Constraints reference REQUIREMENTS.md §4 guardrails explicitly. The Scope "Out" list and
the addendum's recorded cut lists (queue/worker, SSE/WS, dynamic ETA, percentage bar,
resumable extraction, idempotency keys, reaper, pdf.js, synced auto-scroll, change
journals, history search) each carry reasoning. The contingency ("cut on discovery,
record in DECISIONS.md") is the PRD's visible working method — the processing-model and
description-policy evolutions are recorded as course-corrections. No gap.

### R-10 — Reviewer can't run the app in <5 min → GAP 2 (one dependency commitment escaped the vetting pattern)

The PRD applies R-10's "no exotic system deps" test conscientiously in two places: FR1
tags HEIC conversion `[VERIFY AT ARCHITECTURE]` with "never native system deps — R-10"
(addendum: WASM fallback), and FG4 chooses browser-native PDF embed with "zero client
dependencies". Docker-for-Postgres-only is a repo concern, correctly absent.

But **FR2 commits to server-side image downscaling** ("optimizing what reaches the model
(server-side downscaling) is the system's job, not hers"), reiterated in the addendum
("server downscales images before the vision call") — and this is the **one dependency
commitment never checked against R-10**. The dominant Node implementation (sharp) ships
native binaries; pure-JS/WASM alternatives exist but are slower and were not named. Unlike
HEIC, downscaling has no `[VERIFY]` tag, no no-native-deps constraint, and no Open-items
row. Not necessarily wrong — sharp's prebuilt binaries usually install cleanly — but the
PRD's own pattern (vet every dependency choice against the 5-minute README) was silently
skipped here, and R-06 is also adjacent: downscaling is an optimization, not a
requirement of correctness, so it should at minimum be demotable.

**Suggested repair:** add an Open-items row ("image downscaling lib — same no-native-deps
constraint as HEIC; downgrade to pass-through if it threatens fresh-clone install") or
soften FR2's downscaling clause from commitment to intent.

---

## New risks the PRD creates — checked, none unnamed

- **SSRF via the URL field:** a genuinely new risk the register doesn't list — but the
  PRD *itself* names and routes it (FR36 + Open items). Credit, not a gap.
- **In-process run dies with server crash:** consciously accepted in the addendum ADR
  (redo, don't resume — $0.003/1 min), with staleness rendering as the honest surface.
  Register's R-11 spirit is respected. Routed.
- **URL-source evidence decay** (Original tab is an external link; live pages change —
  Ana's defensibility is weaker for URL sources): the PRD discloses it honestly in FR23
  and persists the acquired source text as partial compensation. Routed as a documented
  limitation.
- **Hung-fetch lockout under FR35** (one active run + no fetch timeout): real, but it is
  a *consequence* of Gap 1, not an independent new risk; fixing Gap 1 dissolves it.
- Unbounded storage growth under FR31 (no delete, all bytes persisted) was considered and
  dismissed: single-operator demo scope, no PII (NFR4), trivial volumes.

## Summary table

| Risk | Verdict | Note |
|---|---|---|
| R-02 | Honored | Triage design + E-states + calibration on test menus + NFR2 tier path |
| R-03 | **Gap 1** | Fetch size/time caps dropped; FR6 forecloses fetch timeout; E2 contradicts FR6 |
| R-06 | Honored | Guardrails referenced; cuts recorded with reasons |
| R-10 | **Gap 2** | FR2 server-side downscaling dependency never vetted against no-native-deps rule |
| New risks | None unnamed | SSRF self-named (FR36); crash-loss consciously accepted; evidence decay disclosed |
