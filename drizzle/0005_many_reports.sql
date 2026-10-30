-- Many reports per demo id (ADR 0009). Every report gets its own id; existing rows are demo reports
-- whose id is their demo id, so current demo ids keep their report and child rows only need the rename.
ALTER TABLE "blocks" RENAME COLUMN "demo_id" TO "report_id";--> statement-breakpoint
ALTER TABLE "capture_photos" RENAME COLUMN "demo_id" TO "report_id";--> statement-breakpoint
ALTER TABLE "captures" RENAME COLUMN "demo_id" TO "report_id";--> statement-breakpoint
ALTER TABLE "incidents" RENAME COLUMN "demo_id" TO "report_id";--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_demo_id_reports_demo_id_fk";
--> statement-breakpoint
ALTER TABLE "capture_photos" DROP CONSTRAINT "capture_photos_demo_id_capture_id_captures_demo_id_id_fk";
--> statement-breakpoint
ALTER TABLE "captures" DROP CONSTRAINT "captures_demo_id_reports_demo_id_fk";
--> statement-breakpoint
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_demo_id_reports_demo_id_fk";
--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "blocks_demo_id_id_pk";--> statement-breakpoint
ALTER TABLE "capture_photos" DROP CONSTRAINT "capture_photos_demo_id_capture_id_pk";--> statement-breakpoint
ALTER TABLE "captures" DROP CONSTRAINT "captures_demo_id_id_pk";--> statement-breakpoint
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_demo_id_id_pk";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "reports_pkey";--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_report_id_id_pk" PRIMARY KEY("report_id","id");--> statement-breakpoint
ALTER TABLE "capture_photos" ADD CONSTRAINT "capture_photos_report_id_capture_id_pk" PRIMARY KEY("report_id","capture_id");--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_report_id_id_pk" PRIMARY KEY("report_id","id");--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_report_id_id_pk" PRIMARY KEY("report_id","id");--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "reports" SET "id" = "demo_id";--> statement-breakpoint
ALTER TABLE "reports" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "kind" text DEFAULT 'demo' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "kind" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capture_photos" ADD CONSTRAINT "capture_photos_report_id_capture_id_captures_report_id_id_fk" FOREIGN KEY ("report_id","capture_id") REFERENCES "public"."captures"("report_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_demo_id_idx" ON "reports" USING btree ("demo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_one_demo_idx" ON "reports" USING btree ("demo_id") WHERE "reports"."kind" = 'demo';
