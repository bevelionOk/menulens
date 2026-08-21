import { z } from 'zod';
import { dishSchema } from './dish';
import {
  runStateSchema,
  runStatusSchema,
  sourceClassSchema,
  sourceTypeSchema,
  stageSchema,
  storedFailureReasonSchema,
} from './enums';

// Base run — the persisted row on the wire (AD-4). Timestamps travel as ISO-8601.
export const runSchema = z.object({
  id: z.uuid(),
  source_type: sourceTypeSchema,
  source_ref: z.string(),
  source_class: sourceClassSchema.nullable(),
  status: runStatusSchema,
  stage: stageSchema.nullable(),
  failure_reason: storedFailureReasonSchema.nullable(),
  created_at: z.iso.datetime(),
  stage_changed_at: z.iso.datetime(),
});
export type Run = z.infer<typeof runSchema>;

// List item (FR29): derived fields computed at read, never stored (AD-5).
export const runSummarySchema = runSchema.extend({
  state: runStateSchema,
  dish_count: z.int().nonnegative(),
  review_progress: z.object({
    resolved: z.int().nonnegative(),
    total: z.int().nonnegative(),
  }),
});
export type RunSummary = z.infer<typeof runSummarySchema>;

// Detail (GET /api/runs/:id): dishes in `position` order; `[]` mid-run (AD-5).
export const runDetailSchema = runSummarySchema.extend({
  dishes: z.array(dishSchema),
});
export type RunDetail = z.infer<typeof runDetailSchema>;
