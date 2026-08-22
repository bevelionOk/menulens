import { defineConfig } from 'vitest/config';

// The one runner config. `include` is deliberately narrow — R8 caps the repo at one
// automated test, and a wider glob is how a second one would arrive unnoticed.
export default defineConfig({
  test: {
    include: ['test/golden-master.test.ts'],
    setupFiles: ['./test/setup-env.ts'],
    // One real run through the pipeline against Postgres: seconds, not milliseconds.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
