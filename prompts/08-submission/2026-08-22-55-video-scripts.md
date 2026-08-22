# 2026-08-22 — 55 — The two videos: skills, guideline review, scripts, tone

- **Date**: 2026-08-22
- **Tool**: Claude Code (`bmad-review`, structure and prose lenses, on the personal script)
- **Model**: Claude Fable 5
- **Phase**: 08-submission (Phase 5, videos)
- **Intent**: Open the video phase: which BMAD skills apply, what the video guidelines and the collected highlights require, scripts for both videos, the facts the personal video needs, the tone rule kept.
- **In English**: "This conversation is about creating and directing the two required videos. (1) Tell me whether any BMAD skills can help; (2) evaluate all the information we have on the video guidelines and the highlights we collected; (3) then design the script for both videos; (4) you will need information for the personal video; (5) keep it professional, in the tone already defined, and avoid the AI communication bias" — the four causes named in prompt 45. Pablo attached his own draft of the personal script and asked for feedback on it, with a BMAD agent if useful.

## Prompt

```text
el topico de esta conversacion es el abordaje de la creacion y direccion de los dos videos que se requieren.
Para ello:

1. informarme si hay skills de bmad que puedan cooperar,
2. el task es evaluar toda la info que tenemos de las guidelines de los videos y de las highlines que fuimos recolectando
3. luego diseñar el guion para ambos videos
4.  necesitaras informacion para el que es el video personal. 
5. tener en cuenta profesionalismo, el tono ya definido, y evitar el sesgo de comunicacion de la IA (1. El sesgo del RLHF (Reinforcement Learning from Human Feedback); 2. Contaminación por el corpus de "LinkedIn y Management"; 3. Confusión entre razonamiento interno y entrega de producto & 4. Ausencia de "costo social" y falta de contexto real

tengo un draft para el guion personal, que necesito que revises antes. Fui recolectando mi experiencia en bevelion yprevia. es mi background asique solicito que me des feedback por favor. si queires invocar a algun agente BMAD para que lo evalue tambien me serviria. gracias!
```

*(The attached draft — six beats, 598 spoken words — is the text [plan/videos/personal.md](../../plan/videos/personal.md) was edited from.)*

## Outcome

Skills: `bmad-review` (structure, then prose) ran on Pablo's draft — 16 structure rows, 24 prose rows. `bmad-advanced-elicitation` reserved for the final scripts; `bmad-party-mode` not used (D11 precedent).

Personal script, edits Pablo accepted: the "why this role" beat moved before "how I work"; the sentence about timeouts moved to the walkthrough; numbers thinned (crates and pull requests only; Bevelion repository checked the same day: 36 workspace crates, 203 merged pull requests, 57 in August, first commit 2025-09-02); decision identifiers kept as margin notes, not spoken; "every session" corrected to "each build session"; a sentence that restated the listing's wording cut; nothing before 2023 added. 598 → 495 spoken words, ≈ 3:18.

Walkthrough script written from `plan/05`, `plan/video-highlights.md`, `BUSINESS.md`, `DECISIONS.md` and `plan/production-breaks.md`: eight segments, ≈ 1,180 words, 7:50 — Pablo's choice against a longer cut. One live run (`la-parra.pdf`); B45 shown from the committed measurement; the Vox URL never timed on camera (B25).

Files: `plan/videos/personal.md`, `plan/videos/walkthrough.md` (fact sheet with a source per number), `plan/videos/recording.md` (format, spoken tone, seeded runs, after-recording checklist). `plan/05` links them. Next prompt 56; next register row B47.
