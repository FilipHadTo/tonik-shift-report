CREATE TABLE "capture_photos" (
	"demo_id" text NOT NULL,
	"capture_id" text NOT NULL,
	"mime" text NOT NULL,
	"data" text NOT NULL,
	CONSTRAINT "capture_photos_demo_id_capture_id_pk" PRIMARY KEY("demo_id","capture_id")
);
--> statement-breakpoint
ALTER TABLE "capture_photos" ADD CONSTRAINT "capture_photos_demo_id_capture_id_captures_demo_id_id_fk" FOREIGN KEY ("demo_id","capture_id") REFERENCES "public"."captures"("demo_id","id") ON DELETE cascade ON UPDATE no action;