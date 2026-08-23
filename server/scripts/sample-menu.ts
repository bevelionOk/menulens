// Writes the sample menu the README points at: the same PDF the golden-master test
// uploads, so what a reviewer tries first is what the test asserts on.
//   npx tsx server/scripts/sample-menu.ts            → ./la-parra.pdf
//   npx tsx server/scripts/sample-menu.ts out.pdf    → ./out.pdf
import { writeFileSync } from 'node:fs';
import { buildMenuPdf, MENU_LINES } from '../test/fixtures/menu-pdf.ts';

const out = process.argv[2] ?? 'la-parra.pdf';
writeFileSync(out, buildMenuPdf([...MENU_LINES]));
console.log(`wrote ${out} — 7 dishes: 2 reliable, 5 uncertain (T1, T2, T3)`);
