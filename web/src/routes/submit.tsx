import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { RunSummary } from 'shared'

import { RunStateBadge } from '@/components/run-state-badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createRunFromFile, createRunFromUrl, describeError, listRuns } from '@/lib/api'
import { formatTimestamp } from '@/lib/copy'

// FR1 accept set. `image/heic` is absent on purpose (E4): listing it would stop iOS from
// auto-converting a HEIC pick to JPEG, and the raw format is not supported. A HEIC that
// is renamed past the picker still gets the server's 415 copy, shown verbatim below.
const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'

// E1 — caught here, before any request. These are the same four rules the server applies
// in `POST /api/runs`; the point of duplicating them is that a typo should not cost a
// round trip, not that the client is the authority. The server still decides.
function validateUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return 'Paste a menu URL first.'
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return 'That is not a URL. It needs the scheme too — for example https://example.com/menu'
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'The URL has to start with http:// or https://'
  }
  if (parsed.username || parsed.password) {
    return 'Remove the username and password from the URL — they would be stored with the run.'
  }
  return null
}

export function SubmitPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const runsQuery = useQuery({
    queryKey: ['runs'],
    queryFn: listRuns,
    // Same rule as the run page: the server's own state sets the cadence, and a list
    // with nothing live stops polling itself (AR26). `interrupted` counts as live —
    // it is derived from staleness (AD-5), the server never stopped the run, and a
    // late finish should land in the list without a reload.
    refetchInterval: (query) => {
      const rows = query.state.data?.runs
      if (!rows) return false
      if (rows.some((run) => run.state === 'processing')) return 2000
      return rows.some((run) => run.state === 'interrupted') ? 15000 : false
    },
  })

  const runs = runsQuery.data?.runs ?? []
  // FR35 — the UI mirrors the server's 409; the server owns the truth either way.
  const activeRun = runs.find((run) => run.state === 'processing') ?? null

  const create = useMutation({
    mutationFn: (input: string | File) =>
      typeof input === 'string' ? createRunFromUrl(input) : createRunFromFile(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['runs'] })
      navigate(`/runs/${created.id}`)
    },
  })

  const busy = create.isPending
  const blocked = busy || activeRun !== null

  const submitUrl = (event: FormEvent) => {
    event.preventDefault()
    const problem = validateUrl(url)
    setUrlError(problem)
    if (problem) return
    create.mutate(url.trim())
  }

  const submitFile = (event: FormEvent) => {
    event.preventDefault()
    if (!file) return
    create.mutate(file)
  }

  const submitError = create.error ? describeError(create.error) : null

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Extract a menu</CardTitle>
          <CardDescription>
            One source per run: a public menu URL, or a PDF or photo of the menu (JPG, PNG or
            WebP, up to 10 MB). HEIC photos need exporting as JPEG first.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form className="grid gap-2" onSubmit={submitUrl} noValidate>
            <Label htmlFor="menu-url">Menu URL</Label>
            <div className="flex gap-2">
              <Input
                id="menu-url"
                name="url"
                value={url}
                placeholder="https://example.com/menu"
                aria-invalid={urlError !== null}
                aria-describedby={urlError ? 'menu-url-error' : undefined}
                onChange={(event) => {
                  setUrl(event.target.value)
                  if (urlError) setUrlError(null)
                }}
                disabled={blocked}
              />
              <Button type="submit" disabled={blocked}>
                Extract
              </Button>
            </div>
            {urlError && (
              <p id="menu-url-error" className="text-sm text-destructive">
                {urlError}
              </p>
            )}
          </form>

          <form className="grid gap-2" onSubmit={submitFile}>
            <Label htmlFor="menu-file">…or a PDF or photo</Label>
            <div className="flex gap-2">
              <Input
                id="menu-file"
                name="file"
                type="file"
                accept={ACCEPT}
                className="h-auto py-1.5"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                disabled={blocked}
              />
              <Button type="submit" variant="outline" disabled={blocked || file === null}>
                Upload
              </Button>
            </div>
          </form>

          {activeRun && (
            <Alert>
              <AlertTitle>A run is already processing</AlertTitle>
              <AlertDescription>
                One run at a time.{' '}
                <Link to={`/runs/${activeRun.id}`} className="underline">
                  Watch it
                </Link>{' '}
                — submitting is enabled again as soon as it finishes.
              </AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertTitle>
                {submitError.code === 'run_active' ? 'A run is already processing' : 'Not submitted'}
              </AlertTitle>
              {/* The envelope message is shown verbatim: it carries the 415 HEIC copy and
                  the 413 size cap, and rewording it here would let the two drift apart. */}
              <AlertDescription>{submitError.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg font-medium">Recent extractions</h2>
          {runsQuery.isError && (
            <span className="text-sm text-muted-foreground">
              Could not load the list — reconnecting.
            </span>
          )}
        </div>

        {runsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : runs.length === 0 ? (
          <Alert>
            <AlertTitle>No extractions yet</AlertTitle>
            <AlertDescription>
              Paste a menu URL in the form above, or upload a PDF or a photo of the menu. Every run
              you start shows up here.
            </AlertDescription>
          </Alert>
        ) : (
          <RecentRuns
            runs={runs}
            blocked={blocked}
            onRetry={(run) => create.mutate(run.source_ref)}
          />
        )}
      </section>
    </div>
  )
}

function RecentRuns({
  runs,
  blocked,
  onRetry,
}: {
  runs: RunSummary[]
  blocked: boolean
  onRetry: (run: RunSummary) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Started</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="text-right">Dishes</TableHead>
          <TableHead>Reviewed</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* FR29 — newest first, as the server returns them. The web never re-sorts. */}
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell className="text-muted-foreground">{formatTimestamp(run.created_at)}</TableCell>
            <TableCell className="max-w-[22rem] truncate" title={run.source_ref}>
              <span className="text-muted-foreground">{run.source_type}</span> {run.source_ref}
            </TableCell>
            <TableCell>
              <RunStateBadge state={run.state} />
            </TableCell>
            <TableCell className="text-right">{run.dish_count}</TableCell>
            <TableCell className="text-muted-foreground">
              {run.review_progress.total === 0
                ? '—'
                : `${run.review_progress.resolved} of ${run.review_progress.total} resolved`}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {(run.state === 'failed' || run.state === 'interrupted') &&
                  (run.source_type === 'url' ? (
                    // FR8 — retry is a new run through the same POST; this row is untouched.
                    <Button size="sm" variant="outline" disabled={blocked} onClick={() => onRetry(run)}>
                      Retry
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">re-upload to retry</span>
                  ))}
                <Button size="sm" variant="ghost" nativeButton={false} render={<Link to={`/runs/${run.id}`} />}>
                  Open
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
