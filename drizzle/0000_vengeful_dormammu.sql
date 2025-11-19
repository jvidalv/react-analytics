CREATE TABLE "account" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "ai_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" jsonb,
	"response" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identify_id" text NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"properties" jsonb NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"info" jsonb DEFAULT '{}'::jsonb,
	"app_version" text DEFAULT '0.0.0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"api_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"api_key" text NOT NULL,
	"api_key_test" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_api_keys_api_key_unique" UNIQUE("api_key"),
	CONSTRAINT "analytics_api_keys_api_key_test_unique" UNIQUE("api_key_test")
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW analytics_identified_users_mv AS
WITH first_last_seen AS (
  SELECT
    api_key,
    identify_id,
    user_id,
    MIN(date) as first_seen,
    MAX(date) as last_seen
  FROM analytics
  WHERE user_id IS NOT NULL
  GROUP BY api_key, identify_id, user_id
),
latest_event_data AS (
  SELECT DISTINCT ON (a.identify_id)
    a.identify_id,
    a.properties,
    a.info,
    a.app_version
  FROM analytics a
  INNER JOIN first_last_seen fls ON fls.identify_id = a.identify_id AND fls.api_key = a.api_key
  WHERE a.user_id IS NOT NULL
  ORDER BY a.identify_id, a.date DESC
)
SELECT
  fls.api_key,
  fls.identify_id,
  fls.user_id,
  COALESCE(
    led.properties->'data'->>'name',
    NULLIF(TRIM(COALESCE(led.properties->'data'->>'firstName', '') || ' ' || COALESCE(led.properties->'data'->>'lastName', '')), '')
  ) as name,
  led.properties->'data'->>'email' as email,
  COALESCE(
    led.properties->'data'->>'avatarUrl',
    led.properties->'data'->>'avatar'
  ) as avatar,
  CASE
    WHEN led.info->>'platform' = 'ios' THEN 'iOS'
    WHEN led.info->>'platform' = 'android' THEN 'Android'
    WHEN led.info->>'platform' = 'web' AND (
      led.info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
      led.info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
    ) THEN 'iOS'
    WHEN led.info->>'platform' = 'web' AND
      led.info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'Android'
    ELSE 'Web'
  END as platform,
  led.info->'requestMetadata'->>'country' as country,
  led.app_version,
  fls.first_seen,
  fls.last_seen,
  NOW() as updated_at
FROM first_last_seen fls
INNER JOIN latest_event_data led ON led.identify_id = fls.identify_id;
--> statement-breakpoint
CREATE TABLE "analytics_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identify_id" text NOT NULL,
	"user_id" text,
	"type" text NOT NULL,
	"properties" jsonb NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"info" jsonb DEFAULT '{}'::jsonb,
	"app_version" text DEFAULT '0.0.0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"api_key" text NOT NULL
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW analytics_test_identified_users_mv AS
WITH first_last_seen AS (
  SELECT
    api_key,
    identify_id,
    user_id,
    MIN(date) as first_seen,
    MAX(date) as last_seen
  FROM analytics_test
  WHERE user_id IS NOT NULL
  GROUP BY api_key, identify_id, user_id
),
latest_event_data AS (
  SELECT DISTINCT ON (a.identify_id)
    a.identify_id,
    a.properties,
    a.info,
    a.app_version
  FROM analytics_test a
  INNER JOIN first_last_seen fls ON fls.identify_id = a.identify_id AND fls.api_key = a.api_key
  WHERE a.user_id IS NOT NULL
  ORDER BY a.identify_id, a.date DESC
)
SELECT
  fls.api_key,
  fls.identify_id,
  fls.user_id,
  COALESCE(
    led.properties->'data'->>'name',
    NULLIF(TRIM(COALESCE(led.properties->'data'->>'firstName', '') || ' ' || COALESCE(led.properties->'data'->>'lastName', '')), '')
  ) as name,
  led.properties->'data'->>'email' as email,
  COALESCE(
    led.properties->'data'->>'avatarUrl',
    led.properties->'data'->>'avatar'
  ) as avatar,
  CASE
    WHEN led.info->>'platform' = 'ios' THEN 'iOS'
    WHEN led.info->>'platform' = 'android' THEN 'Android'
    WHEN led.info->>'platform' = 'web' AND (
      led.info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
      led.info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
    ) THEN 'iOS'
    WHEN led.info->>'platform' = 'web' AND
      led.info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'Android'
    ELSE 'Web'
  END as platform,
  led.info->'requestMetadata'->>'country' as country,
  led.app_version,
  fls.first_seen,
  fls.last_seen,
  NOW() as updated_at
FROM first_last_seen fls
INNER JOIN latest_event_data led ON led.identify_id = fls.identify_id;
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"primary_color" text,
	"features" text DEFAULT '[]',
	"website_url" text,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"plan" text DEFAULT 'free',
	"dev_mode_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_api_key_analytics_api_keys_api_key_fk" FOREIGN KEY ("api_key") REFERENCES "public"."analytics_api_keys"("api_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_api_keys" ADD CONSTRAINT "analytics_api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_api_keys" ADD CONSTRAINT "analytics_api_keys_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_test" ADD CONSTRAINT "analytics_test_api_key_analytics_api_keys_api_key_test_fk" FOREIGN KEY ("api_key") REFERENCES "public"."analytics_api_keys"("api_key_test") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_api_key_identify_id_date" ON "analytics" USING btree ("api_key","identify_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_analytics_identify_id_type_date" ON "analytics" USING btree ("identify_id","type","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_analytics_test_api_key_identify_id_date" ON "analytics_test" USING btree ("api_key","identify_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_analytics_test_identify_id_type_date" ON "analytics_test" USING btree ("identify_id","type","date" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX idx_analytics_identified_users_mv_identify_id ON analytics_identified_users_mv(api_key, identify_id);
--> statement-breakpoint
CREATE INDEX idx_analytics_identified_users_mv_first_seen ON analytics_identified_users_mv(api_key, first_seen DESC);
--> statement-breakpoint
CREATE INDEX idx_analytics_identified_users_mv_last_seen ON analytics_identified_users_mv(api_key, last_seen DESC);
--> statement-breakpoint
CREATE INDEX idx_analytics_identified_users_mv_user_id ON analytics_identified_users_mv(api_key, user_id);
--> statement-breakpoint
CREATE UNIQUE INDEX idx_analytics_test_identified_users_mv_identify_id ON analytics_test_identified_users_mv(api_key, identify_id);
--> statement-breakpoint
CREATE INDEX idx_analytics_test_identified_users_mv_first_seen ON analytics_test_identified_users_mv(api_key, first_seen DESC);
--> statement-breakpoint
CREATE INDEX idx_analytics_test_identified_users_mv_last_seen ON analytics_test_identified_users_mv(api_key, last_seen DESC);
--> statement-breakpoint
CREATE INDEX idx_analytics_test_identified_users_mv_user_id ON analytics_test_identified_users_mv(api_key, user_id);