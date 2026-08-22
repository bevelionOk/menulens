# Deferred Work

Collected by build reviews for later focused attention. Append-only.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Story 1.8 must decide coverage for the env fail-fast branch — either a sub-assertion inside the single golden-master test file (spawn server entry with stripped env, assert non-zero exit + variable named in stderr) or an explicit DECISIONS.md record that this branch stays manual-only.
  evidence: Verification-gap review — the invalid-env branch (`server/src/env.ts`) is the only nontrivial runtime behavior of story 1.1 and no automated check will ever execute it: CI runs typecheck only, and the planned 1.8 golden-master runs only under a valid environment.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Add a Postgres healthcheck / wait-for-ready to docker-compose.yml when a story first depends on DB readiness (1.2 migration or 1.8 CI test), not before.
  evidence: Review — `docker compose up -d` reports success before Postgres accepts connections; harmless in 1.1 (nothing connects) but the foundation file is where the wait-for-ready contract belongs once consumers exist.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-project-scaffold-foundations.md`
  summary: Widen `server/tsconfig.json` `include` (currently `["src"]`) when the golden-master test lands so `server/test/` is typechecked in CI.
  evidence: Review — the seeded `server/test/` directory sits outside typecheck coverage; in 1.8 the single test would silently escape the CI `checks` job's typecheck unless the include is widened then.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: Decide in Story 1.8 whether the CI `checks` job gets a schema/migration drift guard (`npm run -w server db:generate` followed by `git diff --exit-code server/drizzle`, or `drizzle-kit check`) — weigh it against R8 (exactly one automated test) before adding; it is a build-time consistency check like typecheck, not a test, but the distinction must be argued in DECISIONS.md.
  evidence: Verification-gap review — `server/drizzle/*.sql` is generated manually from `server/src/db/schema.ts`; nothing in CI executes either, so an edit to `schema.ts` without regenerating ships with a green `checks` job and fails at the first runtime query (1.3+). The repo round-trip itself (createRun → insertDishes → getRunWithDishes ordering) is covered by the 1.8 golden-master by design.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: When Story 1.3 issues the first request-path query, decide a `connectionTimeoutMillis` for the pg Pool (fail fast with an honest 5xx when Postgres is unreachable) instead of the driver default of waiting indefinitely.
  evidence: Edge-case review — `server/src/db/client.ts` creates `new Pool({ connectionString })` with no connection timeout; with Postgres down, route handlers would hang rather than fail, which contradicts AD-14 failure containment ("what breaks in production" material).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-shared-contract-data-layer.md`
  summary: The CI `checks` job (1.8) must export a dummy `OPENAI_API_KEY` for `db:migrate` — the runner imports `env.ts`, whose fail-fast schema requires the key even though migrations never use it.
  evidence: Implementation note — `server/src/db/migrate.ts` imports `./client`, which imports `../env`; without the variable the process exits 1 naming `OPENAI_API_KEY` before any migration runs.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-persist-first-run-lifecycle-api.md`
  summary: Story 1.5 must keep the worst-case `extracting` stage (model timeout ~120 s × one retry) below `RUN_STALE_AFTER_MS` (default 180 s) — either cap retry+timeout under the threshold, bump the anchor between attempts, or raise the default with a DECISIONS.md note.
  evidence: Edge-case review — a live run whose single stage outlasts the staleness threshold reads as `interrupted` and unblocks a second POST while the first still writes; two 120 s attempts already exceed 180 s.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-persist-first-run-lifecycle-api.md`
  summary: Story 1.6 should write dishes and the terminal `done`/`empty` status in one transaction — call `setTerminal(tx, …)` inside the `insertDishes` transaction rather than `finishRun` after it (or give `finishRun` an optional `tx`).
  evidence: Edge-case review — `finishRun` opens its own write; a crash between `insertDishes` and `finishRun` leaves dishes on a run still `processing` (reads `interrupted` with rows), the inverse order leaves a `done` run with zero dishes.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-persist-first-run-lifecycle-api.md`
  summary: The 1.8 golden-master should cover the terminal-state read path — a `done` run older than the threshold reads `state: 'done'` (never `interrupted`) and does not 409 the next POST.
  evidence: Verification-gap review — every run the 1.3 manual verification created stayed `processing`; dropping the `status === 'processing'` guard in `deriveState` or the gate query would pass every curl in the spec's Verification list and only surface once 1.4–1.6 finish runs.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-source-acquisition-class-decision.md`
  summary: Story 1.8 should pin the SSRF refusal rule (`server/src/core/ssrf.ts` `isRefusedAddress`) with a table-driven check inside the single test file — or argue in DECISIONS.md why the security rule stays manual-only — covering 127/8, 10/8, 172.16–31, 169.254.169.254, 0/8, `::1`, `::`, fc00::/7, fe80::/10, `::ffff:10.0.0.1`, unparseable input, and two public addresses.
  evidence: Verification-gap review — narrowing `b <= 31` to `b < 31`, dropping the mapped-v4 branch, or flipping the unparseable default to `false` compiles cleanly and no check in the repo (CI = typecheck + gitleaks) would observe it; the rule is the story's whole security claim (AD-11, AC1/AC2).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-4-source-acquisition-class-decision.md`
  summary: The 1.8 golden-master must observe the route→pipeline wiring and the upload-bytes preservation — after POSTing the fixture, assert `stage`/`source_class`/`failure_reason` per the 1.4 matrix row exercised and that `length(source_artifacts.bytes)` is unchanged by acquisition (`upsertArtifact` omits `bytes` from the conflict set only when `undefined`).
  evidence: Verification-gap review — deleting `void runPipeline(...)` in `routes/runs.ts` reproduces the pre-1.4 behaviour (every run `interrupted`) with typecheck green, and replacing the conditional `set` with `{ ...rest, bytes: bytes ?? null }` types fine yet would wipe every uploaded file's bytes on acquisition; nothing in the repo would fail.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-5-extraction-adapter-the-openai-seam.md`
  summary: Story 1.8 must decide how the adapter's own contract — exactly one retry on invalid output, `onRetry` awaited only before attempt 2, usage summed across attempts, `APIConnectionTimeoutError` mapped before `APIError` (it is a subclass), text-class never sends the file — gets pinned: the golden-master mocks `extract` *above* the adapter, so none of this runs in CI; either a stub-client sub-assertion inside the single test file or an explicit DECISIONS.md record that the adapter stays verified by the logged real runs only.
  evidence: Verification-gap review — reordering the `instanceof` checks, changing the loop bound to 3 attempts, or sending a text-class PDF as `input_file` all compile and pass every CI gate; `createExtractionAdapter` is referenced only from `index.ts`.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: Story 1.8 must assert the evidence offsets themselves — `acquired_text.slice(match.start, match.end)` equals the quoted substring — with at least one accented (NFD) row and one row whose text carries an emoji before the match.
  evidence: Verification-gap review — replacing the offset mapping with normalized indices changes no flag, reason, status or row count; every acceptance criterion in the story still passes while the 2.4 highlight silently points at the wrong span. The review found the mapping was in fact already broken for astral characters (it threw `RangeError` and killed the run); nothing in the repo would have observed it.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: Story 1.8 must assert `parsePrice`'s returned `{ value, currency }` over the matrix inputs, not only which T-rules fired.
  evidence: Verification-gap review — changing the rounding to `Math.round(value)` turns `"12,50 €"` into `13` with `flag: reliable`, no rule fired and every stage/status observable unchanged; the whole `eur` vs `none` distinction is likewise unobservable from the arbiter's outputs.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: Story 1.8 must pin the `saving` atomicity — force the dish insert to fail and assert zero `dishes` rows and `runs.status = 'processing'`.
  evidence: Verification-gap review — dropping the fourth argument at `run-pipeline.ts` (`finishRun(log, runId, { status: 'done' })`) typechecks, the happy path is identical, and the transaction guarantee this story exists to add is silently gone.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: Decide (Ask-First) how an ambiguous decimal/thousands separator is treated — `"1.250 €"` currently parses to `1.25` and `"12,345 €"` to `12.35`, both able to reach Ana as `reliable`.
  evidence: Verified in the scratchpad matrix. The spec's Ask-First list names "thousands-separator heuristics", so the arbiter cannot widen the rule on its own; the honest fix is to refuse (T2) when the single separator is followed by exactly three digits or more than two decimals, which is a refusal rather than a guess.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: Decide (Ask-First) whether the pinned normalization chain should drop default-ignorable characters (soft hyphen U+00AD, ZWSP U+200B, BOM U+FEFF) before matching.
  evidence: Edge-case review, reproduced: `findNormalized('con­tiene gluten', 'contiene gluten')` returns `null`, and `html-to-text.ts` itself decodes `&shy;` into the ground text — so the pipeline manufactures false T6 downgrades and false T4s on rows that are correct. Widening the chain is frozen by D20/AD-7.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: `finishRun` emits `run finished` inside the `saving` transaction, before the commit — a rolled-back transaction still leaves a log line claiming `status: done`.
  evidence: Blind and verification-gap reviews — NFR5 makes the Pino stream the operational record; the story's own manual atomicity check would show a success line for a run that stayed `processing`. Fix: emit the terminal line after the transaction returns, or hand `finishRun` the commit boundary.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-6-triage-core-the-deterministic-arbiter.md`
  summary: `setTerminal`/`setStage` do not report how many rows their guarded UPDATE matched, so a `saving` transaction could commit dish rows onto a run that is no longer `processing`.
  evidence: Edge-case review — the guard `and(eq(runs.id, id), eq(runs.status, 'processing'))` silently no-ops; only a second writer can trigger it and none exists today (the staleness net derives `interrupted`, never writes), which is why this is deferred rather than patched. Fix: return the rowcount and throw inside the transaction.
