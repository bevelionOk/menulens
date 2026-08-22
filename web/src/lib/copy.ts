import type { AllergenId, RunState, Stage, StoredFailureReason } from 'shared'

// All user-facing wording lives here so the honesty rules are auditable in one file:
// no percentage, no ETA, no "safe"/"verified", and every failure says what to do next.

// FR4 — the real stage in plain language. `validating` and `saving` are one beat
// because splitting them would narrate work the user cannot act on.
export const STAGE_COPY: Record<Stage, string> = {
  fetching_source: 'Reading the menu',
  extracting: 'The model is reading it — this is the slow part',
  validating: 'Checking and saving',
  saving: 'Checking and saving',
}

// The run row exists before the pipeline sets its first stage (persist-first, AD-4).
export const STAGE_PENDING_COPY = 'Starting'

// FR5 — a measurement, not a guess. Six real runs on the configured model took ~9–12 s
// end to end. Stating a bigger, safer-sounding range would be the exact dishonesty this
// product argues against. No countdown is derived from it.
export const EXPECTATION_COPY =
  'Runs typically finish in about 9 to 12 seconds. A long or image-only menu takes longer.'

export const STATE_LABEL: Record<RunState, string> = {
  processing: 'processing',
  done: 'done',
  failed: 'failed',
  empty: 'no dishes found',
  interrupted: 'interrupted',
}

export type FailureCopy = { title: string; detail: string }

// E2/E3/E7 — every stored reason gets its own actionable sentence. Retry is offered on
// all of them (retry = a new run, FR8), but only the model failures are worth retrying
// unchanged, so the copy says which is which.
export const FAILURE_COPY: Record<StoredFailureReason, FailureCopy> = {
  unreachable_url: {
    title: "I couldn't reach that URL",
    detail:
      'The address did not answer, or it refused the request. Check the link — or skip the fetch entirely and upload the menu as a PDF or a photo.',
  },
  no_usable_text: {
    title: "I couldn't find usable text at that address",
    detail:
      'The page loaded but carried almost no readable text — menus rendered as images or scripts do this. Upload the menu as a PDF or a photo instead; those go down the image path.',
  },
  model_timeout: {
    title: 'The model ran out of time',
    detail:
      'The extraction call passed its timeout, twice. Nothing was saved. A retry starts a new run and often succeeds; a very long menu may keep timing out.',
  },
  model_error: {
    title: 'The model call failed',
    detail:
      'The provider returned an error and the run stopped. Nothing was saved. Retry starts a new run.',
  },
  model_invalid_output: {
    title: 'The model returned something I could not read',
    detail:
      'The response did not match the expected structure, on both attempts. Nothing was saved. Retry starts a new run, or try a clearer source.',
  },
}

// E9 — zero dishes is a status, not a failure (AD-4). It is never styled as one and
// never shown as a mute empty table.
export const EMPTY_COPY: FailureCopy = {
  title: "I couldn't find dishes in this source",
  detail:
    'The source was read successfully — it just did not look like a menu to the model. Is it one? Try another page, or upload the menu as a PDF or a photo.',
}

// E8 — derived from staleness, never stored (AD-5). The server does not kill a stale run,
// so this page must not claim to know how it ended: "nothing was saved" is a guess, and a
// guess dressed as a fact is the one thing this product refuses to do.
export const INTERRUPTED_COPY: FailureCopy = {
  title: 'Interrupted — retry available',
  detail:
    'This run stopped reporting progress long enough to count as stale, so its outcome is unknown: it may have been cut off, or it may still be working and finish on its own. This page keeps checking. Retry starts a separate new run and leaves this one alone.',
}

// FR13 — the EU-14, spelled for a human.
export const ALLERGEN_LABEL: Record<AllergenId, string> = {
  gluten: 'Gluten',
  crustaceans: 'Crustaceans',
  eggs: 'Eggs',
  fish: 'Fish',
  peanuts: 'Peanuts',
  soybeans: 'Soy',
  milk: 'Milk',
  nuts: 'Tree nuts',
  celery: 'Celery',
  mustard: 'Mustard',
  sesame: 'Sesame',
  sulphites: 'Sulphites',
  lupin: 'Lupin',
  molluscs: 'Molluscs',
}

// FR28 — the review screen never claims a row is correct, only that no rule fired.
export const DISCLAIMER = 'AI-extracted — verify before publishing.'

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return minutes > 0 ? `${minutes}m ${String(seconds).padStart(2, '0')}s` : `${seconds}s`
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString()
}
