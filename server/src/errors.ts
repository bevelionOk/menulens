import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { ApiErrorCode, ErrorEnvelope } from 'shared';

// Thrown by routes; the error handler turns it into the `{ error: { code, message } }` envelope.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function envelope(code: ApiErrorCode, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

export function errorHandler(err: FastifyError | ApiError, request: FastifyRequest, reply: FastifyReply) {
  if (err instanceof ApiError) {
    return reply.status(err.status).send(envelope(err.code, err.message));
  }
  const code = 'code' in err ? err.code : undefined;
  // @fastify/multipart `limits.fileSize` exceeded (verified: FST_REQ_FILE_TOO_LARGE, 413).
  if (code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send(envelope('file_too_large', 'File exceeds the 10 MB cap.'));
  }
  // Fastify schema validation, bad JSON, unsupported/empty body — all "malformed request".
  if (err.validation || (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 500)) {
    return reply.status(400).send(envelope('invalid_request', 'Malformed request body.'));
  }
  request.log.error({ err }, 'unhandled error');
  return reply.status(500).send(envelope('internal_error', 'Internal error.'));
}

export function notFoundHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send(envelope('not_found', 'Not found.'));
}
