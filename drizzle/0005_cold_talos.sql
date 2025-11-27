CREATE TABLE "error_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analytics_id" uuid NOT NULL,
	"api_key" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "error_status_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analytics_id" uuid NOT NULL,
	"api_key" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "error_status" ADD CONSTRAINT "error_status_analytics_id_analytics_id_fk" FOREIGN KEY ("analytics_id") REFERENCES "public"."analytics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_status" ADD CONSTRAINT "error_status_api_key_analytics_api_keys_api_key_fk" FOREIGN KEY ("api_key") REFERENCES "public"."analytics_api_keys"("api_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_status_test" ADD CONSTRAINT "error_status_test_analytics_id_analytics_test_id_fk" FOREIGN KEY ("analytics_id") REFERENCES "public"."analytics_test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "error_status_test" ADD CONSTRAINT "error_status_test_api_key_analytics_api_keys_api_key_test_fk" FOREIGN KEY ("api_key") REFERENCES "public"."analytics_api_keys"("api_key_test") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_error_status_analytics_id" ON "error_status" USING btree ("analytics_id");--> statement-breakpoint
CREATE INDEX "idx_error_status_api_key_status" ON "error_status" USING btree ("api_key","status");--> statement-breakpoint
CREATE INDEX "idx_error_status_test_analytics_id" ON "error_status_test" USING btree ("analytics_id");--> statement-breakpoint
CREATE INDEX "idx_error_status_test_api_key_status" ON "error_status_test" USING btree ("api_key","status");