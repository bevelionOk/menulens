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
  // HTML4 Latin-1 set (ISO-8859-1 code points 160–255) — the accents menus use.
  iexcl: '¡', cent: '¢', curren: '¤', yen: '¥', brvbar: '¦', sect: '§', uml: '¨', ordf: 'ª', not: '¬', shy: '\u00ad', macr: '¯',
  plusmn: '±', sup2: '²', sup3: '³', acute: '´', micro: 'µ', para: '¶', cedil: '¸', sup1: '¹', ordm: 'º', frac14: '¼', frac12: '½',
  frac34: '¾', iquest: '¿',
  Agrave: 'À', Aacute: 'Á', Acirc: 'Â', Atilde: 'Ã', Auml: 'Ä', Aring: 'Å', AElig: 'Æ', Ccedil: 'Ç', Egrave: 'È', Eacute: 'É',
  Ecirc: 'Ê', Euml: 'Ë', Igrave: 'Ì', Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï', ETH: 'Ð', Ntilde: 'Ñ', Ograve: 'Ò', Oacute: 'Ó', Ocirc: 'Ô',
  Otilde: 'Õ', Ouml: 'Ö', times: '×', Oslash: 'Ø', Ugrave: 'Ù', Uacute: 'Ú', Ucirc: 'Û', Uuml: 'Ü', Yacute: 'Ý', THORN: 'Þ', szlig: 'ß',
  agrave: 'à', aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å', aelig: 'æ', ccedil: 'ç', egrave: 'è', eacute: 'é',
  ecirc: 'ê', euml: 'ë', igrave: 'ì', iacute: 'í', icirc: 'î', iuml: 'ï', eth: 'ð', ntilde: 'ñ', ograve: 'ò', oacute: 'ó', ocirc: 'ô',
  otilde: 'õ', ouml: 'ö', divide: '÷', oslash: 'ø', ugrave: 'ù', uacute: 'ú', ucirc: 'û', uuml: 'ü', yacute: 'ý', thorn: 'þ', yuml: 'ÿ',
};

// Invisible containers: their whole content goes, not just the tags.
const DROP_ELEMENTS = /<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const COMMENTS = /<!--[\s\S]*?-->/g;
// Block-level closes/breaks become whitespace so adjacent words never fuse.
const TAGS = /<\/?[a-zA-Z!?][^>]*>/g;

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      // Surrogate code points are not valid scalar values — Postgres `text` would reject them.
      if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return match;
      return String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body] ?? match;
  });
}

// The "usable chars" normalization: every whitespace run → one space, trimmed. NUL is
// stripped here because every persisted text (HTML, plain, PDF) passes through this
// function and Postgres `text` rejects it.
export function collapseWhitespace(text: string): string {
  return text.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
}

export function htmlToText(html: string): string {
  const stripped = html.replace(COMMENTS, '').replace(DROP_ELEMENTS, '').replace(TAGS, ' ');
  return collapseWhitespace(decodeEntities(stripped));
}
