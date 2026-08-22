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
  return (await response.json()) as T
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
