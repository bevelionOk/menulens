# 2026-08-21 · 03 · FG1 answers + durability question -> advanced elicitation

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD analysis — PRD
- **In English**: Approves the skeleton as faithful to brief and addendum, then answers three ingestion questions: accept file types with size limits for photos; reconsider timeouts (asks for a durable method so work is not lost, requesting the advanced-elicitation view); and Ana must see real progress with stage and an estimated time remaining, since a perceived hang hurts UX.

## Prompt (verbatim)

> el esqueleto esta ok y respeta el brief y el addendum. mira que el addendum es muy importante tambien. 
> ahora contestando a tus preguntas:
>
> 1. ana acepta tipos de archivo, limites de tamaño tal vez para las fotos de los menu,
> 2.  Yo reevaluaria como implementar los timeouts, mi experiencia me dice que son traicioneros. tenemos algun metodo durable para este proceso aunque no sea tan largo para evitar que se pierda el trabajo si algo ocurre? aca me gustaria la vision del bmad-advanced-elicitation
> 3. Ana debe ver un in progress real, con avances... contando en que parte del proceso esta... podria tambien tener un estimado de tiempo que falta para terminar (es clave que ella o cualqueir usuario estén al tanto de lo que ocurre siempre. la sensación de que algo se colgo cuando no es asi afecta muchisimo la UX del usuario. y eso debemos cuidarlo.

## Outcome

Skeleton ratified; UX principle recorded (real staged progress, never fake-hang). bmad-advanced-elicitation invoked on the durability/timeout/honest-progress tension; 5-method menu served.
