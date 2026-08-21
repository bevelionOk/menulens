import { and, asc, desc, eq, getTableColumns, gt } from 'drizzle-orm';
import type { RunStatus, Stage, StoredFailureReason } from 'shared';
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

// Seriality gate input (AD-10): a `processing` run whose stage changed after `cutoff`.
// The caller computes `cutoff = now − RUN_STALE_AFTER_MS`; a stale run never blocks.
export async function findActiveRun(cutoff: Date): Promise<RunRow | null> {
  const [row] = await db
    .select(getTableColumns(runs))
    .from(runs)
    .where(and(eq(runs.status, 'processing'), gt(runs.stage_changed_at, cutoff)))
    .limit(1);
  return row ?? null;
}

// Stage transition: `stage_changed_at` is the staleness anchor and moves on every write.
export async function setStage(tx: Db | Tx, id: string, stage: Stage): Promise<void> {
  await tx.update(runs).set({ stage, stage_changed_at: new Date() }).where(eq(runs.id, id));
}

// Terminal write: keeps the last `stage` readable; bumps the anchor like any transition.
export async function setTerminal(
  tx: Db | Tx,
  id: string,
  outcome: { status: Exclude<RunStatus, 'processing'>; failure_reason: StoredFailureReason | null },
): Promise<void> {
  await tx
    .update(runs)
    .set({ status: outcome.status, failure_reason: outcome.failure_reason, stage_changed_at: new Date() })
    .where(eq(runs.id, id));
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
