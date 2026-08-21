# BMAD-Fluency Audit — PRD: Menu Extraction & Review

Adversarial review against the rubric row "BMAD fluency — real, not cosmetic use" (25%,
auto-reject on decoration). Sources read: prd.md, addendum.md, .memlog.md, upstream
brief + brief addendum, and — to verify every external citation — DECISIONS.md,
REQUIREMENTS.md, plan/RISKS.md.

**Date**: 2026-08-21 · **Reviewer**: BMAD-fluency auditor (adversarial pass)

---

## Verdict

**PASS — genuine, not cosmetic.** The auto-reject test is cleared with margin: the PRD's
requirements demonstrably derive from the brief's handoffs, every external citation
resolves to real text in the cited document, and the memlog shows decisions actually
happening in-session — including two position reversals (description policy, evidence
panel) that no template-filler produces. Two findings need fixing before a reviewer runs
this same audit: the repo's canonical DECISIONS.md still says **D4 OPEN** while the PRD
declares it closed, and rule T6 as written contradicts FR19 for image sources.

---

## 1 · Traceability (brief → PRD) — STRONG

The brief's "Handoffs — open questions the PRD must close" lists five items; the PRD
closes all five, each in a locatable place: D4 derivation → FG3 (T1–T6);
evidence-in-view mechanics → FR23–FR24; error-state inventory + copy → FG6 (E1–E9);
sync-vs-async UX → the processing-model ADR (addendum) + FR3–FR8; history scope → FG5.
The four success criteria are inherited 1:1 and *extended* (counter-measures), not
restated. The Operating Principle is quoted once and then actually used as a constraint
(FR5's banned-UI list, FR15's language rule, E9's "provable I-couldn't").

Citation spot-checks (all verified against source):

| PRD citation | Verified against | Holds? |
|---|---|---|
| FR9 "(R6)" | REQUIREMENTS.md §1 R6 (per-dish fields incl. description + flag) | Yes |
| FR29 "(R7)" | R7 (persisted + shown in clean UI) | Yes |
| NFR5 "(Pino, R9)" | R9 | Yes |
| FR1 "(never native system deps — R-10)" | plan/RISKS.md R-10 (<5-min run risk, "no exotic system deps") | Yes |
| NFR2 "$0.003–0.032 (D3)" | DECISIONS.md D3 (luna ~$0.003 / terra ~$0.032) | Yes |
| NFR1 / "style of D10" | D10 (retraction to ~3 min, triage calibration governs) | Yes |
| "T6 promoted from D4's original candidate list" | D4 candidates: "allergens explicitly present in source text vs inferred", "source-text traceability" | Yes — and memlog line 17 records Pablo making exactly this observation |

**Finding T-1 · LOW · Constraints section.** "the cost-per-extraction envelope (NFR2)
carr[ies] over unchanged" from the brief — the brief states cost *matters* but contains
no numbers; the envelope is D3's. A citation-checking reviewer finds the brief doesn't
say what the PRD says it says. *Fix*: attribute the envelope to D3 in Constraints (NFR2
already does).

**Finding T-2 · LOW · FR1 vs FR9/FR29.** Two near-identical numbering schemes are used
uncited: `R6/R7/R9` (REQUIREMENTS.md) vs `R-10` (RISKS.md). REQUIREMENTS.md *also* has an
R10 ("BMAD drives planning and implementation") — a reviewer checking FR1's "R-10" there
reads a nonsense citation and may score it as decorative. *Fix*: qualify once, e.g.
"RISKS R-10" / "REQ R6", or a one-line legend under Constraints.

## 2 · "Decisions closed in this PRD" vs the memlog — STRONG, one repo-level mismatch

All four claims map to specific memlog events with matching detail, not summary-level
hand-waving:

- **D4 closed** ↔ memlog line 17: same T1–T6 enumeration, same A+B+C structure, same
  image-limitation note, same single-test candidate.
- **Processing model evolved** ↔ lines 10–12: Pablo raises the timeout distrust,
  elicitation is invoked, approval is recorded with the exact parameters that appear in
  FR3–FR8 (120 s, 3 min staleness, banned progress UI), cuts listed.
- **Description policy evolved** ↔ line 13 ("descripción JAMÁS generada por el modelo")
  → line 15 (extracted|generated adopted post-roundtable). A PO opening position
  overturned by R6 evidence *in-session* is the single best anti-cosmetic artifact in
  this PRD — decoration doesn't reverse itself.
- **Evidence panel corrected** ↔ line 19 (omission-blindness argument, Original-first).

FR35/FR36 sitting out of numeric sequence at the end of FG1 corroborates rather than
undermines: memlog lines 24–25 show they were added by the 2×2 audit after the draft.
The scar tissue matches the surgical record.

**Finding D-1 · HIGH · DECISIONS.md D4 vs prd.md "Decisions closed".** The repo's
canonical decision log still reads "**D4 · OPEN**: confidence flag derivation" while the
PRD declares "D4 — CLOSED". The PRD promises "formal DECISIONS.md entries land at session
close", but the memlog records no session-close event and prd.md frontmatter is still
`status: draft` — the loop is not closed *anywhere a reviewer can see*. The rubric map
(REQUIREMENTS §6) scores exactly "decisions traceable brief → PRD → arch"; a reviewer
following D4 from DECISIONS.md hits a contradiction, which reads as artifacts *not*
constraining each other — the definition of cosmetic. *Fix (cheap)*: finalize the
session — land the D4-closure and processing-model entries in DECISIONS.md, flip PRD
status to final. Until then, one line in DECISIONS.md D4 ("closing in PRD session
2026-08-21, entry pending") would break the contradiction.

## 3 · Constraint on the architecture phase — STRONG

This is a real handoff, not a vibe. Concretely: an Open-items table where every row has
an owner and a closure condition (HEIC → verify at architecture with named fallback;
staleness 3 min → measure in testing; SSRF mechanics → architecture); an inline
`[VERIFY AT ARCHITECTURE]` marker in FR1; and an addendum whose sections are explicitly
labeled "mechanics for architecture" and contain decisions architecture is *bound by*:
the two-field price representation, the LLM JSON contract additions, T6's normalization
left open but its downgrade semantics fixed, browser-native PDF embed with pdf.js
explicitly excluded, and a named single-test candidate with the justification criteria
R8 requires. Architecture cannot improvise on any of these without visibly contradicting
an upstream artifact — which is precisely what the rubric wants to see.

**Finding A-1 · MEDIUM · FR30 → FR23 / addendum "Storage implications".** FR30 asserts
"evidence panel included, since sources are persisted (FR23)" — but FR23 nowhere requires
persisting anything, and no FR does. The binding requirement (persist uploaded image
bytes, PDF bytes, and acquired source text — which T6, the evidence panel, and
review-from-History all depend on) lives *only* in the addendum. An architect reading
prd.md alone can ship a system that discards sources after extraction and satisfies
every FR while breaking FR30's premise. *Fix*: one sentence in FR3 or FR23 ("the source
artifact and acquired text are persisted with the run"); keep the mechanics in the
addendum.

## 4 · Template smell — CLEAN (one nit)

No inventory of ceremony sections: Users justifies its own brevity ("the tool has one
chair"), non-goals are named session cuts with reasons rather than a generic list,
Success Measures carry product-specific counter-metrics, and there is no
Assumptions/Timeline/Stakeholder-matrix filler. Almost no sentence survives transplant
into another product's PRD — the wrong-genericity test fails everywhere it should.

**Finding S-1 · LOW · Header vs Context.** The header claims "This PRD … does not
restate [the brief]", then Context restates the brief's essentials (Ana, 15–30 min,
loop, ~3 min target). The restatement is defensible (standalone readability); the
self-claim hands a pedantic reviewer a gotcha. *Fix*: soften to "restates only what a
standalone read needs".

## 5 · Internal consistency — mostly holds; one real contradiction

Verified consistent: FR6/NFR1/E7 (single 120 s timeout), FR7/E8 (staleness), FR8/FR35
(serial guard), FR10/T2/T3 (price + currency triage), FR12/FR17 (description excluded
from the gate — no T-rule mentions it), FR22/FR27 (done derived, reversible), Scope-In
lists T1–T6 and E1–E9 which both exist.

**Finding C-1 · MEDIUM-HIGH · FR17 (T6) vs FR19 — image sources.** T6 as written: a
`declared` allergen whose evidence quote "is missing or **cannot be found in the source
text**" is downgraded to `inferred` (fires T1). FR19: image sources have **no ground
text**. Literal application of T6 to a photo menu downgrades *every* declared allergen
⇒ every row `uncertain` ⇒ the photo path loses batch confirmation entirely — plainly not
the intent (addendum: "quote displayed, not verified"). The same gap makes the Success
Measures counter "the gate's inputs are themselves verified (T6), not trusted" an
overclaim for the image path, which FR19 itself honestly disclaims two sections earlier
— an implementer must choose which sentence wins. *Fix*: one clause in T6 ("URL/PDF
sources; image sources per FR19 — quote required but not machine-verified") and qualify
the Success counter ("verified where ground text exists").

**Finding C-2 · LOW-MEDIUM · E9 vs FR29.** E9 defines zero-dishes as "an honest terminal
state, distinct from failure", but FR29's state vocabulary is
`processing / interrupted / failed / done` — the distinct state has no name and no
History rendering. *Fix*: state where it lands (e.g. `done`, zero rows, E9 notice shown
in History), one clause in E9 or FR29.

**Finding C-3 · LOW · FR25 vs FR27.** "Marking for follow-up is **terminal** for this
slice" vs "**Any** resolved row can be reopened". The memlog (line 19) shows both were
decided together — terminal means "no downstream workflow", not irreversible — but the
PRD text lets a reader construct a contradiction. *Fix*: "terminal (no downstream
workflow in this slice; reversible per FR27)".

**Finding C-4 · LOW · FR23 tab 2 for image sources.** "What the system read" shows "the
extracted source text with T6-verified quotes highlighted" — for images there is no
source text and no T6 verification. Unaddressed. *Fix*: one clause (tab hidden for
images, or shows model transcription visibly labeled as such).

**Finding C-5 · TRIVIAL · .memlog.md line 21.** The cost figure was corrupted by shell
substitution to "/bin/zsh.003-0.032" (was "$0.003-0.032"). Harmless — arguably
authenticity evidence — but the memlog is the audit trail this rubric row leans on;
fix the two characters.

---

## Summary table

| # | Severity | Location | Issue |
|---|---|---|---|
| D-1 | HIGH | DECISIONS.md D4 ↔ prd.md | Canonical log says D4 OPEN; PRD says CLOSED; session not finalized |
| C-1 | MED-HIGH | FR17-T6 ↔ FR19, Success Measures | T6 literal reading makes all photo-menu rows uncertain; success counter overclaims for images |
| A-1 | MED | FR30 → FR23 | Source-artifact persistence required by no FR; lives only in addendum |
| C-2 | LOW-MED | E9 ↔ FR29 | Zero-dish terminal state missing from state vocabulary |
| T-1, T-2, S-1, C-3, C-4, C-5 | LOW | various | Citation attribution, R-numbering ambiguity, restatement claim, terminal-vs-reversible wording, image tab, memlog typo |

**Strengths (honest positives, one line each)**
- All five brief handoffs traceably closed; every sampled citation resolves to real text in the cited file.
- Memlog shows real in-session reversals (description policy, evidence panel) — the strongest possible anti-decoration evidence.
- Architecture is genuinely constrained: owned open items, inline verify-markers, addendum mechanics it cannot improvise around.
- Zero template filler; out-of-sequence FR35/36 match the recorded 2×2-audit timeline (authentic scar tissue).
