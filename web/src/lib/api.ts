import type {
  ApiErrorCode,
  CreateRunResponse,
  ReviewRequest,
  RunDetail,
  RunListResponse,
} from 'shared'

// The one typed client. Types come from `shared` — the same Zod schemas the server
// answers with — so the wire is described once. Nothing is re-validated here: the
// contract is the server's job, and pulling Zod into the browser bundle to re-check
// our own API would be ceremony, not safety. Only the error envelope is inspected
// defensively, because a proxy or a crash can answer with something that is not it.

export type ApiFailureCode = ApiErrorCode | 'network_error'

export class ApiClientError extends Error {
  status: number
  code: ApiFailureCode

  constructor(status: number, code: ApiFailureCode, message: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

async function toApiError(response: Response): Promise<ApiClientError> {
  // Envelope shape: `{ error: { code, message } }` (server/src/errors.ts).
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }
  const error = (body as { error?: { code?: unknown; message?: unknown } } | null)?.error
  const code = typeof error?.code === 'string' ? (error.code as ApiErrorCode) : 'internal_error'
  const message =
    typeof error?.message === 'string' && error.message.length > 0
      ? error.message
      : `The server answered ${response.status}.`
  return new ApiClientError(response.status, code, message)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, init)
  } catch {
    // A dead server or a dropped connection — distinct from any envelope the API emits.
    throw new ApiClientError(0, 'network_error', 'Could not reach the server.')
  }
  if (!response.ok) throw await toApiError(response)
  try {
    return (await response.json()) as T
  } catch {
    // A 2xx whose body is empty or is not JSON — a proxy answering for a server that is
    // not there, or an SPA fallback returning index.html. Letting the raw SyntaxError out
    // would slip past every `instanceof ApiClientError` check in the UI and leave a form
    // silently re-enabled with nothing said (FG6: no silent dead end).
    throw new ApiClientError(
      response.status,
      'internal_error',
      `The server answered ${response.status} but the response was not readable. Is the API running behind /api?`,
    )
  }
}

// The UI narrows on `ApiClientError`; anything else thrown inside a query or mutation
// (a bug in a success handler, an aborted request) must still reach the screen with words
// on it rather than as a silent null.
export function describeError(error: unknown): { code: ApiFailureCode; message: string } {
  if (error instanceof ApiClientError) return { code: error.code, message: error.message }
  if (error instanceof Error && error.message.length > 0) {
    return { code: 'internal_error', message: error.message }
  }
  return {
    code: 'internal_error',
    message: 'The request did not complete and the browser could not say why. Try again.',
  }
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

export const listRuns = () => request<RunListResponse>('/api/runs')

export const getRun = (id: string) => request<RunDetail>(`/api/runs/${encodeURIComponent(id)}`)

export const createRunFromUrl = (url: string) =>
  request<CreateRunResponse>('/api/runs', json({ url }))

export const createRunFromFile = (file: File) => {
  const form = new FormData()
  form.append('file', file, file.name)
  return request<CreateRunResponse>('/api/runs', { method: 'POST', body: form })
}

export const postReviews = (runId: string, decisions: ReviewRequest['decisions']) =>
  request<RunDetail>(`/api/runs/${encodeURIComponent(runId)}/reviews`, json({ decisions }))
