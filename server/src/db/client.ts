import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from './schema';

// The one database handle (AD-1): DATABASE_URL comes validated from env.ts.
export const pool = new Pool({ connectionString: env.DATABASE_URL });

// AD-14 failure containment: an error on an idle client (Postgres restart, network drop)
// would otherwise be an unhandled EventEmitter error and crash the process. Log only.
pool.on('error', (err) => {
  console.error('pg pool error', err);
});

export const db = drizzle(pool, { schema });
export type Db = typeof db;

// A transaction handle as passed to `db.transaction(async (tx) => …)`.
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
