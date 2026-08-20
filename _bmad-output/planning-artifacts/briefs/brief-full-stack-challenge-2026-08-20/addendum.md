# Addendum — Menu Extraction & Review Brief

Depth that belongs downstream (PRD session, DECISIONS.md) but was produced and ratified
during the brief session of 2026-08-20.

## ADR: confidence-flag derivation options (opening position for PRD / D4)

Constraints: one OpenAI call (JSON mode / vision), no queues, Zod at boundaries, one test.

| Option | What it is | For | Against | Verdict |
|---|---|---|---|---|
| **A. Guided self-assessment** | Prompt gives the model explicit criteria for marking a row uncertain (ambiguous price, allergen not literally declared, doubtful OCR); model emits per-row flag | One call, cheap, captures signal only the model sees | Raw self-confidence is poorly calibrated — mitigated because criteria are rules, not vibes | **In — as input** |
| **B. Deterministic post-hoc rules** | Over the Zod-validated JSON: uncertain if price missing/ambiguous, name empty, or any allergen `inferred`/`unknown` | Explainable, testable (prime candidate for the single test), allergen asymmetry guaranteed by code | Blind to the model's internal doubt | **In — as final arbiter** |
| C. Dual extraction + agreement | Two passes, compare | Better calibration | 2× cost/latency; machinery smells like over-engineering for this slice | **Cut → DECISIONS.md** |
| D. Per-field logprobs | Token-level confidence | "Modern" | Impractical with JSON mode at field level; complexity without guarantee | **Cut → DECISIONS.md** |

**Recommended hybrid A→B**: model extracts, tags each allergen `declared|inferred`, and
self-flags doubts against explicit criteria; deterministic rules compute the final flag and
enforce the allergen gate. Note: this *evolves* the playbook's earlier position
("model self-reported confidence: not used") — the guided-criteria variant is rule-anchored,
and the deterministic arbiter still holds final authority. The evolution and its reasons are
DECISIONS.md material.

## Elicitation trail (methods run 2026-08-20)

Five methods were run in sequence over the confidence-flag / allergen-inference tension:
Reframe the Question, Inversion Analysis, Pre-mortem, ADR panel, Stakeholder Lens Rotation.
Their integrated outcome is the brief's Operating Principle + Review Loop. Key intermediate
findings preserved for downstream use:

- **Inversion — failure paths that became requirements**: raw LLM self-confidence as sole
  source; "reliable" rendered as "verified/safe" (automation complacency); inferred allergens
  visually identical to declared; over-flagging → alarm fatigue; empty allergen list
  indistinguishable from "unknown"; uncertain rows without adjacent evidence.
- **Pre-mortem root causes**: reliability derived from parse completeness rather than
  allergen certainty; UI language implying safety; no persisted review trail.
- **Stakeholder rotation gap**: "look only at uncertain rows" underserved the allergic diner;
  replaced by "attention proportional to doubt" + batch confirmation of reliables.

## Retraction record

Playbook §2 framed the job as "reviewable rows in under a minute". Retracted in-session:
LLM extraction of a large menu alone can take 30–90 s; the real bottleneck is where Ana's
attention goes, not clock speed. New target: **~3 minutes per menu** (realistic, with margin;
still ~10× vs. status quo). Visible course-correction → DECISIONS.md.

## 2×2 coverage audit (vs. BRIEF.md, JOB.md, INTERPRETATION.md, REQUIREMENTS.md, bmad-playbook.md)

- **Creep caught and removed**: per-row confirmer *identity* (implies auth — guardrail
  violation; reduced to status + timestamp, single-operator); flag derivation closed at brief
  altitude (moved to PRD opening position); anti-fatigue as measured metric (reduced to
  qualitative health condition — analytics is a non-goal).
- **Gaps filled**: graceful-failure states; visible history (R7 read as user-visible);
  menu-level completion concept; full non-goals list; cost-per-extraction constraint.
- **Correctly avoided throughout**: market sizing / competitor analysis (playbook §3.1 trap),
  microservices/queues/auth, headless browser, custom design system, regulatory depth beyond
  the EU-14 vocabulary.
