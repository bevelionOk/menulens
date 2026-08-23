# Ship-readiness analysis — MenuLens

Amendment 2026-08-23: the price in §5 was revised to €0.50 per menu (D29); the cost figures stand. The volume arithmetic in §5 and assumptions A1/A2 below still compute against €2, and A11 ("the golden is unaffected") was wrong — the golden changed (D29 §2). Read them as the 22 August record.

**Date**: 2026-08-22 · **Session**: `bmad-agent-analyst` (Mary), branch `docs/business-md` ·
**Asked by Pablo** (prompt 51): before answering *would you ship it*, analyse in depth why the
system fails in production and which ideal conditions were discarded as out of scope.
**Feeds**: BUSINESS.md (the one paragraph), DECISIONS.md D28, the walkthrough's business-risk
beat. **Inputs**: production-breaks B1–B46, DECISIONS D1–D27, REQUIREMENTS §4, the brief, PRD,
spine, epics, deferred-work.md, and a luna-vs-terra measurement run on 2026-08-22 (§4).

## 1. The answer

Three questions hide inside "would you ship it". Each has a different answer.

| Ship it as… | Answer | Conditions |
|---|---|---|
| **A. An internal tool for one operator (Ana) behind the platform's own network and login** | **Yes, after three fixes measured in hours** | B45 (an ingredient word quoted as a declaration passes T6 — measured 6/34 false `reliable`), B10 (on photos and scans a `declared` allergen is never verified; the panel that let Ana check it was cut), B14 (`"1.250 €"` persists as 1.25 and can be `reliable`). All three live in `server/src/core/`; none needs a dependency. Auth stays the platform's (B24). |
| **B. A paid feature a customer's operators use** | **Not yet** | Everything in A plus the external-customer set in §3.1 — auth and rate limits (B24), hidden-text stripping (B28), an input cap (B29), a 429 retry (B6), PDF budgets (B30), verdicts that survive a re-run (B46), the evidence panel (story 2.4). Two to three weeks of work before the first invoice, and one open product question first: on real menus the review queue is the whole menu (B42), so the time saving the price rests on is unmeasured. |
| **C. Automated extraction with no human review** | **No, by design** | The brief's operating principle — never claim more than is provable; unproven rows go to a human with evidence. The measurement in §4 shows why: the model's own provenance labels are not stable across runs or tiers. |

The 22 August measurement moved A from "yes, today" to "yes, after three fixes". Before it,
the product's central claim — no inferred or unknown allergen reaches `reliable` — was
believed to hold by construction. It holds only while the model respects its own definition
of `declared`; on one of two runs over the same PDF it did not.

## 2. Why it fails in production — by business consequence

Forty-six register entries, regrouped by what the failure costs. Probability: **measured**
(observed on a real input), **likely** (ordinary use will hit it), **theoretical** (needs an
adversary or an unusual deployment). Effort is an estimate, not a commitment.

### 2.1 Liability — a wrong allergen reaches Ana as `reliable`

The one class the brief set at zero tolerance. Four paths exist today.

| # | Trigger | Probability | What Ana sees | First fix | Effort |
|---|---|---|---|---|---|
| B45 | The menu names an ingredient; the model quotes it as a `declared` allergen | **Measured** — 6 of 34 rows on the Vox PDF, luna, 22 Aug afternoon; 0 of 34 the same morning | `Lobster bisque · reliable · crustaceans, milk declared`. The row asserts the list is complete; the quote (`Lobster tail`) asserts one presence | T1 treats a `declared` entry whose quote carries no declaration marker (`contiene`, `enthält`, `allergens`, a legend key) as `inferred` | hours |
| B10 | A photo or scanned PDF | **Likely** — every visual run | `declared` with a quote nobody verified; `ground` is `null` on visual runs so T6 and T4 are skipped (`arbiter.ts:13-15`) | Until the evidence panel exists: no `reliable` on visual runs, or `declared` demoted to `inferred` when there is no ground text | hours |
| B28 | Hidden HTML text (`display:none`, `aria-hidden`, `<title>`) or an injected page | Theoretical — needs a hostile or compromised site; the visible-text attack did nothing in the sweep | A fabricated quote that verifies, "in the source text" | Drop hidden-by-attribute elements in the stripper; say in the prompt that instruction-like text is data | 1–2 days |
| B13 | Soft hyphen, ZWSP, BOM in the source | Likely on some CMSs | The reverse: a correct `declared` is downgraded, a correct name fires T4 | Drop default-ignorable code points inside the one normalization chain | hours |

