import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { FastifyInstance } from 'fastify';
import { ruleIdSchema, type RunDetail, type RunListResponse } from 'shared';
import { expect, test } from 'vitest';
import { buildApp } from '../src/app';
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

// The pipeline is fire-and-forget (AD-4): the POST returns before any stage runs, so the
// test watches the run exactly the way the UI does — by re-reading it.
async function pollUntilSettled(app: FastifyInstance, runId: string): Promise<RunDetail> {
  const deadline = Date.now() + 30_000;
  let last: RunDetail | null = null;
  while (Date.now() < deadline) {
    const res = await app.inject({ method: 'GET', url: `/api/runs/${runId}` });
    expect(res.statusCode).toBe(200);
    last = res.json() as RunDetail;
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
  // This test owns the database `DATABASE_URL` points at: the seriality gate (409) reads
  // the newest `processing` run repo-wide, and a leftover one would refuse the fixture.
  await db.delete(dishes);
  await db.delete(sourceArtifacts);
  await db.delete(runs);

  const pdf = buildMenuPdf(MENU_LINES);
  const seen: ExtractionInput[] = [];
  const extract: ExtractFn = async (input) => {
    seen.push(input);
    return MOCKED_EXTRACTION;
  };
  const app = buildApp({ extract });

  try {
    // --- the run -----------------------------------------------------------------
    const created = await app.inject({
      method: 'POST',
      url: '/api/runs',
      headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` },
      payload: multipartBody(pdf, 'carta-la-parra.pdf', 'application/pdf'),
    });
    expect(created.statusCode).toBe(201);
    const { id: runId, status } = created.json() as { id: string; status: string };
    expect(status).toBe('processing');

    const detail = await pollUntilSettled(app, runId);
    expect(detail.state, `run settled as ${detail.state} at stage ${detail.stage}`).toBe('done');

    // --- what acquisition handed the seam ------------------------------------------
    const artifact = await getArtifact(runId);
    const acquiredText = artifact?.acquired_text ?? '';
    expect(acquiredText, 'the PDF text layer did not reach the artifact').not.toBe('');
    for (const line of MENU_LINES) {
      expect(acquiredText, `the acquired text lost a menu line: ${line}`).toContain(line);
    }
    // The uploaded bytes are stored once at creation and never rewritten by acquisition.
    expect(artifact?.bytes?.equals(pdf), 'acquisition overwrote the uploaded bytes').toBe(true);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.source_class).toBe('text');
    expect(seen[0]?.acquired_text).toBe(acquiredText);
    expect(seen[0]?.bytes?.equals(pdf)).toBe(true);

    const golden = normalizeDetail(detail, acquiredText);

    // --- every rule, by id -----------------------------------------------------------
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

    // --- the evidence offsets ---------------------------------------------------------
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

    // --- the prices -------------------------------------------------------------------
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

    // --- the golden ------------------------------------------------------------------
    // Last, on purpose: the accusing assertions above run first, so a rule that stopped
    // firing reports itself by id instead of arriving as a diff the reader has to decode.
    expect(golden).toEqual(GOLDEN.detail);

    // --- the list's own derivation ------------------------------------------------------
    const list = (await app.inject({ method: 'GET', url: '/api/runs' })).json() as RunListResponse;
    const listRow = list.runs.find((row) => row.id === runId);
    expect(listRow, 'the completed run is missing from GET /api/runs').toBeDefined();
    expect(list.runs[0]?.id, 'GET /api/runs is not newest-first').toBe(runId);
    expect(normalizeRun(listRow!)).toEqual(GOLDEN.list_row);
    // The list counts in SQL and the detail counts from the rows it read: one rule, two
    // derivations, and they must agree.
    expect(normalizeRun(listRow!)).toEqual(golden.run);

    // --- the review round-trip -----------------------------------------------------------
    const confirmed = detail.dishes[0]!;
    const flagged = detail.dishes[detail.dishes.length - 1]!;
    const reviewed = await app.inject({
      method: 'POST',
      url: `/api/runs/${runId}/reviews`,
      payload: {
        decisions: [
          { dish_id: confirmed.id, action: 'confirm', note: null },
          { dish_id: flagged.id, action: 'followup', note: 'Pedir a cocina la ficha del postre del día.' },
        ],
      },
    });
    expect(reviewed.statusCode).toBe(200);
    const afterReview = normalizeDetail(reviewed.json() as RunDetail, acquiredText);
    expect(afterReview.run.review_progress).toEqual({ resolved: 2, total: 6 });
    // A review writes review fields and nothing else.
    expect(withoutReviewFields(afterReview)).toEqual(withoutReviewFields(golden));

    // --- the forged batch -----------------------------------------------------------------
    const forged = await app.inject({
      method: 'POST',
      url: `/api/runs/${runId}/reviews`,
      payload: {
        decisions: [
          { dish_id: detail.dishes[2]!.id, action: 'confirm', note: null },
          { dish_id: randomUUID(), action: 'confirm', note: null },
        ],
      },
    });
    expect(forged.statusCode).toBe(400);
    expect(forged.json()).toEqual({
      error: { code: 'invalid_request', message: expect.stringContaining('nothing was applied') },
    });

    const final = normalizeDetail((await app.inject({ method: 'GET', url: `/api/runs/${runId}` })).json() as RunDetail, acquiredText);
    // Neither decision in the forged batch applied — not the unknown one, and not the
    // valid one that preceded it.
    expect(final, 'the forged batch changed the run').toEqual(afterReview);
    expect(final).toEqual(GOLDEN.after_review);
  } finally {
    await app.close();
    await pool.end();
  }
});
