// Dependency-free HTML → text (spec Boundaries): no parser — a menu page only needs its
// visible text, and the "usable chars" measure is the collapsed length of that text.

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  middot: '·',
  bull: '•',
  deg: '°',
};

// Invisible containers: their whole content goes, not just the tags.
const DROP_ELEMENTS = /<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
// Block-level closes/breaks become whitespace so adjacent words never fuse.
const TAGS = /<\/?[a-zA-Z!][^>]*>/g;

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[body] ?? match;
  });
}

// The "usable chars" normalization: every whitespace run → one space, trimmed.
export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function htmlToText(html: string): string {
  const stripped = html.replace(COMMENTS, '').replace(DROP_ELEMENTS, '').replace(TAGS, ' ');
  return collapseWhitespace(decodeEntities(stripped));
}
