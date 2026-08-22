# 2026-08-21 · 06 · FG2 PO answers + party-mode request

- **Tool**: Claude Code (desktop)
- **Model**: Claude Fable 5
- **Phase**: BMAD analysis — PRD
- **In English**: Questions the 10 MB per-photo cap and asks to consider HEIC support via a simple tool since many iPhone users cannot convert; accepts the 3-minute threshold for testing. As Product Owner answers: prices in EUR (country selector would be over-engineering; ranges for missing prices, asks what triage means), two rows for variants to keep things simple for Ana, never invent an allergen declaration (report as absence and potential inference, relate to D4), same language as the platform. Asks bmad-party-mode for opinions on these decisions.

## Prompt (verbatim)

> el tope de subida son 10mb por foto? no es mucho? los formatos de imagenes estan bien... lo de HEIC me hace ruido ya que mucha gente tiene iphone y no sabe cambiar el formato de la imagen. evaluar incluir ese fomrato via una herramienta simple. hay varias a disposicion. El umbral de 3m es razonable, podemos testearlo para medirlo. 
>
> Vamos con las respuestas de Product Owner:
>
> 1. precios deberia ser EUR para ser coherentes porque asumimos que el marco regulatorio es UE. si ese no fuera el caso, la plataforma deberia tener un selector de pais con la deteccion de moneda automatica. (revisar y verificar que esto no sea sobreingenieria.) yo me ajustaria al EUR. cualquier cosa dejaria una nota explicando la razon. Con respecto a los precios ausentes, me gusta la idea de rangos. podes explicarme que es el triage para ver si eso debe resovlerse de alguna manera?
> 2. para las variantes 2 filas, la idea es simplificarle a Ana, sino hay que agregar columnas. tambien se puede pensar ya que el mismo producto no importa el tamaño, los ingredientes son los mismos... 
> 3. No, de ninguna manera escribe una. esto debe informarse como carencia y potencial inferencia. Si analizar resolcion D4.
> 4. Para este alcance el dato es mismo idioma que la plataforma. diferencias de lenguaje estan fuera de scope.
>
>
> que opinan de mis decisiones bmad-party-mode y puede ayudar a clarificar lo no respondido?

## Outcome

Triage explained (attention router). Party mode convened (Mary/John/Sally/Winston/Amelia): price verbatim + parse-when-unambiguous proposed, R6-vs-extractive-description clash surfaced, verbatim-vs-translation tension named, HEIC iOS auto-convert found, 10MB justified. Two open calls handed back.