Contradiction worth naming: B10's accepted mitigation is "Ana verifies visually in the
evidence panel" (register row, PRD FR19/FR34). The panel is story 2.4, cut by D24. The shipped
app shows the quote and no way to see the source next to it. Fix A above is the replacement
until the panel returns.

### 2.2 Money — a wrong price, or a bill with no ceiling

| # | Trigger | Probability | Consequence | First fix | Effort |
|---|---|---|---|---|---|
| B14 | `"1.250 €"`, `"12,345 €"` | Likely on menus above €1,000 (tasting menus, events) | 1.25 persisted, row can be `reliable` — a wrong price marked auto-checked | Refuse (T2) on a three-digit group or more than two decimals | hours |
| B43 | Bare numbers in a non-EUR country | **Measured** — Vox prints bare numbers; here they are euros, so the assumption held by luck | `123` stored as €123.00, T3 silent | A run with no currency marker anywhere becomes a run-level signal | 1–2 days |
| B29 | A 10 MB text source (`text/plain`, text-heavy PDF) | Theoretical for menus; trivial for an adversary or a misuse | ≈2.5 M input tokens per attempt, twice on the retry: ≈$0.50 on luna, ≈$5 on terra, per run. A flat per-menu price has no floor under it | Cap `acquired_text` (~200 k chars) at acquisition; record the truncation | hours |
| B7 | A very long menu truncates the output | Likely above ~150 dishes | The retry re-sends the same input and fails identically — double cost, no result | `max_output_tokens` + skip the retry on truncation | hours |
| B6 | A 429 from OpenAI | Likely at any volume | The run fails; a human resubmits | One retry on 429 with `Retry-After` | hours |

### 2.3 Product viability — the flag stops routing attention

The brief's second success criterion: enough `reliable` rows to make batch confirmation
worth doing. "A system that flags everything as uncertain has failed just as surely."

| # | Trigger | Probability | Consequence | First fix | Effort |
|---|---|---|---|---|---|
| B42 | A menu with icons, letter codes, or no allergen text | **Measured** — 38 of 38 rows on two real menus; the Vox PDF's only allergen line is "please contact our staff" | The review queue is the whole menu; the 3-minute target (D10) rests on a queue shorter than the menu | Read icon legends and letter-code keys as declarations; or make "no allergen text anywhere" a run-level fact instead of 34 per-row flags | 3–5 days |
| B46 | The same input twice, or another model tier | **Measured** — luna 0 → 6 `reliable` on Vox across one day; terra 12 rows instead of 6 on la-parra | Ana's verdicts are keyed to a run; a retry (B5: redo, don't resume) changes which rows need review | Carry verdicts across re-runs by normalized dish name | 1–2 days |
| B15 | Variant names printed differently | Measured — 4 of 11 rows on the 1.6 fixture | Correct rows flagged for a punctuation difference | Calibrate on real menus before widening the chain | 1–2 days |
| B25 | Model or prompt changes | Likely | The "about 9 to 12 seconds" copy goes stale (Vox measured 25 s) | Re-measure on every model change; date the copy | hours |

### 2.4 Availability — the run stalls, lies about its state, or blocks the next one

| # | Trigger | Probability | Consequence | First fix | Effort |
|---|---|---|---|---|---|
| B30 | A pathological PDF under 10 MB | Theoretical | `pdfjs` on the main thread, no page cap, no deadline — the one CPU-bound stage with no timeout | `maxPages`, a deadline, a worker thread | 1–2 days |
| B34 | A slow redirect chain | Theoretical | ~90 s of legal stall per run against the one-run gate | One overall fetch deadline | hours |
| B1 | Two POSTs in the same milliseconds | Theoretical with one operator | Two active runs | Advisory lock per POST | hours |
| B32 | `MODEL_TIMEOUT_MS` above `RUN_STALE_AFTER_MS` | Likely on the first misconfiguration | Every long call reads `interrupted` and unlocks a second run | One `.refine` on the env schema | 30 min |
| B33 | DB and Node clocks ≥ 3 min apart | Likely on a remote database | A fresh run reads `interrupted` before its first stage | Pass the anchor from Node, or derive staleness in SQL | hours |
| B5, B9, B16, B17, B20 | DB drop mid-run; two slow attempts; log before commit; zero-row guarded update; list skew | Rare, self-correcting or single-writer | `interrupted`; a 4-minute wait; a log line ahead of the database; cosmetic skew | Register rows name each fix | hours each |

