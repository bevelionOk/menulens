import type { Flag } from 'shared'

import { Badge } from '@/components/ui/badge'

// FR15 copy rule: the two words are "auto-checked" and "needs review". Never "safe",
// never "verified" — the arbiter can only say that no rule fired, which is not a claim
// that the row is correct.
export function FlagBadge({ flag }: { flag: Flag }) {
  return flag === 'reliable' ? (
    <Badge variant="outline" title="No triage rule fired on this row.">
      auto-checked
    </Badge>
  ) : (
    <Badge title="At least one triage rule fired — the reasons are listed under the row.">
      needs review
    </Badge>
  )
}
