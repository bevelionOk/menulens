import { eq } from 'drizzle-orm';
import { db, type Db, type Tx } from './client';
import { sourceArtifacts } from './schema';

export type ArtifactRow = typeof sourceArtifacts.$inferSelect;
export type NewArtifact = Omit<typeof sourceArtifacts.$inferInsert, 'run_id'>;

export async function insertArtifact(tx: Db | Tx, runId: string, artifact: NewArtifact): Promise<void> {
  await tx.insert(sourceArtifacts).values({ ...artifact, run_id: runId });
}

// Acquisition write (1.4, AC7): URL runs have no row yet → insert; uploads have one → update.
// `bytes` is left out of the update set when undefined so uploaded bytes survive.
export async function upsertArtifact(
  tx: Db | Tx,
  runId: string,
  artifact: { content_type: string; bytes?: Buffer | null; acquired_text: string | null },
): Promise<void> {
  const { bytes, ...rest } = artifact;
  const set = bytes === undefined ? rest : { ...rest, bytes };
  await tx
    .insert(sourceArtifacts)
    .values({ run_id: runId, content_type: artifact.content_type, bytes: bytes ?? null, acquired_text: artifact.acquired_text })
    .onConflictDoUpdate({ target: sourceArtifacts.run_id, set });
}

// The only reader of `bytes` (AD-8): serves GET /api/runs/:id/artifact and T6's text.
export async function getArtifact(runId: string): Promise<ArtifactRow | null> {
  const [row] = await db.select().from(sourceArtifacts).where(eq(sourceArtifacts.run_id, runId));
  return row ?? null;
}
