import { and, asc, desc, eq, getTableColumns } from 'drizzle-orm';
import type { RunStatus, SourceClass, Stage, StoredFailureReason } from 'shared';
import { db, type Db, type Tx } from './client';
import { dishes, runs } from './schema';

export type RunRow = typeof runs.$inferSelect;
export type DishRow = typeof dishes.$inferSelect;

// Generated columns are the DB's; everything else is the caller's (lifecycle policy
// lives in the routes/pipeline, not here).
export type NewRun = Omit<typeof runs.$inferInsert, 'id' | 'created_at' | 'stage_changed_at'>;
// `run_id` and `position` are assigned by `insertDishes`, never by the caller (AD-8).
export type NewDish = Omit<typeof dishes.$inferInsert, 'id' | 'run_id' | 'position'>;

export async function createRun(tx: Db | Tx, input: NewRun): Promise<RunRow> {
  const [row] = await tx.insert(runs).values(input).returning();
  if (!row) throw new Error('createRun: insert returned no row');
  return row;
}

// Seriality gate input (AD-10): the newest `processing` run by staleness anchor. No
// staleness logic here — the route decides with `core/run-state.isActive`, the same
// pure function the read path uses. If the newest processing run is not active, none is.
export async function findLatestProcessingRun(): Promise<RunRow | null> {
  const [row] = await db
    .select(getTableColumns(runs))
    .from(runs)
    .where(eq(runs.status, 'processing'))
    .orderBy(desc(runs.stage_changed_at))
    .limit(1);
  return row ?? null;
}

// Stage transition: `stage_changed_at` is the staleness anchor and moves on every write.
// Guarded on `status = 'processing'`: a late pipeline write never rewrites a terminal run
// (a stale-but-still-processing run may still finish — that stays allowed).
export async function setStage(tx: Db | Tx, id: string, stage: Stage): Promise<void> {
  await tx
    .update(runs)
    .set({ stage, stage_changed_at: new Date() })
    .where(and(eq(runs.id, id), eq(runs.status, 'processing')));
}

// Terminal write: keeps the last `stage` readable; bumps the anchor like any transition.
// Same `processing` guard: terminal is written once.
export async function setTerminal(
  tx: Db | Tx,
  id: string,
  outcome: { status: Exclude<RunStatus, 'processing'>; failure_reason: StoredFailureReason | null },
): Promise<void> {
  await tx
    .update(runs)
    .set({ status: outcome.status, failure_reason: outcome.failure_reason, stage_changed_at: new Date() })
    .where(and(eq(runs.id, id), eq(runs.status, 'processing')));
}

// AD-6 class write (1.4): same `processing` guard; no anchor bump — not a stage transition.
export async function setSourceClass(tx: Db | Tx, id: string, source_class: SourceClass): Promise<void> {
  await tx
    .update(runs)
    .set({ source_class })
    .where(and(eq(runs.id, id), eq(runs.status, 'processing')));
}

export async function getRun(id: string): Promise<RunRow | null> {
  const [row] = await db.select().from(runs).where(eq(runs.id, id));
  return row ?? null;
}

// History list (FR29): explicit `runs` columns only, newest first. Never joins
// `source_artifacts` — artifact bytes stay out of list queries (AD-8).
export function listRuns() {
  return db.select(getTableColumns(runs)).from(runs).orderBy(desc(runs.created_at));
}

// Detail read: dishes in server-assigned `position` order; `[]` mid-run (AD-5).
export async function getRunWithDishes(id: string): Promise<(RunRow & { dishes: DishRow[] }) | null> {
  const [run] = await db.select().from(runs).where(eq(runs.id, id));
  if (!run) return null;
  const rows = await db.select().from(dishes).where(eq(dishes.run_id, id)).orderBy(asc(dishes.position));
  return { ...run, dishes: rows };
}

// One transaction at `saving` (AD-5): `position` = array index, extraction order.
export async function insertDishes(tx: Db | Tx, runId: string, rows: NewDish[]): Promise<void> {
  if (rows.length === 0) return;
  await tx.insert(dishes).values(rows.map((row, index) => ({ ...row, run_id: runId, position: index })));
}
