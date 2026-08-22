// FR10 price parsing (spec 1.6 Boundaries): `price_value` only for exactly one numeric
// token, no range/"from" marker, no non-EUR currency marker, one decimal separator
// (comma or dot). A bare number is EUR by the platform assumption; `€` is confirmation.
// Everything else is null — a triage signal (T2/T3), never a guess.

export type Currency = 'eur' | 'other' | 'mixed' | 'none';

export interface ParsedPrice {
  value: number | null;
  currency: Currency;
}

const NUMERIC_TOKEN = /\d+(?:[.,]\d+)*/g;
const EUR_MARKER = /€|\bEUR\b|\beuros?\b/iu;
// The obvious symbols / ISO codes only (spec: ask before widening).
const OTHER_MARKER = /[$£¥]|\b(?:USD|GBP|CHF|JPY|CAD|AUD)\b/iu;
// Range / "from" markers; `–` and `—` are the same dash as `-` on a menu.
const RANGE_MARKER = /[-–—/…]|\bdesde\b|\bfrom\b|\ba partir\b/iu;

export function detectCurrency(raw: string): Currency {
  const eur = EUR_MARKER.test(raw);
  const other = OTHER_MARKER.test(raw);
  if (eur && other) return 'mixed';
  if (eur) return 'eur';
  if (other) return 'other';
  return 'none';
}

export function parsePrice(priceRaw: string | null): ParsedPrice {
  if (priceRaw === null) return { value: null, currency: 'none' };
  const currency = detectCurrency(priceRaw);
  if (currency === 'other' || currency === 'mixed') return { value: null, currency };
  const tokens = priceRaw.match(NUMERIC_TOKEN) ?? [];
  if (tokens.length !== 1 || RANGE_MARKER.test(priceRaw)) return { value: null, currency };
  const token = tokens[0]!;
  // Both separators, or the same one twice (`1.250.000`), is ambiguous.
  if (token.replace(/\d/g, '').length > 1) return { value: null, currency };
  const value = Number(token.replace(',', '.'));
  // `dishes.price_value` is numeric(10,2): a value out of that range would abort the whole
  // `saving` transaction and discard every dish in the run, so an implausible number
  // refuses like any other ambiguity (T2) instead.
  if (!Number.isFinite(value) || value >= 100_000_000) return { value: null, currency };
  return { value: Math.round(value * 100) / 100, currency };
}
