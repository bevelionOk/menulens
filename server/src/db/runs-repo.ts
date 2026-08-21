import { asc, desc, eq, getTableColumns } from 'drizzle-orm';
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
