import type { AllergenEntry, AllergenSignal, ConfidenceReason, SourceClass } from 'shared';
import { findNormalized, normalizeForMatch, type Normalized } from './normalize';

// T6 evidence verification (FR16, AD-7) — runs before triage. A `declared` allergen must
// prove itself: no quote ⇒ `inferred` on every class; on `text`-class runs a quote not
// found in the (normalized) acquired text ⇒ `inferred`; a found quote gets offsets into
// the original text; a found quote that carries no declaration marker (B45, D28 §8) ⇒
// `inferred`, offsets kept. `visual` runs have no ground text: the quote cannot be
// verified, so the entry keeps `declared` and `match: null` but a T6 reason fires — a row
// on a visual source is never `reliable` (B10). Each reason is recorded; the arbiter's T1
// then fires on every `inferred` entry. The ground text arrives pre-normalized — one
// chain, one pass per run.

export interface EvidenceVerification {
  allergens: AllergenEntry[];
  reasons: ConfidenceReason[];
}

// Calibration data (like `SOURCE_MIN_TEXT_CHARS`): what makes a quote a declaration rather
// than an ingredient word. Tested against the quote after `normalizeForMatch` (lowercase,
// accents stripped), so `Alérgenos` / `enthält` / `enthaelt` are matched in folded form.
export const DECLARATION_MARKERS: readonly RegExp[] = [
  // Declaration words: es/en/de/it/fr.
  /\b(?:contiene|contains|enthae?lt|allergens?|alergenos?|allergene|allergeni|allergenes)\b/u,
  // Legend key in parentheses: `(a)`, `(g)`, `(ab)`, `(1)`, `(12)`.
  /\([a-z]{1,2}\)|\(\d{1,2}\)/u,
  // Digit code list: `1,3,7` / `1 3 7` — two or more one-/two-digit codes.
  /(?<!\d)\d{1,2}(?:\s*,\s*\d{1,2}|\s+\d{1,2})+(?!\d)/u,
];
// A bare number followed by a currency word is a price, not a code list.
const PRICE_IN_QUOTE = /\d[\d.,]*\s*(?:€|eur\b)/gu;

export function hasDeclarationMarker(quote: string): boolean {
  const folded = normalizeForMatch(quote).normalized.replace(PRICE_IN_QUOTE, '');
  return DECLARATION_MARKERS.some((marker) => marker.test(folded));
}

export function verifyEvidence(
  allergens: AllergenSignal[],
  sourceClass: SourceClass,
  ground: Normalized | null,
): EvidenceVerification {
  const reasons: ConfidenceReason[] = [];
  const verified = allergens.map((entry): AllergenEntry => {
    if (entry.provenance !== 'declared') return { ...entry, match: null };
    const quote = entry.evidence_quote;
    if (quote === null || quote.trim() === '') {
      reasons.push({ rule: 'T6', detail: `${entry.id}: declared without an evidence quote` });
      return { ...entry, provenance: 'inferred', match: null };
    }
    if (sourceClass === 'visual') {
      reasons.push({ rule: 'T6', detail: `${entry.id}: declared on a visual source; quote not verifiable` });
      return { ...entry, match: null };
    }
    const match = ground === null ? null : findNormalized(ground, quote);
    if (match === null) {
      reasons.push({ rule: 'T6', detail: `${entry.id}: evidence quote not found in the source text` });
      return { ...entry, provenance: 'inferred', match: null };
    }
    if (!hasDeclarationMarker(quote)) {
      reasons.push({ rule: 'T6', detail: `${entry.id}: evidence quote carries no declaration marker` });
      return { ...entry, provenance: 'inferred', match };
    }
    return { ...entry, match };
  });
  return { allergens: verified, reasons };
}
