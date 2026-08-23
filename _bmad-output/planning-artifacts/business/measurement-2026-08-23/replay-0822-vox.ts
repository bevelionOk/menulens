// Deterministic replay: every `declared` entry of the 2026-08-22 luna Vox payload through
// the B45 marker check. Same function the arbiter calls; no model call.
import { readFileSync } from 'node:fs';
import { hasDeclarationMarker } from '../../../../server/src/core/t6-verify';
const r = JSON.parse(readFileSync(new URL('../measurement-2026-08-22/gpt-5.6-luna--vox.json', import.meta.url), 'utf8'));
let reliable = 0;
for (const d of r.dishes) {
  const declared = d.allergens.filter((a: { provenance: string }) => a.provenance === 'declared');
  if (declared.length === 0) continue;
  const kept = declared.filter((a: { evidence_quote: string }) => hasDeclarationMarker(a.evidence_quote));
  const stillReliable = d.flag === 'reliable' && kept.length === declared.length;
  if (stillReliable) reliable += 1;
  for (const a of declared) console.log(`${d.flag.padEnd(9)} ${d.name.padEnd(36)} ${a.id.padEnd(12)} "${a.evidence_quote}" -> marker=${hasDeclarationMarker(a.evidence_quote)}`);
}
console.log(`reliable after replay: ${reliable} of ${r.dishes.length}`);
