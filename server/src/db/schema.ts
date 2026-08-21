import { customType, integer, jsonb, numeric, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import type {
  AllergenEntry,
  ConfidenceReason,
  DescriptionProvenance,
  Flag,
  ReviewStatus,
  RunStatus,
  SourceClass,
  SourceType,
  Stage,
  StoredFailureReason,
} from 'shared';

// Spine ER (AD-8), three tables. Column keys are spelled once, snake_case, and become
// the column names verbatim — no Drizzle `casing` auto-mapping. Keys match the wire
// keys `shared` declares 1:1 with no mapping; values differ in one place: timestamptz
// columns are `Date` in rows and become ISO-8601 strings when Fastify serializes the
// response — the `shared` wire schema describes that serialized form.
// Enum columns are `text` with `$type<>` from `shared` — Zod is the enum truth (AD-2).

// drizzle-orm 0.45 pg-core has no native bytea; `pg` reads/writes it as Buffer.
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

export const runs = pgTable('runs', {
  id: uuid().primaryKey().defaultRandom(),
  source_type: text().$type<SourceType>().notNull(),
  // URL or original file name — History shows it (FR29). Not PII (NFR4).
  source_ref: text().notNull(),
  source_class: text().$type<SourceClass>(),
  status: text().$type<RunStatus>().notNull(),
  stage: text().$type<Stage>(),
  failure_reason: text().$type<StoredFailureReason>(),
  created_at: timestamptz('created_at').notNull().defaultNow(),
  // AD-10 staleness anchor: moves on every stage transition.
  stage_changed_at: timestamptz('stage_changed_at').notNull().defaultNow(),
});

export const dishes = pgTable(
  'dishes',
  {
    id: uuid().primaryKey().defaultRandom(),
    run_id: uuid()
      .notNull()
      .references(() => runs.id),
    // Server-assigned extraction order; every reader sorts by it (AD-8).
    position: integer().notNull(),
    name: text().notNull(),
    price_raw: text(),
    price_value: numeric({ precision: 10, scale: 2, mode: 'number' }),
    allergens: jsonb().$type<AllergenEntry[]>().notNull(),
    description: text().notNull(),
    description_provenance: text().$type<DescriptionProvenance>().notNull(),
    confidence_reasons: jsonb().$type<ConfidenceReason[]>().notNull(),
    flag: text().$type<Flag>().notNull(),
    review_status: text().$type<ReviewStatus>().notNull().default('pending'),
    // The only free-text column Ana writes (FR25) — operational text, not PII.
    followup_note: text(),
    reviewed_at: timestamptz('reviewed_at'),
  },
  (t) => [unique().on(t.run_id, t.position)],
);

// 1:1 with runs: uploaded bytes (none for URL runs) + acquired source text (AD-8).
export const sourceArtifacts = pgTable('source_artifacts', {
  run_id: uuid()
    .primaryKey()
    .references(() => runs.id),
  content_type: text().notNull(),
  bytes: bytea(),
  acquired_text: text(),
});
