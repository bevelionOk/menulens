import type { RunDetail, RunState, RunStatus, RunSummary } from 'shared';

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

// The two numbers the summary is made of. The list reads them straight from a grouped
// SQL count; the detail counts them off the rows it already has.
export interface ReviewCounts {
  total: number;
  resolved: number;
}

export function countReviews(dishes: DishRowLike[]): ReviewCounts {
  return { total: dishes.length, resolved: dishes.filter((d) => d.review_status !== 'pending').length };
}

// The wire shape with `Date` where the serialized form has ISO strings; Fastify serializes.
type WithDates<T> = Omit<T, 'created_at' | 'stage_changed_at'> & { created_at: Date; stage_changed_at: Date };

// The one derivation (AD-5, 2.1 AC4): `state`, `dish_count` and `review_progress` from a
// run row plus two counts — never a stored column. Counts are the input because that is the
// smaller of the two things a caller can have: the list has only counts, the detail has rows
// and can produce counts, so both reach the same rule instead of two that can drift.
export function toRunSummary(
  run: RunRowLike,
  counts: ReviewCounts,
  now: Date,
  staleAfterMs: number,
): WithDates<RunSummary> {
  return {
    ...run,
    state: deriveState(run, now, staleAfterMs),
    dish_count: counts.total,
    review_progress: { resolved: counts.resolved, total: counts.total },
  };
}

// The detail is the summary plus the rows it counted.
export function toRunDetail<D extends DishRowLike>(
  run: RunRowLike,
  dishes: D[],
  now: Date,
  staleAfterMs: number,
): WithDates<Omit<RunDetail, 'dishes'>> & { dishes: D[] } {
  return { ...toRunSummary(run, countReviews(dishes), now, staleAfterMs), dishes };
}
