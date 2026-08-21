import type { FastifyBaseLogger } from 'fastify';
import { db } from '../db/client';
import { getRun, setSourceClass } from '../db/runs-repo';
import { getArtifact, upsertArtifact } from '../db/source-artifacts-repo';
import { AcquisitionError } from './acquisition-error';
import { acquireSource } from './acquire-source';
import { finishRun, transitionStage } from './run-lifecycle';

// The in-process pipeline (AD-4): fire-and-forget from POST /api/runs, never awaited by
// the request. Story 1.4 owns `fetching_source`; 1.5 appends `extracting` after the
// acquisition write. Every stage/status write goes through the 1.3 primitives.
// An unexpected throw is logged and leaves the run `processing` — the staleness net
// reads it `interrupted` (AD-14); no `internal` failure reason exists.
export async function runPipeline(log: FastifyBaseLogger, runId: string): Promise<void> {
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
      log.warn({ run_id: runId, err, ...err.details, failure_reason: err.reason }, 'source acquisition failed');
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
  } catch (err) {
    log.error({ run_id: runId, err }, 'pipeline crashed; run left processing');
  }
}
