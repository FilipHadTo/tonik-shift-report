CREATE TABLE "blocks" (
	"demo_id" text NOT NULL,
	"id" text NOT NULL,
	"position" integer NOT NULL,
	"section" text NOT NULL,
	"text" text NOT NULL,
	"provenance" text NOT NULL,
	"sources" jsonb NOT NULL,
	"original" jsonb,
	CONSTRAINT "blocks_demo_id_id_pk" PRIMARY KEY("demo_id","id")
);
--> statement-breakpoint
CREATE TABLE "captures" (
	"demo_id" text NOT NULL,
	"id" text NOT NULL,
	"position" integer NOT NULL,
	"kind" text NOT NULL,
	"captured_at" text NOT NULL,
	"author" jsonb NOT NULL,
	"text" text NOT NULL,
	"chat_lines" jsonb,
	"photo" text,
	"from_phone" boolean DEFAULT false NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "captures_demo_id_id_pk" PRIMARY KEY("demo_id","id")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"demo_id" text NOT NULL,
	"id" text NOT NULL,
	"position" integer NOT NULL,
	"provenance" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"description_draft" text,
	"occurred_at" jsonb NOT NULL,
	"location" jsonb NOT NULL,
	"type" jsonb NOT NULL,
	"captured_at" text NOT NULL,
	"confirmed_at" text,
	"sources" jsonb NOT NULL,
	"evidence" jsonb NOT NULL,
	"from_staff" jsonb,
	"manual" boolean DEFAULT false NOT NULL,
	CONSTRAINT "incidents_demo_id_id_pk" PRIMARY KEY("demo_id","id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"demo_id" text PRIMARY KEY NOT NULL,
	"scene" text NOT NULL,
	"venue" text NOT NULL,
	"night" text NOT NULL,
	"started_at" text NOT NULL,
	"manager" jsonb NOT NULL,
	"visible" jsonb NOT NULL,
	"invited" boolean NOT NULL,
	"drafted" boolean NOT NULL,
	"clock" integer NOT NULL,
	"submitted_at" text,
	"capture_use" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_demo_id_reports_demo_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."reports"("demo_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_demo_id_reports_demo_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."reports"("demo_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_demo_id_reports_demo_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."reports"("demo_id") ON DELETE cascade ON UPDATE no action;