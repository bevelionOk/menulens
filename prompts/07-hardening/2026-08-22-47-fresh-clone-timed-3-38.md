# 2026-08-22 — 47 — 4.5 done: fresh clone to first run in 3:38

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 07-hardening (4.5, Phase 4 close)
- **Intent**: Time the README on a clean clone, unaided, and report what got in the way.
- **In English**: "Should the user have a guide on what to test? Setup counts in the timing; does testing count too?" — "OK, let's do B" (time the README as is, add the 'what to try' lines afterwards). Then the run: a migration error in the clone (`ECONNREFUSED`), "note: we are at 6 minutes but I had a problem with that, so I must re-time". Restart: "3 minutes to bring everything up." "Only to the UI open; la-parra 38 seconds more. The script creates the file in the project folder, and when uploading I have to pick it from there."

## Prompts

```text
ok perfecto. voy a cronometrar el README.md  Ah, antes de comenzar. el usuario deberia tener una guia de QUE TESTEAR? porque aparece como levantar la infra (esto cuenta en el cronometraje) y luego viene el testeo, que me imagino que tambien cuenta o solo es levantaminto de infra?
```

```text
si, dale hacemos B
```

```text
si yo la hago enc arpete menulens me da error la migracion:
 menulens % npm run -w server db:migrate
[…] DrizzleQueryError: Failed query: CREATE SCHEMA IF NOT EXISTS "drizzle" […] cause: AggregateError [ECONNREFUSED]
(no quise hacerlo en la carpeta full-stack-challenge porque es la del repo local que tenemos
```

```text
para anotar: ya vamos 6 minutos pero tuve problema con eso. asi que debo recronometrar
```

```text
ok empiezo de nuevo. ahi vamos: 3 minutos de levantamiento de todo.
```

```text
Solo ui abierta, para la parra 38 segundos mas. lo que hace la parra es crear el archivo lo mete en la carpeta y despues cuando lo tengo que levantar lo tnego que elegir desde la carpeta del proyecto y ahi aparece.
```

## Outcome

**3:00 from `git clone` to the UI open; 3:38 to the sample run `done`.** Criterion: under
five minutes. Passed.

The first attempt was discarded at six minutes: `db:migrate` could not reach Postgres. The
clone's folder is `menulens`, the same compose project name I had used that morning for the
hostile sweep on port 5433; compose recycled my stopped container and Docker Desktop never
re-bound the port. `docker compose up -d --force-recreate` fixed it. Not a README defect —
an artefact of my own test setup on the same machine. Rule for me: scratch containers get a
project name no folder of Pablo's will ever have.

Three README defects found by the run, all fixed the same day: the `.env` edit was prose
between command blocks (#19); the sample-menu step did not say where the file lands or how
to find it in the upload dialog (#20); and the clone line said `cd full-stack-challenge` —
the local folder's name — when the repository is `menulens` (#21). The "what to try" paragraph — confirm, follow-up, check the
list — went in with it, as agreed before the run.
