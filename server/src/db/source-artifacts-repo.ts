import { eq } from 'drizzle-orm';
import { db, type Db, type Tx } from './client';
import { sourceArtifacts } from './schema';

export type ArtifactRow = typeof sourceArtifacts.$inferSelect;
export type NewArtifact = Omit<typeof sourceArtifacts.$inferInsert, 'run_id'>;

export async function insertArtifact(tx: Db | Tx, runId: string, artifact: NewArtifact): Promise<void> {
  await tx.insert(sourceArtifacts).values({ ...artifact, run_id: runId });
}

// The only reader of `bytes` (AD-8): serves GET /api/runs/:id/artifact and T6's text.
export async function getArtifact(runId: string): Promise<ArtifactRow | null> {
  const [row] = await db.select().from(sourceArtifacts).where(eq(sourceArtifacts.run_id, runId));
  return row ?? null;
}
