// FR2 / E2: one 10 MB cap shared by the multipart upload limit and the URL fetcher's
// streamed-body cap. `errors.ts` spells "10 MB" in the 413 message — keep them in step.
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
