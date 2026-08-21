import { z } from 'zod';
import { allergenIdSchema, allergenProvenanceSchema } from './enums';

// Base allergen entry as persisted in `dishes.allergens` (jsonb, AD-8).
// `match` holds T6's offsets into the acquired text (AD-7) — null when unverified.
export const allergenEntrySchema = z.object({
  id: allergenIdSchema,
  provenance: allergenProvenanceSchema,
  evidence_quote: z.string().nullable(),
  match: z
    .object({
      start: z.int().nonnegative(),
      end: z.int().nonnegative(),
    })
    .nullable(),
});
export type AllergenEntry = z.infer<typeof allergenEntrySchema>;

// What the model supplies (AD-12 strict structured output): no offsets — T6 computes them.
export const allergenSignalSchema = allergenEntrySchema.omit({ match: true });
export type AllergenSignal = z.infer<typeof allergenSignalSchema>;
