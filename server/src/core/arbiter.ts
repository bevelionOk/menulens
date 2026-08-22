import type { AllergenEntry, ConfidenceReason, DescriptionProvenance, Flag, ModelDishSignal, SourceClass } from 'shared';
import { findNormalized, type Normalized } from './normalize';
import { parsePrice } from './price';
import { verifyEvidence } from './t6-verify';

// The deterministic arbiter (FR17, AD-7, D4): T6 → T1 → T2 → T3 → T4 → T5 over the
// model's signals; every fired rule appends `{ rule, detail }`; `reliable` means exactly
// "no rule fired". Pure and total: never drops or merges rows, never uses model
// self-confidence, never looks at description provenance.

export interface TriageContext {
  source_class: SourceClass;
  // The stored ground text, normalized once per run (AD-7): `null` on `visual` runs and
  // whenever no text was acquired.
  ground: Normalized | null;
}

export interface TriagedDish {
  name: string;
  price_raw: string | null;
  price_value: number | null;
  allergens: AllergenEntry[];
  description: string;
  description_provenance: DescriptionProvenance;
  confidence_reasons: ConfidenceReason[];
  flag: Flag;
}

export function triageDish(signal: ModelDishSignal, ctx: TriageContext): TriagedDish {
  const reasons: ConfidenceReason[] = [];

  // T6 first: unproven `declared` becomes `inferred` before the gate looks.
  const evidence = verifyEvidence(signal.allergens, ctx.source_class, ctx.ground);
  reasons.push(...evidence.reasons);

  // T1 — the allergen gate (FR21): any inferred, or no allergen information at all.
  if (evidence.allergens.length === 0) {
    reasons.push({ rule: 'T1', detail: 'no allergen information' });
  } else {
    const inferred = evidence.allergens.filter((a) => a.provenance === 'inferred').map((a) => a.id);
    if (inferred.length > 0) reasons.push({ rule: 'T1', detail: `inferred allergens: ${inferred.join(', ')}` });
  }

  // T2 / T3 — price (FR10).
  const price = parsePrice(signal.price_raw);
  if (price.value === null) reasons.push({ rule: 'T2', detail: 'no unambiguous price value' });
  if (price.currency === 'other') reasons.push({ rule: 'T3', detail: 'non-EUR currency' });
  if (price.currency === 'mixed') reasons.push({ rule: 'T3', detail: 'mixed currencies' });

  // T4 — name blank, or (text class) not traceable in the source text.
  if (signal.name.trim() === '') {
    reasons.push({ rule: 'T4', detail: 'name is blank' });
  } else if (ctx.source_class === 'text' && (ctx.ground === null || findNormalized(ctx.ground, signal.name) === null)) {
    reasons.push({ rule: 'T4', detail: 'name not found in the source text' });
  }

  // T5 — the model's criteria-anchored self-flag.
  // A blank reason is no reason: the reviewer always reads why a rule fired.
  if (signal.self_flag) reasons.push({ rule: 'T5', detail: signal.self_flag_reason?.trim() || 'model self-flag' });

  return {
    name: signal.name,
    price_raw: signal.price_raw,
    price_value: price.value,
    allergens: evidence.allergens,
    description: signal.description,
    description_provenance: signal.description_provenance,
    confidence_reasons: reasons,
    flag: reasons.length === 0 ? 'reliable' : 'uncertain',
  };
}
