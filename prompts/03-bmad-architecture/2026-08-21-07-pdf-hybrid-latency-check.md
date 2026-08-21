# 2026-08-21 · 07 · PDF hybrid-by-class — latency sanity check, then adoption

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD — architecture

## Prompt (verbatim)

> la opcion 1 propuesta por vos podria demorar mucho la leida de Ana, o es desestimable? La verdad que el hibrido pro clase es lo logico.

## Outcome

Latency answered with numbers (pdfjs text-layer extraction is ms-scale vs the 30–90 s
model call; highlighting reuses persisted T6 offsets — zero client work; the only slower
case, scanned PDF via native input, replaces "unsupported"). OPEN-3 closed: hybrid by
class adopted — source classes `text | visual` govern model input, T6 scope, and the
evidence tab; **E6 eliminated**. D17; spine AD-6.
