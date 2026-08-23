import type { AllergenEntry, AllergenSignal, ConfidenceReason, SourceClass } from 'shared';
import { findNormalized, normalizeForMatch, type Normalized } from './normalize';

// T6 evidence verification (FR16, AD-7) — runs before triage. A `declared` allergen must
// prove itself: no quote ⇒ `inferred` on every class; on `text`-class runs a quote not
// found in the (normalized) acquired text ⇒ `inferred`; a found quote gets offsets into
// the original text; a quote that carries no declaration marker (B45, D28 §8) ⇒
// `inferred` on every class, offsets kept when the text has it. `visual` runs have no ground text: the quote cannot be
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
// accents stripped), so `Alérgenos` / `enthält` / `conté` are matched in folded form.
// Review 2026-08-23: a lone number (`Pulpo 14`) and bare letter codes (`A, C, G`) are not
// markers — a lone number is more often a price (deferred with B42's legend reading).
export const DECLARATION_MARKERS: readonly RegExp[] = [
  // Declaration words: es/en/de/fr/it/ca/pt, plural and "may contain" forms.
  /\b(?:contiene[n]?|contient|conte|contem|contains?|contener|contain|trazas?|traces?|tracce|spuren|enthae?lt|enthalten|allergens?|alergenos?|alergen\w*|allergen\w*|al\W?lergens?)\b/u,
  // Legend key in parentheses: `(a)`, `(g)`, `(a, g)`, `(1)`, `(12)`; diet tags `(v)`, `(vg)`, `(ve)` excluded.
  /\(\s*(?!(?:v|vg|ve)\s*\))(?:[a-z]{1,2}|\d{1,2})(?:\s*,\s*(?:[a-z]{1,2}|\d{1,2}))*\s*\)/u,
  // Digit code list: `1,3,7` — two or more comma-separated one-/two-digit codes
  // (space-separated numbers are covers and portions more often than codes).
  /(?<!\d)\d{1,2}(?:\s*,\s*\d{1,2})+(?!\d)/u,
];
// Prices are not codes: a number with two decimals (`12,50`), a dot decimal (`8.5`) and any
// number next to a currency word, before or after (`€ 12`, `12 euros`), are removed before
// the digit test. `1,3,7` survives: one digit after each comma.
const PRICE_IN_QUOTE = /(?:€|\beuros?\b|\beur\b)\s*\d[\d.,]*|\d[\d.,]*\s*(?:€|\beuros?\b|\beur\b)|\d+[.,]\d{2}(?!\d)|\d+\.\d+/gu;
const NO_MARKER = 'evidence quote carries no declaration marker (no contiene/allergens line, no legend key)';

export function hasDeclarationMarker(quote: string): boolean {
  const folded = normalizeForMatch(quote).normalized.replace(PRICE_IN_QUOTE, ' ');
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
      if (!hasDeclarationMarker(quote)) {
        reasons.push({ rule: 'T6', detail: `${entry.id}: ${NO_MARKER}` });
        return { ...entry, provenance: 'inferred', match: null };
      }
      reasons.push({ rule: 'T6', detail: `${entry.id}: declared on a visual source; quote not verifiable` });
      return { ...entry, match: null };
    }
    const match = ground === null ? null : findNormalized(ground, quote);
    if (match === null) {
      reasons.push({ rule: 'T6', detail: `${entry.id}: evidence quote not found in the source text` });
      return { ...entry, provenance: 'inferred', match: null };
    }
    if (!hasDeclarationMarker(quote)) {
      reasons.push({ rule: 'T6', detail: `${entry.id}: ${NO_MARKER}` });
      return { ...entry, provenance: 'inferred', match };
    }
    return { ...entry, match };
  });
  return { allergens: verified, reasons };
}
