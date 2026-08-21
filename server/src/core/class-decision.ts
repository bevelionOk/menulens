import type { SourceClass } from 'shared';

// AD-6 source class: decided by usable ground text, never by file type or URL extension.
// One threshold (`SOURCE_MIN_TEXT_CHARS`) serves both decisions below — the class of a
// PDF and the E3 `no_usable_text` check of a URL. Pure: the shell measures, core decides.

export interface ClassDecisionInput {
  kind: 'url' | 'pdf' | 'image';
  // Length of the extracted text after whitespace collapse (`collapseWhitespace`).
  text_chars: number;
}

export function hasUsableText(textChars: number, minChars: number): boolean {
  return textChars >= minChars;
}

// Images are always `visual`; PDFs are `text` only with a usable text layer. A URL with
// too little text is the caller's E3 failure — never `visual` — so here it is `text`.
export function decideSourceClass(input: ClassDecisionInput, minChars: number): SourceClass {
  if (input.kind === 'image') return 'visual';
  if (input.kind === 'url') return 'text';
  return hasUsableText(input.text_chars, minChars) ? 'text' : 'visual';
}
