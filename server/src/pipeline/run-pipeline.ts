import type { FastifyBaseLogger } from 'fastify';
import { db } from '../db/client';
import { getRun, insertDishes, type NewDish, setSourceClass } from '../db/runs-repo';
import { getArtifact, upsertArtifact } from '../db/source-artifacts-repo';
import { triageDish } from '../core/arbiter';
import { AcquisitionError } from './acquisition-error';
import { acquireSource } from './acquire-source';
import type { ExtractFn, ExtractionResult } from './extraction-adapter';
import { ExtractionError } from './extraction-error';
import { finishRun, transitionStage } from './run-lifecycle';

// The in-process pipeline (AD-4): fire-and-forget from POST /api/runs, never awaited by
// the request. Story 1.4 owns `fetching_source`; 1.5 owns `extracting` through the
// injected `extract` seam; 1.6 owns `validating`/`saving`. Every stage/status write
// goes through the 1.3 primitives. An unexpected throw is logged and leaves the run
// `processing` — the staleness net reads it `interrupted` (AD-14); no `internal` reason.
export async function runPipeline(log: FastifyBaseLogger, runId: string, extract: ExtractFn): Promise<void> {
  try {
    const run = await getRun(runId);
    if (!run) throw new Error(`runPipeline: run ${runId} not found`);
    const artifact = run.source_type === 'url' ? null : await getArtifact(runId);

    await transitionStage(log, runId, 'fetching_source');
    let acquired;
    try {
      acquired = await acquireSource(log, run, artifact);
    } catch (err) {
      if (!(err instanceof AcquisitionError)) throw err;
      log.warn({ run_id: runId, err, details: err.details, failure_reason: err.reason }, 'source acquisition failed');
      await finishRun(log, runId, { status: 'failed', failure_reason: err.reason });
      return;
    }

    // AC7: class + artifact in one transaction.
    await db.transaction(async (tx) => {
      await setSourceClass(tx, runId, acquired.source_class);
      await upsertArtifact(tx, runId, {
        content_type: acquired.content_type,
        bytes: acquired.bytes,
        acquired_text: acquired.acquired_text,
      });
    });
    log.info(
      {
        run_id: runId,
        source_class: acquired.source_class,
        content_type: acquired.content_type,
        text_chars: acquired.acquired_text?.length ?? 0,
      },
      'source acquired',
    );

    // 1.5: the model stage. Reads the just-written artifact so the adapter sees the stored
    // truth (bytes + class input), never the in-memory acquisition result.
    await transitionStage(log, runId, 'extracting');
    const stored = await getArtifact(runId);
    if (!stored) throw new Error(`runPipeline: run ${runId} has no artifact after acquisition`);
    let extracted: ExtractionResult;
    try {
      extracted = await extract(
        {
          run_id: runId,
          source_class: acquired.source_class,
          content_type: stored.content_type,
          acquired_text: stored.acquired_text,
          bytes: stored.bytes,
          // The one retry is a real event: re-write `extracting` so the staleness anchor moves.
          onRetry: async () => {
            await transitionStage(log, runId, 'extracting');
            log.info({ run_id: runId, attempt: 2 }, 'extracting again after invalid output');
          },
        },
        log,
      );
    } catch (err) {
      if (!(err instanceof ExtractionError)) throw err;
      log.warn({ run_id: runId, err, details: err.details, failure_reason: err.reason }, 'extraction failed');
      await finishRun(log, runId, { status: 'failed', failure_reason: err.reason });
      return;
    }

    if (extracted.dishes.length === 0) {
      // E9: an honest empty, distinct from failure.
      await finishRun(log, runId, { status: 'empty' });
      return;
    }
    log.info(
      { run_id: runId, dish_count: extracted.dishes.length, attempts: extracted.attempts, usage: extracted.usage },
      'extraction complete',
    );

    // 1.6: the arbiter. Pure triage over the model's signals against the stored ground
    // text; one log line per dish with the fired rule ids (never names or quotes).
    await transitionStage(log, runId, 'validating');
    const ctx = { source_class: acquired.source_class, acquired_text: stored.acquired_text };
    // `TriagedDish` must be insertable as-is — a type-level check, no runtime mapping.
    const rows: NewDish[] = extracted.dishes.map((signal) => triageDish(signal, ctx));
    rows.forEach((row, position) => {
      log.info({ run_id: runId, position, flag: row.flag, rules: row.confidence_reasons.map((r) => r.rule) }, 'dish triaged');
    });

    // AD-5: all dishes + `done` in one transaction — never dishes on a `processing` run,
    // never a `done` run with zero rows.
    await transitionStage(log, runId, 'saving');
    await db.transaction(async (tx) => {
      await insertDishes(tx, runId, rows);
      await finishRun(log, runId, { status: 'done' }, tx);
    });
  } catch (err) {
    log.error({ run_id: runId, err }, 'pipeline crashed; run left processing');
  }
}
