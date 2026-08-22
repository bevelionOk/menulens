import { z } from 'zod';
import { preRunFailureReasonSchema, reviewActionSchema } from './enums';
import { runSchema, runSummarySchema } from './run';

// Error envelope codes — only what an endpoint can actually emit: the pre-run 4xx
// reasons (no run row exists) plus the HTTP-only codes AD-14 has no word for
// (409 active run, 404, malformed body, 500). Pipeline failures never travel in an
// envelope: they are persisted in `runs.failure_reason` and read via GET (AD-4/AD-14).
export const apiErrorCodeSchema = z.enum([
  ...preRunFailureReasonSchema.options,
  'run_active',
  'not_found',
  'invalid_request',
  'internal_error',
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

// POST /api/runs (JSON variant) — the URL source; uploads travel as multipart `file`.
export const createRunUrlRequestSchema = z.object({ url: z.string().trim().max(2048) });
export type CreateRunUrlRequest = z.infer<typeof createRunUrlRequestSchema>;

// POST /api/runs — the row exists before processing starts (AD-4).
export const createRunResponseSchema = runSchema.pick({ id: true, status: true });
export type CreateRunResponse = z.infer<typeof createRunResponseSchema>;

// GET /api/runs — newest first (FR29).
export const runListResponseSchema = z.object({
  runs: z.array(runSummarySchema),
});
export type RunListResponse = z.infer<typeof runListResponseSchema>;

// POST /api/runs/:id/reviews — a single review is a batch of one (AD-9).
// Bounded on both axes because the endpoint is unauthenticated and the server applies one
// UPDATE per decision inside one open transaction: an empty batch is a no-op the server
// would otherwise report as a successful review, and the caps keep a forged body from
// holding that transaction open. 200 is far above the one decision the UI sends; the note
// is Ana's operational text (FR25), not a document.
export const REVIEW_BATCH_MAX = 200;
export const REVIEW_NOTE_MAX = 2000;

export const reviewRequestSchema = z.object({
  decisions: z
    .array(
      z.object({
        dish_id: z.uuid(),
        action: reviewActionSchema,
        note: z.string().max(REVIEW_NOTE_MAX).nullable(),
      }),
    )
    .min(1)
    .max(REVIEW_BATCH_MAX),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