### 2.5 Trust boundary — anyone who can reach the server

| # | Trigger | Probability | Consequence | First fix | Effort |
|---|---|---|---|---|---|
| B24 | Network reach | **Certain** outside localhost | Every run readable, every review mutable, no rate limit, no CORS | Any auth at all; a per-IP limit on the mutation | 2–5 days |
| B2 | DNS rebinding | Theoretical | The SSRF guard validates one lookup; `fetch` does another | Pinned-address dispatcher | 1 day |
| B3, B38 | CGNAT, NAT64, 6to4, multicast, reserved ranges | Theoretical | Reachable through the fetcher | One line each in `core/ssrf.ts` | hours |
| B39 | A moved GitHub Action tag | Theoretical | CI supply chain | Pin SHAs | 30 min |

### 2.6 Copy and contract drift — the screen says something the server did not do

B21 (re-upload instead of retry), B23/B26 (client copies of server rules), B27 (unknown
state renders an empty page), B31 (a 10 MB PDF or a refused host reads as "did not
answer"), B40 (`empty` with no hint that a photo would work), B41 (interrupted at which
stage?), B44 (fixed: `done` → `extracted`). Each is hours. None loses data; each costs Ana a
wrong next step.

## 3. The ideal conditions discarded as out of scope

Eighty-five items were cut, deferred, or declared out of scope across the brief, PRD, spine,
epics, story specs, and reviews (inventory compiled 2026-08-22 from the documents; the
sources are cited in each document's own cut record). Grouped by what they gate.

### 3.1 Needed before any external customer pays

| Condition | Where it was cut | Why then | What it would take |
|---|---|---|---|
| Authentication, roles, authorization | REQUIREMENTS §4; PRD NFR4; B24 | "Not asked"; single trusted operator on localhost | Any auth + a `reviewed_by` column — which D11 also cut (reviewer identity implies accounts) |
| Rate limiting, CORS policy | B24; rejected in the M1 review | Same | `@fastify/rate-limit`, an origin allowlist |
| Retry on transient model failures; `max_output_tokens` | FR6 "one retry, one timeout" kept literal; spec 1.5 Ask-First | A second retry would stack timeouts | B6, B7 fixes |
| Any timeout other than the model call | FR6; `statement_timeout` rejected in D23 | One technical timeout in the whole system | Per-stage deadlines (B30, B34) |
| Input caps in tokens, not bytes | B29 | A menu is kilobytes | A char cap at acquisition |
| Pagination | M1 spec Ask-First; B19 | One operator's run count grows slowly | `LIMIT 50` |
| Concurrent operators, an atomic seriality gate | FR35 v1 serial; AD-10; B1 | Keeps run state trivially correct | Advisory lock + per-operator queues |
| Observability beyond Pino lines; deploy target; IaC | R9 is the whole requirement; REQUIREMENTS §4; D12 | No deployment target exists | A Dockerfile for the app, metrics, alerting |
| Verdicts that survive a re-run | Not specified anywhere; surfaced by B46 | Reviews were designed per run (FR27) | Carry by normalized dish name |
| The evidence panel (story 2.4) | D24 | P1; offsets already persisted | UI + the `GET /api/runs/:id/artifact` route the spine lists and nobody built |

### 3.2 Needed for the product promise on real menus

| Condition | Where it was cut | Why then | What it changes |
|---|---|---|---|
| Reading icon legends and letter-code keys as declarations | Surfaced by B42 after the live runs | Unknown at planning time — the fixtures declared allergens in prose | Turns 38/38 into a queue shorter than the menu; the single largest lever on value |
| Negative declarations ("gluten-free") | PRD FR21 v1 simplification | Absence stays `unknown` | A third provenance value; today a "sin gluten" claim creates nothing |
| Currency context | PRD FR10, cut as over-engineering | EUR is the regulatory frame | B43; bare numbers outside the eurozone |
| Headless browser / JS rendering | Story 1.4 AC8; D20; R-03 | A page that yields no text gets E3, never more machinery | B4, B40: image and JS menus come back `empty` — the URL path is the weakest input path and the README says so |
| OCR | Spec 1.4 "Never"; INTERPRETATION | Native deps endanger the 5-minute README | Scans go through vision instead; B10 follows |
| Dual extraction + agreement | Brief addendum option C; D4 | 2× cost and latency | Would have caught B45 and B46 (two runs disagreeing is the signal); ≈$0.014 per menu on luna |
| Flag-rate measurement over time | D11; brief non-goal | Analytics infrastructure | The brief's alarm-fatigue criterion has no instrument; B42 was found by hand |
| Reviewer identity in the audit trail | D11 | Implies accounts | "Reviewed by a human with evidence" names no human |

### 3.3 Cut on purpose and correctly — still not needed at ship A or B

Microservices, k8s, event bus (auto-reject); queues and workers (AD-1); SSE/WebSocket
progress (D13); a staleness daemon (AD-5); idempotency keys; monorepo tooling; a test
suite (R8); custom design system; i18n; run deletion (AD-9 forbids it); image downscaling
and HEIC decoding (D15); PDF rasterization; branch protection and CI ceremony (D12).
Each has a DECISIONS entry. A queue becomes necessary at the first multi-operator
deployment; nothing else in this list does at the scale a menu-onboarding tool sees.

### 3.4 What the one test does not cover (D25)

The SSRF table, the adapter's retry and usage semantics, env fail-fast, the `saving`
transaction's atomicity, the `visual` class, the whole URL branch, and the `empty`/`failed`
states are verified by logged manual runs only. A regression in any of them ships with a
green build. At ship B this is the first thing a second engineer would change, and R8
forbids it inside this repo.

## 4. Model tier — D3 closed by measurement

Four inputs, each run once on `gpt-5.6-luna` and once on `gpt-5.6-terra`, 2026-08-22
14:38–14:40, same prompt (`extraction-v1`), same arbiter, isolated database. Pricing per
D3 (luna $0.20/$1.20, terra $2/$12 per M tokens).

| Menu | Model | Rows | `reliable` | In / out tokens | Elapsed | Cost |
|---|---|---|---|---|---|---|
| la-parra (fixture, 6 dishes, allergens in prose) | luna | 6 | 2 | 1,563 / 879 | 8.7 s | $0.0014 |
| | terra | **12** | **0** | 1,563 / 1,836 | 16.3 s | $0.0252 |
| german (5 dishes, two declared lines) | luna | 5 | 1 | 1,538 / 599 | 5.7 s | $0.0010 |
| | terra | 5 | 2 | 1,538 / 362 | 3.8 s | $0.0074 |
| no-prices (5 dishes, "según mercado") | luna | 5 | 0 | 1,516 / 586 | 5.1 s | $0.0010 |
| | terra | 5 | 0 | 1,516 / 272 | 5.1 s | $0.0063 |
| Vox PDF by URL (34 dishes, 52,919 chars) | luna | 34 | **6** | 14,147 / 3,367 | 25.2 s | $0.0069 |
| | terra | 34 | 0 | 14,147 / 2,727 | 21.6 s | $0.0610 |

What the rows say:

- **Cost**: terra is 6–18× luna (9× on the 34-dish menu); both stay under a dime per menu. Vox on luna, the one real
  34-dish menu, costs $0.0069 — the number BUSINESS.md uses.
- **Neither tier delivers the gate alone.** Luna's 6 `reliable` rows on Vox are all
  ingredient quotes (`Lobster tail`, `hazelnut`, `Mozzarella di Bufala`) labelled
  `declared` — B45. Terra labelled every one `inferred` (34/34 `uncertain`), read
  `enthaelt Weizen, Milch` on the Apfelstrudel that luna missed, and then split la-parra
  into twelve rows, one per dish plus a `½ ración` twin priced `null`, and self-flagged all
  twelve on the menu-wide half-portion note — so the two rows that declare allergens in
  prose came back `uncertain`. Terra is stricter on provenance and worse on dish
  boundaries; luna the reverse.
- **The raw price string**: luna kept `segun mercado` in `price_raw`; terra returned
  `null`. Ana reads the former.
- **Decision**: `gpt-5.6-luna` stays the default. The provenance hole is closed in the
  arbiter (B45 fix), where it holds for any model; paying 9× for terra's stricter labels
  buys nothing the rule does not, and costs the dish-boundary regression.

## 5. Unit economics — the inputs the paragraph uses

| Quantity | Value | Source |
|---|---|---|
| Model cost per menu, luna | $0.001–0.002 (5–11 dishes); **$0.0069** (34 dishes) | 8 logged runs, 22 Aug |
| Model cost per menu, terra | $0.006–0.025; $0.061 (34 dishes) | same |
| Worst case per run with no input cap (B29) | ≈$0.50 luna / ≈$5 terra, ×2 on retry | 10 MB cap × ~4 chars/token × pricing |
| Machine time per menu | 5–25 s | same runs; Vox end-to-end 28.8 s in Pablo's run |
| Manual transcription today | 15–30 min per menu | brief persona (assumption, not measured) |
| Human review time with the tool | **unmeasured** — the only full review logged is 6 rows in 41 s on the fixture | DB on 5432, 22 Aug |
| Rows needing review on real menus | 38 of 38 (B42); 28 of 34 on the re-run that produced the B45 false reliables | live runs |

The cost side is settled: under a cent. The value side has one measured fact (typing is
gone) and one unmeasured claim (review is faster than transcription). A price that
captures a share of a saving nobody has timed is a hypothesis; the paragraph says so.

Volume, for scale only: at 500 menus a month the platform pays €1,000 and the model costs
about €3.50; at 50 menus, €100 against €0.35.

### 5.1 The assumptions under the price (Assumption Audit, 2026-08-22)

| # | Assumption | Confidence | Impact | If it fails |
|---|---|---|---|---|
| A1 | Manual transcription takes 15–30 min per menu | **Low** — the persona's number, no source | **High** — the whole anchor | At 5 min (copy from a PDF text layer) the saving is €2.50 and €2 takes 80% of it |
| A2 | €30/h loaded operator cost | Medium — Spain ~€20–25, Germany ~€35–45 | Medium | At €20/h the saving is €5–10; €2 is 20–40% of it |
| A3 | Review is faster than typing | **Low** — unmeasured; 38/38 says the queue is the menu | **High** | Stated in the paragraph |
| A4 | The platform pays per menu rather than bundling it in onboarding | Medium | Medium | The unit still works as an internal transfer price |
| A5 | Model pricing stays where it is | High (it falls, not rises) | Low — under 1% of the price | — |
| A6 | ~34 dishes is a typical menu | Medium | Low — cost is linear; 150 dishes ≈ $0.03 and B7 risk | — |
| A7 | A 200 k-char cap does not cut real menus | High — Vox is 53 k | Low | — |
| A8 | The platform values the review record, not only the rows | **Medium — nobody was asked** | **High** — it is "what is sold" | A rows-only buyer makes this a commodity extractor at $0.01; the answer becomes "bundle it" |
| A9 | Terra does not improve the flag | Medium — n = 1 per menu | Low for the price, medium for D3 | Say n |
| A10 | Two to three weeks to a paid feature | Medium-low — estimates by inference | Medium | Marked as estimate in §2 |
| A11 | The three fixes are hours | Medium-high — one rule each; the golden is unaffected (fixture quotes carry markers, text class, no thousands) | Low | — |

The weakest three — A1, A3, A8 — are all on the value side. The paragraph carries them as
conditions, not as facts.

## 6. Document contradictions that touch the answer

Found while compiling §3; each is a one-line fix or an amendment note, never an edit of the
original text.

1. B10's mitigation names the evidence panel; D24 cut it (§2.1). → Fix A in §1.
2. The spine lists `GET /api/runs/:id/artifact` and `/history`; neither exists
   (D24). → Recorded in D28; the spine stays as written (prompt 38: the architecture
   documents are the record).
3. D3's "final model choice on measured quality" had no record. → §4, D28.
4. REQUIREMENTS §2 says DECISIONS covers D1–D26; D27 exists, D28 follows. → Updated.
5. `plan/guides/manual-test-guide.md` lists as "not yet covered" five scenarios D27's sweep
   ran, and says the next register number is B42. → Updated.
6. BUSINESS.md "working draft" against the brief's "one paragraph". → Written.
7. README said the Vox URL returns every row `uncertain`; B45 measured 6 `reliable` on a
   re-run of the same URL. → README updated; the run payloads are committed next to this
   file (`measurement-2026-08-22/`).
8. The brief's "by construction" success criterion against B45. → Dated amendment on the
   brief, original text intact; D28 §7.
