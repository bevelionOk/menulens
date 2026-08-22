# 2026-08-22 — 34 — Videos wait; the highlights do not

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Opus 5
- **Phase**: 06-implementation (Phase-5 input)
- **Intent**: Hold video production in its own phase, but keep capturing script material while the memory is fresh — especially the story cut.

## Prompt

```text
muy bien! eso queria escuchar sobre el hardening. olvidate de los videos hasta no terminar esto. tb esta scheduled en orden. lo que si debes encargarte de mantener son los highlights para los guiones. incluyendo el corte en las stories que hicimos.
```

## Outcome

Appended highlights 45–53 to `plan/video-highlights.md`, with the scope cut as the centrepiece: the audit run against our own plan (#48), the cut itself with the specification-to-code ratio that made the case (#49), and the decision to leave cut requirements in the PRD annotated rather than deleted (#50). Also captured the UTF-16 offset bug an emoji exposes and no acceptance criterion could have caught (#45), the price that would have discarded an entire run (#46), the 112 ms/MB normalization that would have frozen the "honest" waiting page (#47), and the demo worth 30 seconds of camera: confirm a row, then show the md5 of every extracted column byte-identical before and after (#52). The session's 2×2 audit landed as #53, its three misses included.
