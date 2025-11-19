-- Fix materialized views duplicate key error
-- Problem: first_last_seen CTE was grouping by (api_key, identify_id, user_id)
-- This creates multiple rows per (api_key, identify_id) when user_id changes
-- Solution: Group by (api_key, identify_id) only and select latest user_id

-- Drop existing materialized views
DROP MATERIALIZED VIEW IF EXISTS analytics_identified_users_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS analytics_test_identified_users_mv CASCADE;

-- Recreate analytics_identified_users_mv with fixed logic
CREATE MATERIALIZED VIEW analytics_identified_users_mv AS
WITH first_last_seen AS (
  SELECT DISTINCT ON (api_key, identify_id)
    api_key,
    identify_id,
    user_id,
    MIN(date) OVER (PARTITION BY api_key, identify_id) as first_seen,
    MAX(date) OVER (PARTITION BY api_key, identify_id) as last_seen
  FROM analytics
  WHERE user_id IS NOT NULL
  ORDER BY api_key, identify_id, date DESC  -- Latest user_id per identify_id
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

-- Recreate indexes for analytics_identified_users_mv
CREATE UNIQUE INDEX idx_analytics_identified_users_mv_identify_id ON analytics_identified_users_mv(api_key, identify_id);
CREATE INDEX idx_analytics_identified_users_mv_first_seen ON analytics_identified_users_mv(api_key, first_seen DESC);
CREATE INDEX idx_analytics_identified_users_mv_last_seen ON analytics_identified_users_mv(api_key, last_seen DESC);
CREATE INDEX idx_analytics_identified_users_mv_user_id ON analytics_identified_users_mv(api_key, user_id);

-- Recreate analytics_test_identified_users_mv with fixed logic
CREATE MATERIALIZED VIEW analytics_test_identified_users_mv AS
WITH first_last_seen AS (
  SELECT DISTINCT ON (api_key, identify_id)
    api_key,
    identify_id,
    user_id,
    MIN(date) OVER (PARTITION BY api_key, identify_id) as first_seen,
    MAX(date) OVER (PARTITION BY api_key, identify_id) as last_seen
  FROM analytics_test
  WHERE user_id IS NOT NULL
  ORDER BY api_key, identify_id, date DESC  -- Latest user_id per identify_id
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

-- Recreate indexes for analytics_test_identified_users_mv
CREATE UNIQUE INDEX idx_analytics_test_identified_users_mv_identify_id ON analytics_test_identified_users_mv(api_key, identify_id);
CREATE INDEX idx_analytics_test_identified_users_mv_first_seen ON analytics_test_identified_users_mv(api_key, first_seen DESC);
CREATE INDEX idx_analytics_test_identified_users_mv_last_seen ON analytics_test_identified_users_mv(api_key, last_seen DESC);
CREATE INDEX idx_analytics_test_identified_users_mv_user_id ON analytics_test_identified_users_mv(api_key, user_id);
