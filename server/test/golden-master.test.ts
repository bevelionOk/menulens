import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { FastifyInstance } from 'fastify';
import {
  createRunResponseSchema,
  errorEnvelopeSchema,
  ruleIdSchema,
  type RunDetail,
  runDetailSchema,
  runListResponseSchema,
} from 'shared';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { z } from 'zod';
import { buildApp } from '../src/app';
import { normalizeForMatch } from '../src/core/normalize';
import { db, pool } from '../src/db/client';
import { dishes, runs, sourceArtifacts } from '../src/db/schema';
import { getArtifact } from '../src/db/source-artifacts-repo';
import type { ExtractFn, ExtractionInput } from '../src/pipeline/extraction-adapter';
import { MOCKED_EXTRACTION } from './fixtures/extraction';
import { buildMenuPdf, MENU_LINES } from './fixtures/menu-pdf';

// THE ONE TEST (R8). One end-to-end golden-master over the one path the product is: a
// real upload through the real HTTP surface, real acquisition (pdfjs over real bytes),
// the real arbiter, a real Drizzle transaction into a real Postgres, and the real read
// path. The model seam is the only mock (AD-12) — no network, no OpenAI, no cost.
//
// Everything asserted below is a claim about THIS run's own observable payload. Claims
// that would need a different fixture, a different entry point or a failure injection
// (the SSRF refusal table, the adapter's retry/timeout semantics, the env fail-fast
// branch, the `saving` rollback) are deliberately not smuggled in — DECISIONS.md records
// them as verified by the logged manual runs, with the argument written down.

const GOLDEN = JSON.parse(readFileSync(new URL('./golden-master.json', import.meta.url), 'utf8')) as {
  detail: unknown;
  list_row: unknown;
  after_review: unknown;
};

const BOUNDARY = 'goldenmasterboundary';
// A run seeded before the fixture's, so "newest first" has something to be wrong about.
const OLDER_RUN_CREATED_AT = new Date('2026-08-01T09:00:00.000Z');

const pdf = buildMenuPdf(MENU_LINES);
const seen: ExtractionInput[] = [];
// The seam blocks until the test releases it, so the run is *definitively* still
// `processing` when the 409 assertion fires — a timing race would make that gate's
// coverage a coin flip.
let releaseExtract: () => void = () => {};
const extractReleased = new Promise<void>((resolve) => {
  releaseExtract = resolve;
});
const extract: ExtractFn = async (input) => {
  seen.push(input);
  await extractReleased;
  return MOCKED_EXTRACTION;
};

const app: FastifyInstance = buildApp({ extract });
let olderRunId: string;

// Truncating is how this test gets a known world — the seriality gate reads the newest
// `processing` run repo-wide and the list assertion reads every row. That is fine against
// a database that exists for tests and unacceptable against the one holding a developer's
// real history, so it is a guarded operation, not a documented hazard.
function assertDatabaseIsDisposable(url: string): string {
  const name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
  if (process.env.CI) return name;
  if (name.endsWith('_test')) return name;
  throw new Error(
    `Refusing to run: this test truncates every row in "${name}", and that database is not marked disposable.\n` +
      'Set TEST_DATABASE_URL to a database whose name ends in `_test` — `.env.example` already\n' +
      'carries the right value, and docker-compose.yml creates that database on first start:\n' +
      '  TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/menu_extraction_test\n' +
      'If the Postgres volume predates that, create it once:\n' +
      '  docker compose exec postgres psql -U postgres -c "CREATE DATABASE menu_extraction_test"\n' +
      '(CI sets CI=true and gets a fresh service container, so it needs no suffix.)',
  );
}

