import { z } from 'zod';

// Closed enums — Zod is the enum truth; DB columns are plain `text` (AD-2, AD-14).
// Every value below is spelled exactly as the spine / PRD spell it.

// FR13 — the 14 EU declarable allergens (Reg. 1169/2011), canonical snake_case ids.
export const allergenIdSchema = z.enum([
  'gluten',
  'crustaceans',
  'eggs',
  'fish',
  'peanuts',
  'soybeans',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulphites',
  'lupin',
  'molluscs',
]);
export type AllergenId = z.infer<typeof allergenIdSchema>;

// AD-14 — failure reasons, exhaustive and closed, split by where they live.
// Pre-run 4xx: never stored (no run row exists).
export const preRunFailureReasonSchema = z.enum(['invalid_url', 'unsupported_file', 'file_too_large']);
export type PreRunFailureReason = z.infer<typeof preRunFailureReasonSchema>;

// Stored on `failed` runs — the only subset `runs.failure_reason` may hold.
export const storedFailureReasonSchema = z.enum([
  'unreachable_url',
  'no_usable_text',
  'model_timeout',
  'model_error',
  'model_invalid_output',
]);
export type StoredFailureReason = z.infer<typeof storedFailureReasonSchema>;

// Derived at read from staleness (AD-5), never stored.
export const derivedFailureReasonSchema = z.enum(['interrupted']);
export type DerivedFailureReason = z.infer<typeof derivedFailureReasonSchema>;

// The full AD-14 enum — derived from the three subsets, never re-spelled.
export const failureReasonSchema = z.enum([
  ...preRunFailureReasonSchema.options,
  ...storedFailureReasonSchema.options,
  ...derivedFailureReasonSchema.options,
]);
export type FailureReason = z.infer<typeof failureReasonSchema>;

// AD-4 — persisted terminal truth (`empty` is a status, not a failure: E9).
export const runStatusSchema = z.enum(['processing', 'done', 'failed', 'empty']);
export type RunStatus = z.infer<typeof runStatusSchema>;

// AD-4 — progress detail, meaningful only while `processing`.
export const stageSchema = z.enum(['fetching_source', 'extracting', 'validating', 'saving']);
export type Stage = z.infer<typeof stageSchema>;

// FR29 — the state History shows: status plus the derived `interrupted` (AD-5).
export const runStateSchema = z.enum([...runStatusSchema.options, ...derivedFailureReasonSchema.options]);
export type RunState = z.infer<typeof runStateSchema>;

// FR1 — one source per run.
export const sourceTypeSchema = z.enum(['url', 'pdf', 'image']);
export type SourceType = z.infer<typeof sourceTypeSchema>;

// AD-6 — decided once per run by usable ground text, never by file type.
export const sourceClassSchema = z.enum(['text', 'visual']);
export type SourceClass = z.infer<typeof sourceClassSchema>;

// FR13 — per-allergen provenance; dish-level `unknown` is an empty allergens array.
export const allergenProvenanceSchema = z.enum(['declared', 'inferred']);
export type AllergenProvenance = z.infer<typeof allergenProvenanceSchema>;

// FR12 / D14 — descriptions confess when the model wrote them.
export const descriptionProvenanceSchema = z.enum(['extracted', 'generated']);
export type DescriptionProvenance = z.infer<typeof descriptionProvenanceSchema>;

// FR15 — the binary triage flag (UI copy: "auto-checked" / "needs review").
export const flagSchema = z.enum(['reliable', 'uncertain']);
export type Flag = z.infer<typeof flagSchema>;

// FR22 / FR25 — per-row review verdict; `followup` is terminal for this slice.
export const reviewStatusSchema = z.enum(['pending', 'confirmed', 'followup']);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

// AD-9 — the one review endpoint's action set (reopen included, FR27).
export const reviewActionSchema = z.enum(['confirm', 'followup', 'reopen']);
export type ReviewAction = z.infer<typeof reviewActionSchema>;

// FR17 — the deterministic arbiter's rule ids, persisted in `confidence_reasons`.
export const ruleIdSchema = z.enum(['T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
export type RuleId = z.infer<typeof ruleIdSchema>;
