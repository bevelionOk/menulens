import type { StoredFailureReason } from 'shared';

export type ExtractionFailureReason = Extract<StoredFailureReason, 'model_timeout' | 'model_error' | 'model_invalid_output'>;

// The extraction stage's only failure type — the three E7 reasons, closed. Mirrors
// `AcquisitionError`: the message is for logs; the stored reason is the enum value.
export class ExtractionError extends Error {
  constructor(
    readonly reason: ExtractionFailureReason,
    message: string,
    readonly details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'ExtractionError';
  }
}
