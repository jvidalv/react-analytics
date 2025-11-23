# Analytics System Modernization Plan

**Date**: 2025-11-15
**Status**: Planning Phase
**Owner**: Development Team

## Executive Summary

The analytics system is a full-stack mobile analytics platform tracking user behavior across iOS/Android applications. While well-architected for MVP, several critical performance and scalability issues need addressing before scaling beyond 10k daily active users.

**Key Findings**:

- ✅ Strong foundation: Dual environments, TypeScript coverage, identity reconciliation
- 🔴 Critical: Missing MAU endpoint (404 errors in production)
- 🔴 Critical: Session calculation fetches 6000 events to Node.js (performance bottleneck)
- 🟡 Missing indexes causing slow queries at scale
- 🟡 No rate limiting or data retention policies

---

## Current Architecture

### Data Flow

```
Mobile Apps (iOS/Android)
    ↓ HTTP POST /api/analytics/push
Ingestion Layer (API key validation, event validation)
    ↓ INSERT
PostgreSQL (analytics / analytics_test tables)
    ↓ SELECT queries
Query Layer (7 REST endpoints)
    ↓ JSON responses
Frontend (React + SWR)
```

### Event Types (5)

1. **navigation** - Screen/route changes
   - Required: `path` (string)

2. **action** - User interactions
   - Required: `name` (string)

3. **identify** - User identification
   - Required: `id` (string)
   - Optional: email, firstName, lastName, avatarUrl

4. **state** - App focus/blur
   - Required: `active` (boolean)

5. **error** - Error tracking
   - Required: `message` (string)

### Database Schema

**Table**: `analytics` (production) / `analytics_test` (development)

```sql
Columns:
- id              UUID PRIMARY KEY
- identifyId      TEXT NOT NULL
- userId          TEXT NULL
- type            TEXT NOT NULL
- properties      JSONB NOT NULL
- date            TIMESTAMP WITH TIME ZONE NOT NULL
- info            JSONB DEFAULT {}
- appVersion      TEXT DEFAULT '0.0.0' NOT NULL
- apiKey          UUID FOREIGN KEY → analyticsApiKeys
- createdAt       TIMESTAMP NOT NULL
- updatedAt       TIMESTAMP NOT NULL

Indexes:
- idx_analytics_api_key_identify_id_date (apiKey, identifyId, date DESC)
- idx_analytics_identify_id_type_date (identifyId, type, date DESC)
```

---

## Critical Issues

### 🔴 ISSUE #1: Broken MAU Endpoint

**Location**: Frontend calls `/api/analytics/users/stats/mau`
**Problem**: Endpoint doesn't exist (404 errors)
**Impact**: Broken feature in production
**Priority**: P0 - Immediate fix required
**Solution**: Implement MAU calculation endpoint

```sql
-- Proposed implementation
WITH current_month AS (
  SELECT COUNT(DISTINCT identify_id) as total
  FROM analytics
  WHERE api_key = $1
    AND date >= date_trunc('month', CURRENT_DATE)
),
previous_month AS (
  SELECT COUNT(DISTINCT identify_id) as total
  FROM analytics
  WHERE api_key = $1
    AND date >= date_trunc('month', CURRENT_DATE - interval '1 month')
    AND date < date_trunc('month', CURRENT_DATE)
)
SELECT
  c.total as current,
  p.total as previous,
  ROUND((c.total - p.total)::numeric / NULLIF(p.total, 0) * 100, 2) as growth
FROM current_month c, previous_month p;
```

---

### 🔴 ISSUE #2: Session Calculation Performance

**Location**: `/api/analytics/users/one/sessions/route.ts`
**Problem**: Fetches up to 6000 events and processes in Node.js memory
**Impact**:

- Can't scale beyond 6000 events per user
- Slow for active users (~500ms+)
- High memory usage
- Network overhead

**Priority**: P0 - Performance critical
**Solution**: Move calculation to SQL using window functions

```sql
-- Proposed SQL-based session calculation
WITH events_with_gaps AS (
  SELECT
    *,
    EXTRACT(EPOCH FROM (date - LAG(date) OVER (ORDER BY date))) > 300
      AS is_new_session
  FROM analytics
  WHERE identify_id = $1 AND api_key = $2
  ORDER BY date
),
sessions_numbered AS (
  SELECT
    *,
    SUM(CASE WHEN is_new_session THEN 1 ELSE 0 END)
      OVER (ORDER BY date) AS session_id
  FROM events_with_gaps
)
SELECT
  json_agg(
    json_build_object(
      'id', id,
      'type', type,
      'properties', properties,
      'date', date,
      'info', info,
      'appVersion', app_version
    ) ORDER BY date
  ) as events,
  session_id
FROM sessions_numbered
WHERE type != 'state'
GROUP BY session_id
ORDER BY MIN(date) DESC;
```

---

### 🔴 ISSUE #3: Missing Database Indexes

**Problem**: No indexes on `userId`, `type`, `appVersion`, or JSONB properties
**Impact**:

- User search queries perform full table scans
- Identity reconciliation is slow
- Aggregate queries inefficient at scale

**Priority**: P1 - High impact, low effort
**Solution**: Add strategic indexes

