# 2026-08-22 — 49 — Business mindset: where do we stand before the videos?

- **Date**: 2026-08-22
- **Tool**: Claude Code
- **Model**: Claude Fable 5
- **Phase**: 08-submission (6.1 pulled forward — the business note)
- **Intent**: Audit the repo against the rubric row "Business mindset — pricing, risk framing, would-you-ship-it (10%)" before recording the walkthrough.
- **In English**: "Hi, how are you? We now need to review the whole 'Business mindset — pricing, risk framing, would-you-ship-it 10%' area before the videos. Can you do a full review and see where we stand on this point?"

## Prompt

```text
hola como estas? Necesitamos ahora revisar todo el apartado de: 
Business mindset — pricing, risk framing, would-you-ship-it	10%

antes de los videos, podes hacer una revision integral? a ver como estamos con este punto?
```

## Outcome

Read-only pass over BUSINESS.md, DECISIONS (D3, D10, D24, D27), RISKS, production-breaks,
the brief, PRD NFR2, spec 1.5 and the scratchpad server logs. Findings: the two artefacts
that score the row — the BUSINESS.md paragraph and a business-risk beat in the walkthrough —
are both unwritten; BUSINESS.md unchanged since `bd9d973` (2026-08-20), no price, no
customer, no unit, not linked from the README; "would-you-ship-it" answered nowhere; D3's
luna-vs-terra "final choice on measured quality" never measured; unit cost measured at
$0.0015–0.0022 per menu on luna over four logged runs (5–11 dishes), the 34-dish Vox run
unmeasured; B42 (38/38 `uncertain` on real menus) undercuts the "3 minutes per menu" value
claim; B29 (no char cap) is the margin hole of any flat per-menu price; README promised
"two" `reliable` rows on the sample where the live run gave three. Proposed sequence:
measure → paragraph + D28 → README link → business beat in plan/05 → videos.
