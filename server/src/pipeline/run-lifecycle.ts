import type { FastifyBaseLogger } from 'fastify';
import type { RunStatus, Stage, StoredFailureReason } from 'shared';
import { db } from '../db/client';
import { setStage, setTerminal } from '../db/runs-repo';

// The single place a run transition is persisted AND logged (AC7, NFR5). Stories
// 1.4–1.6 call these; nothing else writes `stage` / `status`.

export async function transitionStage(log: FastifyBaseLogger, runId: string, stage: Stage): Promise<void> {
  await setStage(db, runId, stage);
  log.info({ run_id: runId, stage }, 'run stage changed');
}

export type RunOutcome =
  | { status: Exclude<RunStatus, 'processing' | 'failed'>; failure_reason?: null }
  | { status: 'failed'; failure_reason: StoredFailureReason };

export async function finishRun(log: FastifyBaseLogger, runId: string, outcome: RunOutcome): Promise<void> {
  const failure_reason = outcome.failure_reason ?? null;
  await setTerminal(db, runId, { status: outcome.status, failure_reason });
  log.info({ run_id: runId, status: outcome.status, failure_reason }, 'run finished');
}
