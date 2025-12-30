CREATE INDEX "idx_analytics_user_id" ON "analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_test_user_id" ON "analytics_test" USING btree ("user_id");