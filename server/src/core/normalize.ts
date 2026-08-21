import { collapseWhitespace } from './html-to-text';

// AD-7 pinned normalization — the ONE chain for quote verification (T6) and name
// traceability (T4): NFKC → lowercase → NFD → strip combining marks → collapse whitespace.
// Both sides (quote/name and acquired text) pass through the same function, and the match
// is computed on the normalized strings. Because NFKC/NFD change string length, every
// normalized char carries the index of the original char it came from, so a normalized
// match maps back to offsets into the ORIGINAL text — what the web highlights (2.4).
// Offsets are JS string indices (UTF-16 code units, what `slice` takes); for the BMP text
// menus contain they equal code-point indices. Punctuation is NOT normalized (D20).

export interface Normalized {
  normalized: string;
  // `originOffsets[i]` = original index of normalized char `i`; one extra trailing entry
  // (= original length) marks the end.
  originOffsets: number[];
}

const WHITESPACE = /\s/u;
const MARK = /\p{M}/u;

export function normalizeForMatch(text: string): Normalized {
  const chars: string[] = [];
  const offsets: number[] = [];
  let index = 0;
  for (const original of text) {
    const folded = original.normalize('NFKC').toLowerCase().normalize('NFD');
    for (const ch of folded) {
      if (MARK.test(ch)) continue;
      if (WHITESPACE.test(ch) || ch === '\0') {
        // Collapse: runs → one space, none at the start (a trailing one is trimmed below).
        if (chars.length === 0 || chars[chars.length - 1] === ' ') continue;
        chars.push(' ');
      } else {
        chars.push(ch);
      }
      offsets.push(index);
    }
    index += original.length;
  }
  if (chars.length > 0 && chars[chars.length - 1] === ' ') {
    chars.pop();
    offsets.pop();
  }
  offsets.push(text.length);
  // Same whitespace rule as the "usable chars" measure (`collapseWhitespace`): a no-op here
  // by construction, kept so the two definitions can never drift apart silently.
  return { normalized: collapseWhitespace(chars.join('')), originOffsets: offsets };
}

// `indexOf` on the normalized strings, mapped back to original offsets (`end` exclusive).
// A blank needle never matches.
export function findNormalized(haystack: string, needle: string): { start: number; end: number } | null {
  const hay = normalizeForMatch(haystack);
  const nee = normalizeForMatch(needle).normalized;
  if (nee.length === 0) return null;
  const at = hay.normalized.indexOf(nee);
  if (at === -1) return null;
  const lastOrigin = hay.originOffsets[at + nee.length - 1]!;
  const lastOriginLength = String.fromCodePoint(haystack.codePointAt(lastOrigin)!).length;
  return { start: hay.originOffsets[at]!, end: lastOrigin + lastOriginLength };
}
