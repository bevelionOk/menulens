import { defineConfig } from 'drizzle-kit';

// `npm run -w server db:generate` — emits SQL + meta/ into ./drizzle (committed verbatim).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
});
