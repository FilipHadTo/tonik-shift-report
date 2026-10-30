CREATE TABLE "ai_calls" (
	"ip_hash" text NOT NULL,
	"window" integer NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "ai_calls_ip_hash_window_pk" PRIMARY KEY("ip_hash","window")
);
