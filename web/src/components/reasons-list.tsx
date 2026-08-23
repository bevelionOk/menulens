import type { Dish } from 'shared'

import { ALLERGEN_LABEL } from '@/lib/copy'

// FR24 — an `uncertain` row must arrive with its evidence in view, not behind a click.
// Two things are shown: the rules the deterministic arbiter fired (with the reason it
// recorded), and every evidence quote the model supplied, each labelled with whether it
// was found in the source text. `match` is null when the quote did not verify — or when
// the source was an image and there was no ground text to verify against (FR19).
export function ReasonsList({ dish }: { dish: Dish }) {
  const quotes = dish.allergens.filter((allergen) => allergen.evidence_quote !== null)

  return (
    <div className="grid gap-3 border-l-2 border-border py-1 pl-3 text-sm">
      <div>
        <p className="font-medium">Why this row needs review</p>
        {dish.confidence_reasons.length === 0 ? (
          // A flagged row with no recorded reason should say so. A heading over an empty
          // list reads as a rendering bug and tells the reviewer nothing.
          <p className="mt-1 text-muted-foreground">
            This row is flagged, but no rule recorded a reason — check it by hand.
          </p>
        ) : (
          <ul className="mt-1 grid gap-1 text-muted-foreground">
            {dish.confidence_reasons.map((reason, index) => (
              <li key={`${reason.rule}-${index}`}>
                <span className="font-mono text-xs text-foreground">{reason.rule}</span>{' '}
                {reason.detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      {quotes.length > 0 && (
        <div>
          <p className="font-medium">What the model quoted from the menu</p>
          <ul className="mt-1 grid gap-1 text-muted-foreground">
            {quotes.map((allergen, index) => (
              <li key={`${allergen.id}-${index}`}>
                <span className="text-foreground">{ALLERGEN_LABEL[allergen.id] ?? allergen.id}</span>:{' '}
                <q className="italic">{allergen.evidence_quote}</q>{' '}
                <span className="text-xs">
                  {allergen.match
                    ? '(found in the source text)'
                    : '(not verified — the quote did not match, or the source was an image with no text to match against)'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
