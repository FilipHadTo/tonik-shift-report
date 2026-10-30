ALTER TABLE "reports" ADD COLUMN "submitted_by" jsonb;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "statement" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "ai_assisted" boolean DEFAULT false NOT NULL;