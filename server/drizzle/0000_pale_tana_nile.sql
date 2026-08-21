CREATE TABLE "dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"price_raw" text,
	"price_value" numeric(10, 2),
	"allergens" jsonb NOT NULL,
	"description" text NOT NULL,
	"description_provenance" text NOT NULL,
	"confidence_reasons" jsonb NOT NULL,
	"flag" text NOT NULL,
	"review_status" text DEFAULT 'pending' NOT NULL,
	"followup_note" text,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "dishes_run_id_position_unique" UNIQUE("run_id","position")
);
--> statement-breakpoint
CREATE TABLE "runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_ref" text NOT NULL,
	"source_class" text,
	"status" text NOT NULL,
	"stage" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"stage_changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_artifacts" (
	"run_id" uuid PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"bytes" "bytea",
	"acquired_text" text
);
--> statement-breakpoint
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_artifacts" ADD CONSTRAINT "source_artifacts_run_id_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."runs"("id") ON DELETE no action ON UPDATE no action;