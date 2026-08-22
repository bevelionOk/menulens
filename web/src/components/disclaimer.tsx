import { TriangleAlert } from 'lucide-react'

import { DISCLAIMER } from '@/lib/copy'

// FR28 — always visible on the review screen, never dismissible. Ana stays accountable
// for what she publishes; the app never implies otherwise.
export function Disclaimer() {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
      {DISCLAIMER}
    </p>
  )
}
