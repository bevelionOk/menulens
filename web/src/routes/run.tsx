import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import type { RunDetail } from 'shared'

import { Disclaimer } from '@/components/disclaimer'
import { ReviewTable, type ReviewDecision } from '@/components/review-table'
import { RunStateBadge } from '@/components/run-state-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useElapsed } from '@/hooks/use-elapsed'
import { ApiClientError, createRunFromUrl, getRun, postReviews } from '@/lib/api'
import {
  EMPTY_COPY,
  EXPECTATION_COPY,
  FAILURE_COPY,
  INTERRUPTED_COPY,
  STAGE_COPY,
  STAGE_PENDING_COPY,
  formatElapsed,
  formatTimestamp,
} from '@/lib/copy'

export function RunPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const runQuery = useQuery({
    queryKey: ['run', id],
    queryFn: () => getRun(id),
    // AR26 — the poll is a function of the server's own state, so the run stops polling
    // itself the moment it reaches a terminal state. No component has to remember to stop.
    refetchInterval: (query) => (query.state.data?.state === 'processing' ? 1000 : false),
  })

  const run = runQuery.data ?? null

  const review = useMutation({
    mutationFn: (decision: ReviewDecision) => postReviews(id, [decision]),
    // The endpoint answers with the whole updated run, so the verdict shown is always the
    // one the server persisted — no optimistic write can put a verdict on screen that the
    // database refused (2.1 AC6).
    onSuccess: (updated) => {
      queryClient.setQueryData(['run', id], updated)
      void queryClient.invalidateQueries({ queryKey: ['runs'] })
    },
  })

  const retry = useMutation({
    // FR8 — retry is a brand-new run through the same POST; this run is never touched.
    mutationFn: (sourceRef: string) => createRunFromUrl(sourceRef),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['runs'] })
      navigate(`/runs/${created.id}`)
    },
  })

  if (runQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!run) {
    const error = runQuery.error
    const message =
      error instanceof ApiClientError ? error.message : 'Could not load this run.'
    return (
      <Alert variant="destructive">
        <AlertTitle>Run unavailable</AlertTitle>
        <AlertDescription>
          {message}{' '}
          <Link to="/" className="underline">
            Back to the form
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  const retryError = retry.error instanceof ApiClientError ? retry.error : null
  const reviewError = review.error instanceof ApiClientError ? review.error : null

  const retryControl = (
    <RetryControl
      run={run}
      busy={retry.isPending}
      onRetry={() => retry.mutate(run.source_ref)}
      error={retryError?.message ?? null}
    />
  )

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Button size="sm" variant="ghost" className="justify-self-start" render={<Link to="/" />}>
          <ArrowLeft aria-hidden="true" />
          All extractions
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-xl font-medium break-all">{run.source_ref}</h1>
          <RunStateBadge state={run.state} />
          {/* A failed poll keeps the last known state on screen rather than blanking it. */}
          {runQuery.isError && (
            <span className="text-sm text-muted-foreground">reconnecting…</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {run.source_type} · started {formatTimestamp(run.created_at)}
          {run.source_class && ` · read as ${run.source_class}`}
        </p>
      </div>

      {run.state === 'processing' && <Waiting run={run} />}

      {run.state === 'interrupted' && (
        <Alert>
          <AlertTitle>{INTERRUPTED_COPY.title}</AlertTitle>
          <AlertDescription>
            {INTERRUPTED_COPY.detail}
            {retryControl}
          </AlertDescription>
        </Alert>
      )}

      {run.state === 'failed' && <Failed run={run} retryControl={retryControl} />}

      {run.state === 'empty' && (
        // E9 — an honest outcome, not a failure: no destructive styling, no mute table.
        <Alert>
          <AlertTitle>{EMPTY_COPY.title}</AlertTitle>
          <AlertDescription>
            {EMPTY_COPY.detail}
            {retryControl}
          </AlertDescription>
        </Alert>
      )}

      {run.state === 'done' && (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-lg font-medium">
              {run.dish_count} {run.dish_count === 1 ? 'dish' : 'dishes'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {/* Server-derived (2.1 AC4): nothing about done-ness is stored or counted here. */}
              {run.review_progress.resolved} of {run.review_progress.total} resolved
              {run.review_progress.total > 0 &&
                run.review_progress.resolved === run.review_progress.total &&
                ' — every row reviewed'}
            </p>
          </div>

          <Disclaimer />

          {reviewError && (
            <Alert variant="destructive">
              <AlertTitle>That review was not saved</AlertTitle>
              <AlertDescription>
                {reviewError.message} Nothing changed — the row is still as it was.
              </AlertDescription>
            </Alert>
          )}

          <ReviewTable
            dishes={run.dishes}
            onDecide={(decision) => review.mutate(decision)}
            pendingDishId={review.isPending ? (review.variables?.dish_id ?? null) : null}
            busy={review.isPending}
          />
        </div>
      )}
    </div>
  )
}

// FR4/FR5 — the real stage in plain language plus a measured elapsed timer. There is no
// percentage, no predicted finish time and no lone spinner anywhere in this component:
// the only numbers on screen are ones the system actually knows.
function Waiting({ run }: { run: RunDetail }) {
  const elapsed = useElapsed(run.created_at, true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{run.stage ? STAGE_COPY[run.stage] : STAGE_PENDING_COPY}</CardTitle>
        <CardDescription>{EXPECTATION_COPY}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <p className="font-mono text-3xl tabular-nums">{formatElapsed(elapsed)}</p>
        <p className="text-xs text-muted-foreground">
          elapsed, counted from when the run was created
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The run lives on the server, not in this tab — you can close it and come back to this
          address.
        </p>
      </CardContent>
    </Card>
  )
}

function Failed({ run, retryControl }: { run: RunDetail; retryControl: ReactNode }) {
  const copy = run.failure_reason ? FAILURE_COPY[run.failure_reason] : null

  return (
    <Alert variant="destructive">
      <AlertTitle>{copy?.title ?? 'This run failed'}</AlertTitle>
      <AlertDescription>
        {copy?.detail ??
          'The run stopped without recording a reason. Retry starts a new run.'}
        {retryControl}
      </AlertDescription>
    </Alert>
  )
}

// Retry needs the source again. A URL run has it in `source_ref`; an upload does not —
// the bytes are on the server but no route replays them, so the honest offer is to
// re-upload rather than a button that cannot work.
function RetryControl({
  run,
  busy,
  onRetry,
  error,
}: {
  run: RunDetail
  busy: boolean
  onRetry: () => void
  error: string | null
}) {
  return (
    <div className="mt-3 grid justify-items-start gap-2">
      {run.source_type === 'url' ? (
        <Button size="sm" variant="outline" disabled={busy} onClick={onRetry}>
          {busy ? 'Starting…' : 'Retry — start a new run'}
        </Button>
      ) : (
        <Button size="sm" variant="outline" render={<Link to="/" />}>
          Re-upload the file to retry
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
