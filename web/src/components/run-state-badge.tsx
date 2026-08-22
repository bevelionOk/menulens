import type { RunState } from 'shared'

import { Badge } from '@/components/ui/badge'
import { STATE_LABEL } from '@/lib/copy'

// `empty` is deliberately not styled as a failure (AD-4, E9): zero dishes is an honest
// outcome, not an error. Only `failed` gets the destructive treatment.
const VARIANT: Record<RunState, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  processing: 'default',
  done: 'outline',
  failed: 'destructive',
  empty: 'secondary',
  interrupted: 'secondary',
}

export function RunStateBadge({ state }: { state: RunState }) {
  return <Badge variant={VARIANT[state]}>{STATE_LABEL[state]}</Badge>
}
