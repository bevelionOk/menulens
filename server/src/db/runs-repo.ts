import { and, asc, count, desc, eq, getTableColumns, sql } from 'drizzle-orm';
import type { ReviewAction, RunStatus, SourceClass, Stage, StoredFailureReason } from 'shared';
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

// What the list needs beyond the run row: the two dish numbers `toRunDetail` would have
// counted from the rows themselves. Nothing derived is stored — these are counted at read.
export type RunListRow = RunRow & { dish_count: number; resolved_count: number };

// List read (FR29): `listRuns()` plus ONE grouped aggregate over `dishes`, joined in
// memory by `run_id` — two round trips whatever the run count, never N+1, and still no
// `source_artifacts` join (AD-8). Runs with no dishes are absent from the aggregate and
// read as 0/0.
export async function listRunsWithCounts(): Promise<RunListRow[]> {
  const rows = await listRuns();
  const aggregates = await db
    .select({
      run_id: dishes.run_id,
      dish_count: count(),
      resolved_count: sql<number>`count(*) filter (where ${dishes.review_status} <> 'pending')`.mapWith(Number),
    })
    .from(dishes)
    .groupBy(dishes.run_id);
  const byRun = new Map(aggregates.map((a) => [a.run_id, a]));
  return rows.map((run) => ({
    ...run,
    dish_count: byRun.get(run.id)?.dish_count ?? 0,
    resolved_count: byRun.get(run.id)?.resolved_count ?? 0,
  }));
}

export interface ReviewDecision {
  dish_id: string;
  action: ReviewAction;
  note: string | null;
}

// The only columns a review may ever touch — extracted values are immutable (2.1 AC2).
type ReviewWrite = Pick<typeof dishes.$inferInsert, 'review_status' | 'followup_note' | 'reviewed_at'>;

function reviewWrite(action: ReviewAction, note: string | null, now: Date): ReviewWrite {
  // `reopen` is the inverse of a verdict: back to pending, and the note and timestamp that
  // recorded the verdict go with it (AD-9 keeps the action in the enum; D24 cut its button).
  if (action === 'reopen') return { review_status: 'pending', followup_note: null, reviewed_at: null };
  return { review_status: action === 'confirm' ? 'confirmed' : 'followup', followup_note: note, reviewed_at: now };
}

// Batch review write (AD-9). Every UPDATE is scoped by `run_id`, so a dish id belonging to
// another run matches nothing. Returns the number of rows matched: the caller compares it
// against the batch size and lets the transaction roll back when any `dish_id` missed, so
// a forged batch applies nothing (2.1 AC6). Sequential on purpose — batches are one row in
// practice, and with a repeated `dish_id` the last decision must win.
export async function applyReviews(tx: Db | Tx, runId: string, decisions: ReviewDecision[]): Promise<number> {
  const now = new Date();
  let matched = 0;
  for (const decision of decisions) {
    const updated = await tx
      .update(dishes)
      .set(reviewWrite(decision.action, decision.note, now))
      .where(and(eq(dishes.id, decision.dish_id), eq(dishes.run_id, runId)))
      .returning({ id: dishes.id });
    matched += updated.length;
  }
  return matched;
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
