import { collapseWhitespace } from './html-to-text';

// AD-7 pinned normalization — the ONE chain for quote verification (T6) and name
// traceability (T4): NFKC → lowercase → NFD → strip combining marks → collapse whitespace.
// Both sides (quote/name and acquired text) pass through the same function, and the match
// is computed on the normalized strings. Because NFKC/NFD change string length, every
// normalized code unit carries the index of the original character it came from, so a
// normalized match maps back to offsets into the ORIGINAL text — what the web highlights
// (2.4). Offsets are JS string indices (UTF-16 code units, what `slice` takes).
// Punctuation is NOT normalized (D20).

export interface Normalized {
  // The original text the offsets point into.
  source: string;
  normalized: string;
  // `originOffsets[i]` = original index of the character that produced code unit `i` of
  // `normalized`; one extra trailing entry (= `source.length`) marks the end.
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
      // NUL is dropped outright, exactly as `collapseWhitespace` does it.
      if (ch === '\0') continue;
      if (WHITESPACE.test(ch)) {
        // Collapse: runs → one space, none at the start (a trailing one is trimmed below).
        if (chars.length === 0 || chars[chars.length - 1] === ' ') continue;
        chars.push(' ');
        offsets.push(index);
      } else {
        chars.push(ch);
        // One entry per UTF-16 code unit: `indexOf` below counts units, not code points,
        // so an astral character (an emoji on a menu) must occupy two entries.
        for (let unit = 0; unit < ch.length; unit += 1) offsets.push(index);
      }
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
  return { source: text, normalized: collapseWhitespace(chars.join('')), originOffsets: offsets };
}

// `indexOf` on the normalized strings, mapped back to original offsets (`end` exclusive).
// A blank needle never matches. The haystack may be pre-normalized: the ground text is
// normalized once per run, not once per quote.
export function findNormalized(haystack: string | Normalized, needle: string): { start: number; end: number } | null {
  const hay = typeof haystack === 'string' ? normalizeForMatch(haystack) : haystack;
  const nee = normalizeForMatch(needle).normalized;
  if (nee.length === 0) return null;
  const at = hay.normalized.indexOf(nee);
  if (at === -1) return null;
  const start = hay.originOffsets[at];
  const lastOrigin = hay.originOffsets[at + nee.length - 1];
  // The map and the normalized string must stay in step; refuse rather than emit a
  // half-computed offset the evidence panel would highlight wrongly.
  if (start === undefined || lastOrigin === undefined) return null;
  let end = lastOrigin + String.fromCodePoint(hay.source.codePointAt(lastOrigin)!).length;
  // A decomposed source keeps its combining marks (they were stripped for matching); walk
  // over them so the span covers the whole accented character, not its base letter.
  while (end < hay.source.length && MARK.test(hay.source[end]!)) end += 1;
  return { start, end };
}