```sql
-- Recommended indexes
CREATE INDEX idx_analytics_user_id ON analytics(userId)
  WHERE userId IS NOT NULL;

CREATE INDEX idx_analytics_type_date ON analytics(type, date DESC);

CREATE INDEX idx_analytics_app_version ON analytics(appVersion);

CREATE INDEX idx_analytics_properties_gin ON analytics
  USING GIN (properties jsonb_path_ops);

CREATE INDEX idx_analytics_info_gin ON analytics
  USING GIN (info jsonb_path_ops);
```

**Expected Impact**: ~10x query speedup for searches

---

### 🟡 ISSUE #4: No Data Retention Policy

**Problem**: Analytics data grows indefinitely
**Impact**: Database bloat, slower queries over time
**Priority**: P2 - Scalability concern
**Solution**: Partition table by month, drop old partitions

```sql
-- Create partitioned table
CREATE TABLE analytics_partitioned (
  LIKE analytics INCLUDING ALL
) PARTITION BY RANGE (date);

-- Create monthly partitions
CREATE TABLE analytics_2025_01 PARTITION OF analytics_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Cron job to drop partitions older than 90 days
```

---

### 🟡 ISSUE #5: No Rate Limiting

**Problem**: `/api/analytics/push` has no rate limits
**Impact**: Vulnerable to abuse/DDoS
**Priority**: P2 - Security concern
**Solution**: Add rate limiting per API key (1000 events/min)

---

## Modernization Phases

### Phase 1: Critical Fixes (~2 days)

**Deliverables**:

1. ✅ Implement MAU endpoint
2. ✅ Add database indexes
3. ✅ Move session calculation to SQL
4. ✅ Migrate push endpoint to Elysia with improvements

**Impact**: Immediate bug fixes + ~10x query performance improvement

---

### Phase 2: Performance Optimization (~1 week)

**Deliverables**:

1. Implement response caching (5-minute TTL on aggregates)
2. Migrate to cursor-based pagination
3. Add rate limiting to push endpoint
4. Optimize user list query

**Impact**: ~30% overall performance improvement, ready for 50k events/day

---

### Phase 3: Scalability (~2 weeks)

**Deliverables**:

1. Implement data retention policy (90-day partitions)
2. Add event deduplication (idempotency keys)
3. Async identity reconciliation
4. Add monitoring/alerting

**Impact**: Ready for 100k+ events/day

---

### Phase 4: New Features (Future)

**Potential Features**:

- Real-time updates via WebSocket
- Funnel analysis
- Cohort analysis
- GDPR compliance (user deletion)
- Data export (CSV/JSON)
- Custom dashboards
- Alerting/webhooks

---

## What Works Well (Preserve These)

### ✅ Dual Environment Separation

Production vs test API keys - excellent for development workflow

### ✅ Identity Reconciliation

Automatic merging of anonymous → identified users preserves historical data

### ✅ JSONB Flexibility

Properties and info fields allow schema evolution without migrations

### ✅ TypeScript Coverage

Full type safety across frontend/backend with shared types

### ✅ Comprehensive Validation

Zod/TypeBox schemas ensure data quality

### ✅ Good UX Features

- Real-time "Online" badge (2-minute threshold)
- Cross-field search
- Session timeline visualization
- Country flags with emoji
- Platform icons (iOS/Android)

---

## Migration to Elysia

### Benefits

- Consistent with new architecture (berrus pattern)
- Better performance (Elysia is faster than Next.js API routes)
- Type-safe end-to-end with Eden Treaty
- Unified error handling
- Better middleware composition

### Strategy

- Incremental migration, no breaking changes
- Create new routes under `/api/public/analytics/` and `/api/protected/app/[slug]/analytics/`
- Migrate frontend hooks from old routes to new Elysia routes
- Test in parallel before deprecating old endpoints
- Use feature flags if needed

### Priority Order

1. **Public push endpoint** (high traffic, benefits from performance)
2. **Protected query endpoints** (MAU, sessions, aggregates)
3. **User list/details endpoints** (lower priority)

---

## Success Metrics

### Performance

- Average query time < 100ms (currently ~300ms for complex queries)
- Push endpoint latency < 50ms (currently ~150ms)
- Session endpoint handles unlimited events (currently capped at 6000)

### Scalability

- Support 100k events/day without degradation (currently ~10k/day)
- Database size growth < 10GB/month with retention policy
- Query performance stable with 1M+ events in database

### Reliability

- 99.9% uptime for push endpoint
- Zero data loss
- Proper error handling and logging

---

## Next Steps

1. **Week 1**: Migrate push endpoint to Elysia with improvements
2. **Week 2**: Implement MAU endpoint + add database indexes
3. **Week 3**: Move session calculation to SQL
4. **Week 4**: Performance testing and optimization

---

## Questions/Decisions Needed

- [ ] Should we use Redis or in-memory caching for aggregates?
- [ ] What's the target data retention period? (90 days suggested)
- [ ] Do we need real-time WebSocket updates or is polling sufficient?
- [ ] Should we implement GDPR deletion now or later?
- [ ] What monitoring/alerting infrastructure should we use?

---

**Last Updated**: 2025-11-15
**Next Review**: After Phase 1 completion
