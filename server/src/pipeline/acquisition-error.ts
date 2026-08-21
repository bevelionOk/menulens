import type { StoredFailureReason } from 'shared';

export type AcquisitionFailureReason = Extract<StoredFailureReason, 'unreachable_url' | 'no_usable_text'>;

// The acquisition stage's only failure type: E2 (`unreachable_url`, every fetch cause
// including SSRF refusal) and E3 (`no_usable_text`). The message is for logs; the
// stored reason is the closed enum value, so the refusal rule never reaches the user.
export class AcquisitionError extends Error {
  constructor(
    readonly reason: AcquisitionFailureReason,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'AcquisitionError';
  }
}
