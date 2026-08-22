# 2026-08-22 — 48 — Second timed run: 3:00 with the sample loaded; step order; what `done` means

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 07-hardening (4.5, second pass)
- **Intent**: Re-time the corrected README; report two things a first-time user hits.
- **In English**: "Test: 3 minutes with the UI up and la-parra loaded. An ordering issue: the sample-menu command should come BEFORE starting the server. Then in testing: I loaded two menus (one by URL, one la-parra.pdf) and completed la-parra's six rows; the state is confusing because both say 'Open' and both say state 'done', but only la-parra is complete — I never touched the other. Can you check? What does state: done mean — that it loaded, or that it needs review?"

## Prompt

```text
ok testeo: 3 minutos con UI y cargdo de la parra ahora.

hay un tema de orden:
esto: npx tsx server/scripts/sample-menu.ts deberia estar ANTES de cargar el servidor

despues en testeo:
cuando completo un menu (yo cargue 2, una via url y otro la-parra.pdf) y compelto la parra que son 6, el estado en confuso, porque ambos dicen "Open" que entiendo es para abrir las clasificaciones.
pero en el state ambas dicen "done" pero solo la parra esta compelto... la otra ni la toque.. eso en el menu principal de menulens 5174. podes fiajrte lo que te digo? o sea no enteindo que significa state: done, que se cargo? o que hay que revisar?
```

## Outcome

**3:00 from clone to the sample run `done`** on the corrected README (first pass was 3:38).

Order: `npm run dev` holds the terminal, so the sample-menu command now comes before it in
the Quick start, and the upload instructions come after the servers are up.

`done`: the **State** column is the extraction's state — `done` means the model finished
and the rows are saved. Review progress is the next column, **Reviewed** (`6 of 6
resolved` / `0 of 34 resolved`). The information was on screen; the word `done` in a table
read as a review queue says the wrong thing. Registered as B44 with the one-word fix
(`extracted`), which touches `web/src` and waits for Pablo's decision. The README now says
what each column means.
