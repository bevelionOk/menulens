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

export function errorHandler(err: unknown, request: FastifyRequest, reply: FastifyReply) {
  // A thrown non-object (string, undefined) has no `code`/`validation`/`statusCode` to inspect.
  if (typeof err !== 'object' || err === null) {
    request.log.error({ err }, 'unhandled non-error throw');
    return reply.status(500).send(envelope('internal_error', 'Internal error.'));
  }
  if (err instanceof ApiError) {
    return reply.status(err.status).send(envelope(err.code, err.message));
  }
  const fe = err as Partial<FastifyError>;
  // @fastify/multipart `limits.fileSize` exceeded (verified: FST_REQ_FILE_TOO_LARGE, 413).
  if (fe.code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send(envelope('file_too_large', 'File exceeds the 10 MB cap.'));
  }
  // Fastify's own 413 (JSON over `bodyLimit`) and 415 (content type it cannot parse) keep
  // their status and say what happened — collapsing them into "malformed" sent the user to
  // fix a body that was well-formed (Phase-4 review).
  if (fe.statusCode === 413) {
    return reply.status(413).send(envelope('invalid_request', 'Request body exceeds the 1 MB JSON limit.'));
  }
  if (fe.statusCode === 415) {
    return reply.status(415).send(envelope('invalid_request', 'Unsupported content type: send JSON or a multipart file.'));
  }
  // Fastify schema validation, bad JSON, empty body — all "malformed request".
  if (fe.validation || (typeof fe.statusCode === 'number' && fe.statusCode >= 400 && fe.statusCode < 500)) {
    return reply.status(400).send(envelope('invalid_request', 'Malformed request body.'));
  }
  request.log.error({ err }, 'unhandled error');
  return reply.status(500).send(envelope('internal_error', 'Internal error.'));
}

export function notFoundHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send(envelope('not_found', 'Not found.'));
}
