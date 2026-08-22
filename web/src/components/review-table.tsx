import { useState } from 'react'
import type { Dish, ReviewAction } from 'shared'

import { AllergenBadges } from '@/components/allergen-badges'
import { FlagBadge } from '@/components/flag-badge'
import { ReasonsList } from '@/components/reasons-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { REVIEW_STATUS_LABEL, formatTimestamp } from '@/lib/copy'

export type ReviewDecision = { dish_id: string; action: ReviewAction; note: string | null }

// Matches the cap `reviewRequestSchema` enforces on the server: a note the field lets you
// type but the API refuses is a rejection the UI could have prevented.
const NOTE_MAX_LENGTH = 2000

type ReviewTableProps = {
  dishes: Dish[]
  onDecide: (decision: ReviewDecision) => void
  pendingDishId: string | null
  busy: boolean
}

// FR28: there is no edit affordance anywhere in this table. Extracted values are
// immutable — the only thing a review writes is a verdict and an optional note.
export function ReviewTable({ dishes, onDecide, pendingDishId, busy }: ReviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[32%]">Dish</TableHead>
          <TableHead className="w-[12%]">Price</TableHead>
          <TableHead className="w-[22%]">Allergens</TableHead>
          <TableHead className="w-[12%]">Confidence</TableHead>
          <TableHead className="w-[22%]">Review</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dishes.map((dish) => (
          <ReviewRow
            key={dish.id}
            dish={dish}
            onDecide={onDecide}
            busy={busy}
            pending={pendingDishId === dish.id}
          />
        ))}
      </TableBody>
    </Table>
  )
}

type ReviewRowProps = {
  dish: Dish
  onDecide: (decision: ReviewDecision) => void
  pending: boolean
  busy: boolean
}

function ReviewRow({ dish, onDecide, pending, busy }: ReviewRowProps) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const priceRaw = dish.price_raw?.trim() ?? ''

  const submitFollowup = () => {
    onDecide({ dish_id: dish.id, action: 'followup', note: note.trim() || null })
    setNoteOpen(false)
    setNote('')
  }

  return (
    <>
      <TableRow className={dish.flag === 'uncertain' ? 'border-b-0' : undefined}>
        <TableCell className="align-top whitespace-normal">
          <div className="font-medium">{dish.name}</div>
          <p className="mt-1 text-muted-foreground">
            {dish.description || <span className="italic">no description</span>}
          </p>
          {dish.description_provenance === 'generated' && (
            <Badge
              variant="secondary"
              className="mt-1"
              title="The menu carried no description — the model wrote this one."
            >
              generated
            </Badge>
          )}
        </TableCell>

        <TableCell className="align-top whitespace-normal">
          {/* A menu with no price can reach us as null or as an empty string; both are
              "no price", and only the trimmed test catches the second. */}
          <div>{priceRaw || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {priceRaw === ''
              ? 'no price on the menu'
              : dish.price_value !== null
                ? `€${dish.price_value.toFixed(2)}`
                : 'no single unambiguous amount'}
          </div>
        </TableCell>

        <TableCell className="align-top whitespace-normal">
          <AllergenBadges allergens={dish.allergens} />
        </TableCell>

        <TableCell className="align-top whitespace-normal">
          <FlagBadge flag={dish.flag} />
        </TableCell>

        <TableCell className="align-top whitespace-normal">
          {dish.review_status === 'pending' ? (
            noteOpen ? (
              <div className="grid gap-2">
                <Textarea
                  autoFocus
                  value={note}
                  maxLength={NOTE_MAX_LENGTH}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional note — what to check, who to ask"
                  aria-label={`Follow-up note for ${dish.name}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitFollowup} disabled={busy}>
                    {pending ? 'Saving…' : 'Save follow-up'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNoteOpen(false)
                      setNote('')
                    }}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onDecide({ dish_id: dish.id, action: 'confirm', note: null })}
                >
                  {pending ? 'Saving…' : 'Confirm'}
                </Button>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => setNoteOpen(true)}>
                  Mark for follow-up
                </Button>
              </div>
            )
          ) : (
            <div className="grid gap-1">
              <Badge variant={dish.review_status === 'confirmed' ? 'outline' : 'secondary'}>
                {REVIEW_STATUS_LABEL[dish.review_status] ?? dish.review_status}
              </Badge>
              {dish.followup_note && <p className="text-xs">{dish.followup_note}</p>}
              {dish.reviewed_at && (
                <p className="text-xs text-muted-foreground">{formatTimestamp(dish.reviewed_at)}</p>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>

      {dish.flag === 'uncertain' && (
        <TableRow>
          <TableCell colSpan={5} className="pt-0 whitespace-normal">
            <ReasonsList dish={dish} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
