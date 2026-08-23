// The fixture source: a real PDF with a real text layer, built here rather than committed
// as a binary so the menu the run acquires is readable in the diff. It is a genuine upload
// — `POST /api/runs` stores these bytes, acquisition runs pdfjs over them, and the text
// below is what T4 and T6 verify against. No network is involved anywhere.

// The lines the extracted text layer yields, in order. Over `SOURCE_MIN_TEXT_CHARS`
// (default 200) collapsed characters, so the class decision is `text`.
export const MENU_LINES = [
  // The `½` is load-bearing, not decoration: NFKC expands it to three characters, so from
  // here on the normalized string and the original text no longer share indices. Without
  // it every evidence offset would be correct by accident and swapping the origin-offset
  // map for plain normalized indices would pass unnoticed — the exact regression the
  // story-1.6 review found nothing in the repo could see.
  'Restaurante La Parra - Carta de temporada (½ ración disponible)',
  'Tortilla de patatas 8,50 € Contiene huevo y leche.',
  'Croquetas de jamón ibérico 9,75 € Alérgenos declarados: leche y gluten.',
  'Ensalada de la casa desde 6 € Aliño con mostaza y semillas de sésamo.',
  'Pulpo a la brasa 18 $ Servido sobre patata panadera.',
  'Tabla de quesos artesanos con nueces 14,00 €',
  'Postre del día 5,00 €',
  // A thousands group the parser must refuse (B14) and a legend key, the marker shape a
  // menu without prose declarations uses (B45): the price is not a code, the key is.
  'Bogavante del día 1.250 € (c, l)',
  // The legend the key resolves against. Not a dish: the mocked seam returns a fixed list,
  // and no fixture name overlaps it, so T4 is untouched. `(c, l)` occurs only on the dish
  // line, so the quote's first match is the dish, not the legend.
  'Leyenda de alérgenos: (c) crustáceos, (l) lácteos',
];

// The few characters a Spanish menu needs that WinAnsi puts outside Latin-1.
const WINANSI_HIGH: Record<string, number> = { '€': 0x80, '—': 0x97, '–': 0x96, '’': 0x92, '…': 0x85 };

function encodeWinAnsi(line: string): string {
  let out = '';
  for (const ch of line) {
    const code = WINANSI_HIGH[ch] ?? ch.codePointAt(0)!;
    if (code > 0xff) throw new Error(`fixture line is not WinAnsi-encodable: ${ch}`);
    // `(`, `)` and `\` are the only bytes a PDF literal string must escape.
    if (code === 0x28 || code === 0x29 || code === 0x5c) out += '\\';
    out += String.fromCharCode(code);
  }
  return out;
}

// A minimal, standards-shaped PDF 1.4: catalog, page tree, one page, Helvetica in
// WinAnsi, one content stream showing one line per `Tj`, and a correct xref table.
export function buildMenuPdf(lines: string[]): Buffer {
  const content =
    'BT\n/F1 11 Tf\n14 TL\n40 800 Td\n' + lines.map((l) => `(${encodeWinAnsi(l)}) Tj\nT*\n`).join('') + 'ET\n';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}endstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}
