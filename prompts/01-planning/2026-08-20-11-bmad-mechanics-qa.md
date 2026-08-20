# 2026-08-20 · 11 · BMAD mechanics Q&A: costs, invocation, closing

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: Planning (methodology familiarization)
- **Intent**: Clear up three mechanics questions before the first real BMAD session.

## Prompt (verbatim)

> bien cada vez que invoco el bmad hash, se consumen de ahi creditos de OpenAI porque esta coenctado, verdad? y suponiendo que estoy en un ida y vuelta con el especifico agente de bmad , yo lo tengo que hashear cada vez? o contestando ya es atutomatico? al finalizar lo que compete al agente debo emitir algo comando para "close"?

## Outcome — three clarifications

1. **BMAD consumes zero OpenAI credit.** Skills run inside Claude Code (Claude executes
   them, billed as Claude usage). The OpenAI key is spent only by the app we build,
   during implementation and testing of the extraction feature.
2. **Invoke once per skill.** `/bmad-...` is a slash command; after invocation the agent
   persists for the whole session — answering normally continues the facilitation. A new
   `/bmad-...` is typed only to start the *next* skill in the chain.
3. **No close command.** The workflow ends itself and writes its artifact to
   `_bmad-output/planning-artifacts/`. Our closing ritual replaces it: commit artifact →
   log prompts → DECISIONS.md entry if something closed → next skill in a fresh session.
