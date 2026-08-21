import { z } from 'zod';
import { modelDishSignalSchema } from './dish';

// The extraction adapter's strict output schema (AD-12, `zodTextFormat` in 1.5).
export const modelExtractionOutputSchema = z.object({
  dishes: z.array(modelDishSignalSchema),
});
export type ModelExtractionOutput = z.infer<typeof modelExtractionOutputSchema>;
