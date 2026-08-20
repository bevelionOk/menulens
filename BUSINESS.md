# BUSINESS.md

> **Status: working draft.** The final deliverable is exactly **one paragraph** answering:
> *what would you charge a customer for this feature, and why?* The notes below are the
> measured inputs it will be distilled from before submission.

## Working notes (to be distilled)

**Measured unit cost** (2026-08-20 smoke test + current OpenAI pricing): one menu extraction
costs ~$0.003 on the budget tier (gpt-5.6-luna) and ~$0.032 on the balanced tier
(gpt-5.6-terra). Even with retries and generous margins, raw COGS per menu is under $0.05 —
i.e. the LLM cost is negligible; the price must be driven by **value and risk**, not tokens.

**Value side**: manual transcription of a restaurant menu into structured data takes roughly
15–30 minutes of operator time per menu (plus errors). The feature replaces that with
seconds of compute plus a short human review pass guided by the confidence flags.

**Risk side (the real pricing driver)**: allergen data is safety-critical — a wrong
"allergen-free" label has legal and human consequences. Our own smoke test showed the model
answering confidently wrong on ambiguous input (see DECISIONS.md D4). This feature therefore
cannot honestly be sold as fully automated extraction; what is sellable is **extraction +
confidence-guided human review**, where the flag concentrates reviewer attention on the
uncertain rows. The price should include that framing, and the margin should cover the
liability-driven need for review tooling.

**Pricing shapes to choose from in the final paragraph**: per-menu credit pricing
(e.g. bundle of extractions at a price that yields >90% gross margin over COGS),
or a flat monthly tier for platforms ingesting menus continuously.
