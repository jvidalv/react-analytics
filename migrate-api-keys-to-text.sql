-- Migration: Convert API key columns from UUID to TEXT
-- This allows backwards-compatible API keys with custom format

BEGIN;

-- Step 1: Drop foreign key constraints (they will be recreated)
ALTER TABLE analytics DROP CONSTRAINT IF EXISTS analytics_api_key_analytics_api_keys_api_key_fk;
ALTER TABLE analytics_test DROP CONSTRAINT IF EXISTS analytics_test_api_key_analytics_api_keys_api_key_test_fk;

-- Step 2: Drop defaults (keys will be generated in application code)
ALTER TABLE analytics_api_keys ALTER COLUMN api_key DROP DEFAULT;
ALTER TABLE analytics_api_keys ALTER COLUMN api_key_test DROP DEFAULT;

-- Step 3: Convert column types
-- Cast UUID to TEXT (preserves existing UUID-format keys)
ALTER TABLE analytics_api_keys ALTER COLUMN api_key TYPE TEXT USING api_key::TEXT;
ALTER TABLE analytics_api_keys ALTER COLUMN api_key_test TYPE TEXT USING api_key_test::TEXT;

ALTER TABLE analytics ALTER COLUMN api_key TYPE TEXT USING api_key::TEXT;
ALTER TABLE analytics_test ALTER COLUMN api_key TYPE TEXT USING api_key::TEXT;

-- Step 4: Recreate foreign key constraints with TEXT types
ALTER TABLE analytics
  ADD CONSTRAINT analytics_api_key_analytics_api_keys_api_key_fk
  FOREIGN KEY (api_key)
  REFERENCES analytics_api_keys(api_key)
  ON DELETE CASCADE;

ALTER TABLE analytics_test
  ADD CONSTRAINT analytics_test_api_key_analytics_api_keys_api_key_test_fk
  FOREIGN KEY (api_key)
  REFERENCES analytics_api_keys(api_key_test)
  ON DELETE CASCADE;

COMMIT;
