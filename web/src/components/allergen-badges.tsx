import type { AllergenEntry } from 'shared'

import { Badge } from '@/components/ui/badge'
import { ALLERGEN_LABEL } from '@/lib/copy'

// FR13 / FR21. Two things this must never do: render an empty list as blank (a blank
// cell reads as "no allergens", which is a claim nobody made), and render `declared`
// and `inferred` alike (one was written on the menu, the other was guessed by a model).
export function AllergenBadges({ allergens }: { allergens: AllergenEntry[] }) {
  if (allergens.length === 0) {
    return (
      <Badge
        variant="destructive"
        title="No allergen was found on the menu for this dish. That is not the same as none being present."
      >
        allergens unknown
      </Badge>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {allergens.map((allergen) => (
        <Badge
          key={`${allergen.id}-${allergen.provenance}`}
          variant={allergen.provenance === 'declared' ? 'outline' : 'secondary'}
          title={
            allergen.provenance === 'declared'
              ? 'Stated on the menu — the model quoted the text it read this in.'
              : 'Not stated on the menu — inferred by the model from the dish.'
          }
        >
          {ALLERGEN_LABEL[allergen.id]}
          <span className="text-muted-foreground">· {allergen.provenance}</span>
        </Badge>
      ))}
    </div>
  )
}
