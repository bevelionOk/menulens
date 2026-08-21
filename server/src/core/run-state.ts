import type { RunDetail, RunState, RunStatus } from 'shared';

// Pure run-state derivation (AD-5, AD-10): `active` / `interrupted` come from
// `status` + `stage_changed_at` + the staleness threshold — no stored column, no
// background job. The POST 409 gate calls `isActive` on the newest processing row and the
// GET path calls `toRunDetail` → `deriveState` — one rule, two callers. Inputs are typed
// structurally so core never imports `db`.

export interface RunStateInput {
  status: RunStatus;
  stage_changed_at: Date;
}

// Blocks a new POST (409) only while `processing` and not yet stale.
export function isActive(run: RunStateInput, now: Date, staleAfterMs: number): boolean {
  return run.status === 'processing' && now.getTime() - run.stage_changed_at.getTime() < staleAfterMs;
}

// `interrupted` is derived, never stored: a stale `processing` run.
export function deriveState(run: RunStateInput, now: Date, staleAfterMs: number): RunState {
  if (run.status === 'processing' && !isActive(run, now, staleAfterMs)) return 'interrupted';
  return run.status;
}

// The persisted row as the wire carries it (`Date` columns serialize to ISO-8601 later).
export interface RunRowLike extends RunStateInput {
  id: string;
  source_type: RunDetail['source_type'];
  source_ref: string;
  source_class: RunDetail['source_class'];
  stage: RunDetail['stage'];
  failure_reason: RunDetail['failure_reason'];
  created_at: Date;
}

export interface DishRowLike {
  review_status: RunDetail['dishes'][number]['review_status'];
}

// `RunDetail`-shaped, with `Date` where the wire has ISO strings; Fastify serializes.
export function toRunDetail<D extends DishRowLike>(
  run: RunRowLike,
  dishes: D[],
  now: Date,
  staleAfterMs: number,
): Omit<RunDetail, 'created_at' | 'stage_changed_at' | 'dishes'> & {
  created_at: Date;
  stage_changed_at: Date;
  dishes: D[];
} {
  return {
    ...run,
    state: deriveState(run, now, staleAfterMs),
    dish_count: dishes.length,
    review_progress: {
      resolved: dishes.filter((d) => d.review_status !== 'pending').length,
      total: dishes.length,
    },
    dishes,
  };
}
