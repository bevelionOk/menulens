import { z } from 'zod';
import { allergenEntrySchema, allergenSignalSchema } from './allergen';
import { descriptionProvenanceSchema, flagSchema, reviewStatusSchema, ruleIdSchema } from './enums';

// One fired arbiter rule with its recorded reason (FR17, FR24).
export const confidenceReasonSchema = z.object({
  rule: ruleIdSchema,
  detail: z.string(),
});
export type ConfidenceReason = z.infer<typeof confidenceReasonSchema>;

// Base dish — the persisted row on the wire. Dish-level `unknown` (FR13/FR21) is
// an empty `allergens` array, no column.
export const dishSchema = z.object({
  id: z.uuid(),
  run_id: z.uuid(),
  position: z.int().nonnegative(),
  name: z.string(),
  price_raw: z.string().nullable(),
  price_value: z.number().nullable(),
  allergens: z.array(allergenEntrySchema),
  description: z.string(),
  description_provenance: descriptionProvenanceSchema,
  confidence_reasons: z.array(confidenceReasonSchema),
  flag: flagSchema,
  review_status: reviewStatusSchema,
  followup_note: z.string().nullable(),
  reviewed_at: z.iso.datetime().nullable(),
});
export type Dish = z.infer<typeof dishSchema>;

// Model signals per dish (FR16): what the extraction adapter validates (AD-12).
// Strict-structured-output compatible: `.nullable()` only, no optional/default.
export const modelDishSignalSchema = dishSchema
  .pick({
    name: true,
    price_raw: true,
    description: true,
    description_provenance: true,
  })
  .extend({
    allergens: z.array(allergenSignalSchema),
    self_flag: z.boolean(),
    self_flag_reason: z.string().nullable(),
  });
export type ModelDishSignal = z.infer<typeof modelDishSignalSchema>;
