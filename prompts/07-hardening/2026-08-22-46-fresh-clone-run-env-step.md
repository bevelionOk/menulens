# 2026-08-22 — 46 — The timed fresh-clone run (4.5): what counts, and the step that was not a command

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 07-hardening (4.5, Pablo's unaided run)
- **Intent**: Run the README on a clean clone with a stopwatch and report what the README did not let him do from the terminal.
- **In English**: "Does the timed run include adding the OpenAI API key — creating it and pasting it into .env?" Then: "Yes, but editing the key is not in the instructions as something to run from the terminal. It should be possible to edit it by opening it from the terminal, explained."

## Prompts

```text
el cronometrdo incluye la incorporacion de la api key de open AI? Crear la api key y pegarla en -env?
```

```text
si pero la edicion de la api key no esta en la isntruccion para ejecutar desde la terminal. deberia poderse editar abriendo desde la terminal explicado.
```

## Outcome

Creating the key is a prerequisite, like Node and Docker; pasting it is a README step and
counts. The README had every step as a runnable block except that one — "Put your key in
`.env`" was prose between two code blocks. Replaced with `nano .env`, the exact edit, the
save keystrokes, and two editor alternatives. First README defect found by the 4.5 run.
