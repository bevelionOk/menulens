import type { AllergenEntry, AllergenSignal, ConfidenceReason, SourceClass } from 'shared';
import { findNormalized } from './normalize';

// T6 evidence verification (FR16, AD-7) — runs before triage. A `declared` allergen must
// prove itself: no quote ⇒ `inferred` on every class; on `text`-class runs a quote not
// found in the (normalized) acquired text ⇒ `inferred`; a found quote gets offsets into
// the original text. `visual` runs have no ground text: quotes pass through unverified
// (`match: null`). Each downgrade records a T6 reason; the arbiter's T1 then fires on the
// now-`inferred` entry.

export interface EvidenceVerification {
  allergens: AllergenEntry[];
  reasons: ConfidenceReason[];
}

export function verifyEvidence(
  allergens: AllergenSignal[],
  sourceClass: SourceClass,
  acquiredText: string | null,
): EvidenceVerification {
  const reasons: ConfidenceReason[] = [];
  const verified = allergens.map((entry): AllergenEntry => {
    if (entry.provenance !== 'declared') return { ...entry, match: null };
    const quote = entry.evidence_quote;
    if (quote === null || quote.trim() === '') {
      reasons.push({ rule: 'T6', detail: `${entry.id}: declared without an evidence quote` });
      return { ...entry, provenance: 'inferred', match: null };
    }
    if (sourceClass === 'visual') return { ...entry, match: null };
    const match = acquiredText === null ? null : findNormalized(acquiredText, quote);
    if (match === null) {
      reasons.push({ rule: 'T6', detail: `${entry.id}: evidence quote not found in the source text` });
      return { ...entry, provenance: 'inferred', match: null };
    }
    return { ...entry, match };
  });
  return { allergens: verified, reasons };
}
