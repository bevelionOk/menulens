import type { FastifyBaseLogger } from 'fastify';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

// PDF text layer via pdfjs (legacy build runs in Node without an explicit worker —
// verified against the installed tarball). Any throw ⇒ '' — the class decision then
// reads it as `visual` (scanned / corrupt), which is not a failure (spec matrix).
export async function extractPdfText(bytes: Buffer, log: FastifyBaseLogger): Promise<string> {
  try {
    const task = getDocument({ data: new Uint8Array(bytes) });
    try {
      const doc = await task.promise;
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
      }
      return pages.join('\n');
    } finally {
      await task.destroy();
    }
  } catch (err) {
    log.info({ err }, 'pdf text extraction failed; treating as visual');
    return '';
  }
}