beforeAll(async () => {
  assertDatabaseIsDisposable(process.env.DATABASE_URL!);
  // The test owns its database, so it applies the committed migrations itself rather than
  // asking the reader to run `db:migrate` twice with two different URLs. Idempotent (the
  // drizzle journal records what ran), and it means the run below is driven against a
  // schema built the same way a fresh clone builds one.
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });
  await db.delete(dishes);
  await db.delete(sourceArtifacts);
  await db.delete(runs);
  // Seeded directly, terminal so it never touches the 409 gate: the list's newest-first
  // ordering is only observable with more than one row in the table.
  const [older] = await db
    .insert(runs)
    .values({
      source_type: 'url',
      source_ref: 'https://example.test/carta-anterior',
      status: 'done',
      stage: 'saving',
      created_at: OLDER_RUN_CREATED_AT,
      stage_changed_at: OLDER_RUN_CREATED_AT,
    })
    .returning({ id: runs.id });
  olderRunId = older!.id;
});

afterAll(async () => {
  // Unconditional: a throw anywhere above would otherwise leave the pool open and hang
  // Vitest until its timeout instead of reporting the failure.
  releaseExtract();
  await app.close();
  await pool.end();
});

function multipartBody(bytes: Buffer, filename: string, contentType: string): Buffer {
  return Buffer.concat([
    Buffer.from(
      `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
        `Content-Type: ${contentType}\r\n\r\n`,
    ),
    bytes,
    Buffer.from(`\r\n--${BOUNDARY}--\r\n`),
  ]);
}

function uploadFixture() {
  return app.inject({
    method: 'POST',
    url: '/api/runs',
    headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
    payload: multipartBody(pdf, 'carta-la-parra.pdf', 'application/pdf'),
  });
}

// Status first, then the body against the schema `shared` publishes — the same contract
// the web client compiles against. Casting the JSON would leave every field the golden's
// normalization drops (ids, `created_at`, `stage_changed_at`) unchecked, and a
// `created_at` that stops being ISO-8601 breaks the UI's elapsed timer while failing
// nothing here.
function body<T>(
  schema: z.ZodType<T>,
  res: { statusCode: number; payload: string; json: () => unknown },
  expectedStatus: number,
  what: string,
): T {
  // `payload`, not `json()`: a body that is not JSON at all must still reach the message.
  expect(res.statusCode, `${what} answered ${res.statusCode}: ${res.payload.slice(0, 400)}`).toBe(expectedStatus);
  const parsed = schema.safeParse(res.json());
  if (!parsed.success) {
    throw new Error(`${what} does not match the shared contract:\n${JSON.stringify(parsed.error.issues, null, 2)}`);
  }
  return parsed.data;
}

// The pipeline is fire-and-forget (AD-4): the POST returns before any stage runs, so the
// test watches the run exactly the way the UI does — by re-reading it.
async function pollUntilSettled(runId: string): Promise<RunDetail> {
  const deadline = Date.now() + 30_000;
  let last: RunDetail | null = null;
  while (Date.now() < deadline) {
    last = body(runDetailSchema, await app.inject({ method: 'GET', url: `/api/runs/${runId}` }), 200, 'GET /api/runs/:id');
    if (last.state !== 'processing') return last;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`run ${runId} never left processing (last stage: ${last?.stage ?? 'none'})`);
}

// The golden's shape: the payload with ids and timestamps normalized out, rows in
// `position` order. Evidence offsets travel as the text they point at — the assertion
// that they still slice back to the quote is made explicitly below as well, so a broken
// offset mapping fails twice and both failures name the row.
function normalizeDetail(detail: RunDetail, acquiredText: string) {
  return {
    run: normalizeRun(detail),
    dishes: detail.dishes.map((dish) => ({
      position: dish.position,
      name: dish.name,
      price_raw: dish.price_raw,
      price_value: dish.price_value,
      allergens: dish.allergens.map((entry) => ({
        id: entry.id,
        provenance: entry.provenance,
        evidence_quote: entry.evidence_quote,
        match_text: entry.match === null ? null : acquiredText.slice(entry.match.start, entry.match.end),
      })),
      description: dish.description,
      description_provenance: dish.description_provenance,
      confidence_reasons: dish.confidence_reasons,
      flag: dish.flag,
      review_status: dish.review_status,
      followup_note: dish.followup_note,
      reviewed_at: dish.reviewed_at === null ? null : '<timestamp>',
    })),
  };
}

function normalizeRun(run: Omit<RunDetail, 'dishes'>) {
  return {
    source_type: run.source_type,
    source_ref: run.source_ref,
    source_class: run.source_class,
    status: run.status,
    stage: run.stage,
    failure_reason: run.failure_reason,
    state: run.state,
    dish_count: run.dish_count,
    review_progress: run.review_progress,
  };
}

// `reviewed_at` is normalized to a literal in the golden, so its value has to be checked
// before it is thrown away: epoch 0 or a timestamp left over from an earlier verdict
// would normalize to exactly the same `<timestamp>`.
function assertReviewTimestamps(detail: RunDetail): void {
  const born = Date.parse(detail.created_at);
  const stamped = detail.dishes.filter((dish) => dish.reviewed_at !== null);
  expect(stamped.length, 'no dish carries a reviewed_at, so the timestamp check proves nothing').toBeGreaterThan(0);
  for (const dish of stamped) {
    const at = Date.parse(dish.reviewed_at!);
    expect(Number.isFinite(at), `reviewed_at for "${dish.name}" is not a parsable date: ${dish.reviewed_at}`).toBe(true);
    expect(at, `reviewed_at for "${dish.name}" (${dish.reviewed_at}) predates the run itself`).toBeGreaterThanOrEqual(born);
  }
}

// The review fields, removed — what is left must be byte-identical before and after a
// review, because a review may never touch an extracted value (2.1 AC2).
function withoutReviewFields(golden: ReturnType<typeof normalizeDetail>) {
  const { review_progress: _progress, ...run } = golden.run;
  return {
    run,
    dishes: golden.dishes.map(({ review_status: _s, followup_note: _n, reviewed_at: _r, ...rest }) => rest),
  };
}

test('golden master: one menu upload, through the real API and Postgres, with only the model seam mocked', async () => {
  // --- the run -------------------------------------------------------------------------
  const { id: runId, status } = body(createRunResponseSchema, await uploadFixture(), 201, 'POST /api/runs');
  expect(status).toBe('processing');

  // The seriality gate (AD-10), while the seam is still held open so the run is provably
  // active: a second source must be refused, not queued and not silently accepted.
  const blocked = body(errorEnvelopeSchema, await uploadFixture(), 409, 'POST /api/runs while a run is active');
  expect(blocked.error.code).toBe('run_active');
  expect(blocked.error.message).toContain(runId);

  releaseExtract();
  const detail = await pollUntilSettled(runId);
  expect(detail.state, `run settled as ${detail.state} at stage ${detail.stage}`).toBe('done');

  // --- what acquisition handed the seam --------------------------------------------------
  const artifact = await getArtifact(runId);
  const acquiredText = artifact?.acquired_text ?? '';
  expect(acquiredText, 'the PDF text layer did not reach the artifact').not.toBe('');
  for (const line of MENU_LINES) {
    expect(acquiredText, `the acquired text lost a menu line: ${line}`).toContain(line);
  }
  // The uploaded bytes are stored once at creation and never rewritten by acquisition.
  expect(artifact?.bytes?.equals(pdf), 'acquisition overwrote the uploaded bytes').toBe(true);
  // Refused runs create no row, so the seam saw exactly one call — the accepted one.
  expect(seen).toHaveLength(1);
  expect(seen[0]?.run_id, 'the seam was handed a different run than the one created').toBe(runId);
  expect(seen[0]?.source_class).toBe('text');
  expect(seen[0]?.content_type).toBe('application/pdf');
  expect(seen[0]?.acquired_text).toBe(acquiredText);
  expect(seen[0]?.bytes?.equals(pdf)).toBe(true);

  // The fixture's `½` is what keeps the normalized and original index spaces apart; if it
  // ever leaves the menu the offset assertions below silently degrade into identity checks.
  expect(
    normalizeForMatch(acquiredText).normalized.length,
    'the fixture no longer exercises index divergence: normalization no longer changes the ' +
      'text length, so origin offsets and normalized offsets coincide and swapping one for ' +
      'the other would pass. Restore the NFKC-expanding character (½) in the menu header.',
  ).not.toBe(acquiredText.length);

  const golden = normalizeDetail(detail, acquiredText);

  // --- every rule, by id -------------------------------------------------------------------
  const fired = new Set(detail.dishes.flatMap((dish) => dish.confidence_reasons.map((reason) => reason.rule)));
  for (const rule of ruleIdSchema.options) {
    expect(
      [...fired],
      `arbiter rule ${rule} fired on no row — the fixture is crafted so every rule T1–T6 fires at least once, ` +
        `so ${rule} has stopped firing`,
    ).toContain(rule);
  }
  // T6 must downgrade, not merely complain: the unproven `declared` entry becomes
  // `inferred` with no match, and the allergen gate then fires on it.
  const downgraded = detail.dishes.flatMap((dish) =>
    dish.confidence_reasons.some((reason) => reason.rule === 'T6')
      ? dish.allergens.filter((entry) => entry.provenance === 'inferred')
      : [],
  );
  expect(downgraded.map((entry) => ({ id: entry.id, match: entry.match })), 'T6 did not downgrade').toEqual([
    { id: 'gluten', match: null },
  ]);
  const reliable = detail.dishes.filter((dish) => dish.flag === 'reliable');
  expect(reliable.map((dish) => dish.name), 'exactly one fixture row must survive triage unflagged').toEqual([
    'Tortilla de patatas',
  ]);
  expect(reliable[0]?.confidence_reasons).toEqual([]);

  // --- the evidence offsets ------------------------------------------------------------------
  const matches = detail.dishes.flatMap((dish) =>
    dish.allergens
      .filter((entry) => entry.match !== null)
      .map((entry) => ({ dish: dish.name, quote: entry.evidence_quote ?? '', match: entry.match! })),
  );
  expect(matches.length, 'no evidence quote was verified at all').toBeGreaterThan(0);
  for (const { dish, quote, match } of matches) {
    expect(
      acquiredText.slice(match.start, match.end),
      `the persisted offsets for "${dish}" do not slice back to its evidence quote`,
    ).toBe(quote);
  }
  // A `.some(...)` scan rather than a regex — the R8 grep counts calls to the runner's
  // `test`, and `RegExp`'s own method of that name would read as a second one.
  const accented = matches.filter(({ quote }) => [...quote].some((ch) => ch.codePointAt(0)! > 0x7f));
  expect(accented.length, 'the fixture must verify at least one accented quote (NFD-sensitive offsets)').toBeGreaterThan(0);

  // --- the prices ------------------------------------------------------------------------------
  // `price_value` and the currency verdict per row, not merely which rule fired: the
  // rounding and the EUR/non-EUR distinction are invisible from flags alone.
  expect(
    detail.dishes.map((dish) => ({
      price_raw: dish.price_raw,
      price_value: dish.price_value,
      currency: dish.confidence_reasons.find((reason) => reason.rule === 'T3')?.detail ?? 'eur or unmarked',
    })),
  ).toEqual([
    { price_raw: '8,50 €', price_value: 8.5, currency: 'eur or unmarked' },
    { price_raw: '9,75 €', price_value: 9.75, currency: 'eur or unmarked' },
    { price_raw: 'desde 6 €', price_value: null, currency: 'eur or unmarked' },
    { price_raw: '18 $', price_value: null, currency: 'non-EUR currency' },
    { price_raw: '14,00 €', price_value: 14, currency: 'eur or unmarked' },
    { price_raw: '5,00 €', price_value: 5, currency: 'eur or unmarked' },
  ]);

  // --- the golden -------------------------------------------------------------------------------
  // Last, on purpose: the accusing assertions above run first, so a rule that stopped
  // firing reports itself by id instead of arriving as a diff the reader has to decode.
  expect(golden).toEqual(GOLDEN.detail);

  // --- the list's own derivation ------------------------------------------------------------------
  const list = body(runListResponseSchema, await app.inject({ method: 'GET', url: '/api/runs' }), 200, 'GET /api/runs');
  expect(list.runs.map((row) => row.id), 'GET /api/runs is not newest-first').toEqual([runId, olderRunId]);
  const listRow = list.runs[0]!;
  expect(normalizeRun(listRow)).toEqual(GOLDEN.list_row);
  // The list counts in SQL and the detail counts from the rows it read: one rule, two
  // derivations, and they must agree.
  expect(normalizeRun(listRow)).toEqual(golden.run);

  // --- the review round-trip -----------------------------------------------------------------------
  const confirmed = detail.dishes[0]!;
  const reopened = detail.dishes[1]!;
  const flagged = detail.dishes[detail.dishes.length - 1]!;
  const reviewedDetail = body(
    runDetailSchema,
    await app.inject({
      method: 'POST',
      url: `/api/runs/${runId}/reviews`,
      payload: {
        decisions: [
          { dish_id: confirmed.id, action: 'confirm', note: null },
          { dish_id: flagged.id, action: 'followup', note: 'Pedir a cocina la ficha del postre del día.' },
          { dish_id: reopened.id, action: 'followup', note: 'Confirmar el gluten con el proveedor.' },
        ],
      },
    }),
    200,
    'POST /api/runs/:id/reviews',
  );
  const afterBatch = normalizeDetail(reviewedDetail, acquiredText);
  expect(afterBatch.run.review_progress).toEqual({ resolved: 3, total: 6 });
  assertReviewTimestamps(reviewedDetail);
  // A review writes review fields and nothing else.
  expect(withoutReviewFields(afterBatch)).toEqual(withoutReviewFields(golden));

  // `reopen` is the only review branch that REMOVES data: the note and the timestamp go
  // with the verdict, and `resolved` moves back down.
  const reopenedDetail = body(
    runDetailSchema,
    await app.inject({
      method: 'POST',
      url: `/api/runs/${runId}/reviews`,
      payload: { decisions: [{ dish_id: reopened.id, action: 'reopen', note: null }] },
    }),
    200,
    'POST /api/runs/:id/reviews (reopen)',
  );
  const afterReview = normalizeDetail(reopenedDetail, acquiredText);
  expect(afterReview.run.review_progress, 'reopen did not move `resolved` back down').toEqual({ resolved: 2, total: 6 });
  expect(afterReview.dishes[1], 'reopen left the verdict, the note or the timestamp behind').toEqual(
    golden.dishes[1],
  );
  assertReviewTimestamps(reopenedDetail);

  // --- the forged batch --------------------------------------------------------------------------------
  const forged = body(
    errorEnvelopeSchema,
    await app.inject({
      method: 'POST',
      url: `/api/runs/${runId}/reviews`,
      payload: {
        decisions: [
          { dish_id: detail.dishes[2]!.id, action: 'confirm', note: null },
          { dish_id: randomUUID(), action: 'confirm', note: null },
        ],
      },
    }),
    400,
    'POST /api/runs/:id/reviews (forged batch)',
  );
  expect(forged).toEqual({
    error: { code: 'invalid_request', message: expect.stringContaining('nothing was applied') },
  });

  const final = normalizeDetail(
    body(runDetailSchema, await app.inject({ method: 'GET', url: `/api/runs/${runId}` }), 200, 'GET /api/runs/:id'),
    acquiredText,
  );
  // Neither decision in the forged batch applied — not the unknown one, and not the
  // valid one that preceded it.
  expect(final, 'the forged batch changed the run').toEqual(afterReview);
  expect(final).toEqual(GOLDEN.after_review);
});
