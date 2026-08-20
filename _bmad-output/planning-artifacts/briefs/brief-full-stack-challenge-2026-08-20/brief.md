---
title: Product Brief — Menu Extraction & Review
status: final
created: 2026-08-20
updated: 2026-08-20
---

# Product Brief: Menu Extraction & Review

## Executive Summary

Ana onboards restaurant menus for a food-ordering platform. Today she transcribes each menu by hand — spreadsheet, copy, paste — at 15–30 minutes per menu, and she is legally accountable for every allergen she types. This product turns any public menu (URL, PDF, or photo) into structured, reviewable dish rows and routes her scarce attention to the rows that actually need it, targeting roughly 3 minutes per menu.

The system is not an autonomous extractor with a score attached; it is **triage-assisted review**. An LLM extracts dishes (name, price, allergens, one-line description), every row carries a confidence flag, and the flag's only job is to route Ana's attention: `uncertain` rows demand inspection with the source in view, `reliable` rows are eligible for quick batch confirmation. Ana's legal responsibility is not removed — it is made executable and defensible.

## The Problem

Manual menu transcription is slow, but speed is not the core pain — **liability is**. Public menus almost never declare allergens per dish, so whoever fills the allergen column is either reading fine print that isn't there or making judgment calls under EU rules (the 14 declarable allergens of Regulation 1169/2011). Ana's current tools — a spreadsheet and a browser tab — give her no leverage on either problem: everything gets the same attention, nothing records what she checked, and a missed allergen looks identical to a verified absence.

## The Operating Principle

One principle governs every layer of this product:

> **The system never claims more than it can prove, and everything it cannot prove is handed to Ana with the evidence in view.**

Every design decision below is this principle projected onto one stage of the loop. When a future question arises ("why doesn't the flag say *verified*?", "why persist confirmations?"), the answer is always this sentence.

## The Solution: The Review Loop

**Extract → Triage → Review → Confirm**

1. **Extract — honesty at the source.** Each extracted allergen is tagged by what it *is*: read from the menu (`declared`) or deduced from the dish (`inferred`). A dish with no allergen information is `unknown` — because "none found" is not "none present". This provenance is the raw material without which no honest confidence flag can exist.

2. **Triage — asymmetry by design.** The confidence flag does not measure parse quality; it measures **whether it is safe for Ana not to look closely**. Allergen certainty therefore dominates the row: a perfectly parsed name and price with inferred or unknown allergens is `uncertain`, no exceptions. The asymmetry must be guaranteed by deterministic rules in code, not by the model's self-assessment; the exact derivation mechanics are deliberately left open here and close in the PRD (see Handoffs).

3. **Review — attention proportional to doubt.** Not "look only at uncertain rows" but *attention routed by doubt*: `uncertain` rows are inspected with the source evidence at hand (if Ana must reopen the PDF, the 3-minute target dies); `reliable` rows are skimmed and confirmed in batch. The UI speaks the principle's language — "auto-checked" and "needs review", never "safe" or "verified".

4. **Confirm — accountability made executable.** Reviewing means confirming a row or marking it doubtful, individually or in batch; each resolution is persisted with its review status and timestamp (single-operator context — no user identity, no accounts). A menu is **done** when every row is resolved. Confirmed menus remain visible in a simple extraction history.

**When extraction cannot deliver, the loop says so.** An unreachable URL, an illegible photo, or a menu yielding zero dishes produces an honest, actionable failure state — "I couldn't" is itself a claim the system can prove.

## Who This Serves

- **Ana (primary)** — onboarding ops. She needs throughput *and* defensibility: "I can show what I checked and why I trusted it." Evidence-in-view and persisted confirmations are her features, not bureaucracy.
- **The allergic diner (shadow stakeholder)** — never sees this UI; their only protection is the pipeline's asymmetry. An honest `unknown` downstream is worth more than a confident guess.
- **The restaurant (shadow stakeholder)** — allergen errors are a safety risk; price errors are money and disputes. Both are governed by the same flag; the second is tolerable, the first is not.

## Success Criteria

- **~3 minutes per menu** end-to-end (vs. 15–30 today) — governed not by LLM speed but by triage calibration.
- **Zero tolerance for false-reliables on allergens**, by construction: the asymmetric gate makes it structurally impossible for inferred/unknown allergens to reach `reliable`.
- **Enough genuinely reliable rows to make batch confirmation worthwhile.** A system that flags everything as uncertain has failed just as surely — alarm fatigue sends Ana back to the spreadsheet. (Qualitative health condition; no measurement infrastructure in this slice.)
- **Honest failure**: every dead-end input ends in a clear, actionable state, never a silent empty table.

## Scope

**In:** URL / PDF / image ingestion; LLM extraction (name, price, allergens with provenance, one-line description, confidence flag); persisted results with visible extraction history; the review loop (confirm / mark doubtful, single and batch); row-level review status.

**Out (non-goals):** menu editing and publishing; user accounts, roles, or multi-tenancy; analytics or measurement dashboards; UI internationalization; regulatory compliance tooling beyond the EU-14 allergen vocabulary.

## Constraints

- **Stack is fixed by the challenge**: Node.js + Fastify + TypeScript, PostgreSQL + Drizzle (real migration), React + Vite + Tailwind + shadcn/ui, OpenAI SDK (JSON mode; vision for images), one meaningful automated test, structured Pino logs.
- **Allergen vocabulary**: the 14 EU declarable allergens (Reg. 1169/2011) as a closed list. No deeper regulatory scope.
- **Cost per extraction** matters: the unit economics of a single menu extraction feed the business case (BUSINESS.md).
- **Over-engineering guardrails apply** (REQUIREMENTS.md §4): one service, no queues, no auth, exactly one test.

## Handoffs — open questions the PRD must close

- **Confidence-flag derivation (D4).** Opening position from this session's ADR: the model extracts and tags allergen provenance while self-flagging doubts against explicit criteria; deterministic post-hoc rules act as final arbiter and enforce the allergen gate. Dual extraction and per-field logprobs were considered and cut (→ DECISIONS.md).
- Evidence-in-view mechanics for uncertain rows (the brief fixes the principle; the PRD sizes the how).
- Error-state inventory and UI copy; sync-vs-async UX; history list scope.

## Vision

If this were real, the product's value would be Ana's time and her defensibility — a review loop that scales to every menu the platform onboards, where "reviewed by a human with evidence" is the platform's answer to allergen liability. That framing, not the extraction itself, is what a customer would pay for.
