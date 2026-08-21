// AD-11 SSRF rule, pure so it is reviewable in isolation: given one resolved address,
// is it a target the fetcher must refuse? Resolution (`dns.lookup`) stays in the shell.
// Refused: 10/8, 172.16/12, 192.168/16, 127/8, 0/8, 169.254/16 (cloud metadata), `::1`,
// `::`, fc00::/7 (ULA), fe80::/10 (link-local), and IPv4-mapped IPv6 wrapping any of those.

function parseV4(ip: string): number[] | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return octets.every((o) => Number.isInteger(o) && o >= 0 && o <= 255) ? octets : null;
}

function isRefusedV4(octets: number[]): boolean {
  const [a, b] = octets as [number, number, number, number];
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

// Expands `::` and returns the 8 hextets, or null when malformed. An embedded dotted
// v4 tail (`::ffff:10.0.0.1`) is converted to its two hextets first.
function parseV6(ip: string): number[] | null {
  let s = ip;
  const zone = s.indexOf('%');
  if (zone !== -1) s = s.slice(0, zone);
  const v4Tail = /(?:^|:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(s);
  if (v4Tail?.[1]) {
    const v4 = parseV4(v4Tail[1]);
    if (!v4) return null;
    const [a, b, c, d] = v4 as [number, number, number, number];
    s = `${s.slice(0, s.length - v4Tail[1].length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const toHextets = (part: string) => (part === '' ? [] : part.split(':').map((h) => parseInt(h, 16)));
  const head = toHextets(halves[0] ?? '');
  const tail = halves.length === 2 ? toHextets(halves[1] ?? '') : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const hextets = [...head, ...new Array<number>(halves.length === 2 ? missing : 0).fill(0), ...tail];
  return hextets.every((h) => Number.isInteger(h) && h >= 0 && h <= 0xffff) ? hextets : null;
}

export function isRefusedAddress(ip: string): boolean {
  const v4 = parseV4(ip);
  if (v4) return isRefusedV4(v4);
  const v6 = parseV6(ip);
  // Unparseable is refused: an address the rule cannot read is not one it can vouch for.
  if (!v6) return true;
  const [h0, h1, h2, h3, h4, h5, h6, h7] = v6 as [number, number, number, number, number, number, number, number];
  const allZeroPrefix = h0 === 0 && h1 === 0 && h2 === 0 && h3 === 0 && h4 === 0;
  if (allZeroPrefix && h5 === 0 && h6 === 0 && (h7 === 0 || h7 === 1)) return true; // :: and ::1
  if (allZeroPrefix && h5 === 0xffff) {
    return isRefusedV4([h6 >> 8, h6 & 0xff, h7 >> 8, h7 & 0xff]); // ::ffff:a.b.c.d
  }
  if ((h0 & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((h0 & 0xffc0) === 0xfe80) return true; // fe80::/10
  return false;
}
