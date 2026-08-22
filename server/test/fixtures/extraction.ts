import type { ModelDishSignal } from 'shared';
import type { ExtractionResult } from '../../src/pipeline/extraction-adapter';

// What the mocked model seam returns for the fixture menu (AD-12: `extract` is the ONLY
// thing stubbed). The signals are crafted so every arbiter rule T1–T6 fires at least once
// and row 0 stays fully `reliable` — so a rule that stops firing fails the golden by name
// rather than by a blob diff.
//
//   0  Tortilla de patatas          reliable — verified quotes, clean EUR price, traceable name
//   1  Croquetas de jamón ibérico   T6 (declared quote absent ⇒ inferred) then T1 (inferred)
//   2  Ensalada de la casa          T2 ("desde" ⇒ no unambiguous value), EUR so no T3
//   3  Pulpo a la brasa             T3 (non-EUR marker) and the T2 it implies
//   4  Secreto ibérico a la parrilla T4 (name absent from the acquired text)
//   5  Postre del día               T1 (empty allergen list) and T5 (model self-flag)
const DISHES: ModelDishSignal[] = [
  {
    name: 'Tortilla de patatas',
    price_raw: '8,50 €',
    description: 'Contiene huevo y leche.',
    description_provenance: 'extracted',
    allergens: [
      { id: 'eggs', provenance: 'declared', evidence_quote: 'Contiene huevo y leche' },
      { id: 'milk', provenance: 'declared', evidence_quote: 'Contiene huevo y leche' },
    ],
    self_flag: false,
    self_flag_reason: null,
  },
  {
    name: 'Croquetas de jamón ibérico',
    price_raw: '9,75 €',
    description: 'Alérgenos declarados: leche y gluten.',
    description_provenance: 'extracted',
    allergens: [
      // Verified, and the accented row the offset assertion slices back.
      { id: 'milk', provenance: 'declared', evidence_quote: 'Alérgenos declarados: leche y gluten' },
      // Declared, but this sentence is nowhere in the menu: T6 downgrades it to `inferred`.
      { id: 'gluten', provenance: 'declared', evidence_quote: 'Elaboradas con harina de centeno' },
    ],
    self_flag: false,
    self_flag_reason: null,
  },
  {
    name: 'Ensalada de la casa',
    price_raw: 'desde 6 €',
    description: 'Aliño con mostaza y semillas de sésamo.',
    description_provenance: 'extracted',
    allergens: [
      { id: 'mustard', provenance: 'declared', evidence_quote: 'Aliño con mostaza y semillas de sésamo' },
      { id: 'sesame', provenance: 'declared', evidence_quote: 'Aliño con mostaza y semillas de sésamo' },
    ],
    self_flag: false,
    self_flag_reason: null,
  },
  {
    name: 'Pulpo a la brasa',
    price_raw: '18 $',
    description: 'Servido sobre patata panadera.',
    description_provenance: 'extracted',
    allergens: [{ id: 'molluscs', provenance: 'declared', evidence_quote: 'Pulpo a la brasa' }],
    self_flag: false,
    self_flag_reason: null,
  },
  {
    name: 'Secreto ibérico a la parrilla',
    price_raw: '14,00 €',
    description: 'Tabla de quesos artesanos con nueces',
    description_provenance: 'extracted',
    allergens: [
      { id: 'milk', provenance: 'declared', evidence_quote: 'Tabla de quesos artesanos con nueces' },
      { id: 'nuts', provenance: 'declared', evidence_quote: 'Tabla de quesos artesanos con nueces' },
    ],
    self_flag: false,
    self_flag_reason: null,
  },
  {
    name: 'Postre del día',
    price_raw: '5,00 €',
    description: 'Selección de postres caseros.',
    description_provenance: 'generated',
    allergens: [],
    self_flag: true,
    self_flag_reason: 'El postre cambia a diario y la carta no lista sus ingredientes.',
  },
];

export const MOCKED_EXTRACTION: ExtractionResult = {
  dishes: DISHES,
  usage: { input_tokens: 1234, output_tokens: 567, total_tokens: 1801 },
  attempts: 1,
};
