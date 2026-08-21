import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';

// Programmatic runner for the committed SQL in server/drizzle/ (the real migration, R2).
// Invoked by `npm run -w server db:migrate` — never at server boot. Idempotent: the
// drizzle journal table records applied migrations, so a re-run is a no-op.
// The folder is resolved relative to this file, so the script works from any cwd (CI in 1.8).
const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

try {
  await migrate(db, { migrationsFolder });
  console.log('db:migrate — up to date');
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error('db:migrate failed:', err);
  await pool.end().catch(() => undefined);
  process.exit(1);
}
