# React Analytics Platform - Debugging & Troubleshooting Guide

## Project Context

**React Analytics** is a platform for tracking, viewing, and querying analytics data from React applications. It consists of:
1. **Analytics Package** (`@jvidalv/react-analytics`) - Universal React analytics library (web + native)
2. **Analytics Dashboard** - Next.js application for visualizing and querying analytics data

This guide helps debug common issues, understand system architecture, and resolve problems quickly.

---

## Common Issues & Solutions

### 1. Analytics Events Not Showing in Dashboard

#### Symptom
Events sent from client app don't appear in the dashboard.

#### Diagnostic Steps
```bash
# 1. Check if events are reaching the API
# Look in browser DevTools → Network tab for POST /api/analytics/push
# Status should be 201

# 2. Check which table events are going to
# In PostgreSQL:
SELECT COUNT(*) FROM analytics;        # Production
SELECT COUNT(*) FROM analytics_test;   # Test

# 3. Verify API key matches
# In dashboard: /app/s/[slug]/users → Dropdown → API Keys
```

#### Common Causes & Fixes

**Wrong API Key**
```typescript
// ❌ Wrong: Using test key in production
createAnalyticsClient({ apiKey: 'test-key-xxx' })

// ✅ Correct: Use production key
createAnalyticsClient({ apiKey: 'prod-key-xxx' })
```

**CORS Blocked**
- **Issue**: Browser blocks cross-origin request
- **Fix**: CORS is enabled on `/api/analytics/push`, but check:
  - Are you using the correct endpoint URL?
  - Is the request coming from a browser extension (may block CORS)?
  - Check browser console for CORS errors

**Event Properties Too Large**
- **Limit**: 600 characters per event properties JSON
- **Fix**: Reduce property payload size
```typescript
// ❌ Too large
analytics.track('action', {
  name: 'click',
  properties: { veryLongString: '...(700 chars)...' }
})

// ✅ Reduced
analytics.track('action', {
  name: 'click',
  properties: { summary: 'shortened data' }
})
```

**Missing identifyId**
```typescript
// ❌ No identifyId - events won't be stored
createAnalyticsClient({ apiKey: 'xxx' })

// ✅ identifyId auto-generated and persisted
// Happens automatically with storage adapter
createAnalyticsClient({
  apiKey: 'xxx',
  asyncStorageInstance: AsyncStorage // or localStorage
})
```

---

### 2. API Key Authentication Failures

#### Symptom
API returns 403 Forbidden when sending events.

#### Diagnostic Query
```sql
-- Check if API key exists
SELECT * FROM analytics_api_keys
WHERE api_key = 'your-key-here'
   OR api_key_test = 'your-key-here';

-- Check app association
SELECT ak.*, a.slug
FROM analytics_api_keys ak
JOIN apps a ON ak.app_id = a.id
WHERE ak.api_key = 'your-key-here';
```

#### Common Causes

**1. API Key Doesn't Exist**
- Create new app in dashboard
- Copy keys from settings dropdown

**2. Using Wrong Key Type**
```typescript
// Test key format: shorter, different prefix
const testKey = 'test_abc123'

// Production key format: longer, different prefix
const prodKey = 'prod_xyz789'
```

**3. App Deleted**
- Cascade delete removes API keys
- Create new app and update client

---

### 3. Database Connection Problems

#### Symptom
```
Error: connect ECONNREFUSED 127.0.0.1:5434
```

#### Solutions

**Local Development**
```bash
# 1. Start Docker Postgres
yarn db

# 2. Verify it's running
docker ps | grep postgres

# 3. Check port availability
lsof -i :5434

# 4. Test connection
psql -h localhost -p 5434 -U postgres -d postgres

# 5. Apply migrations if needed
yarn db:migrate

# 6. Reset database completely (⚠️ DESTRUCTIVE)
yarn db:reset
```

**Production (Neon)**
```bash
# Check DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# Verify environment variable is set
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"
```

**Common Issues**
- Port 5434 (not default 5432) for local dev
- Docker not running: `docker-compose up -d`
- Wrong DATABASE_URL in .env.local
- Neon connection limit reached (max 100 connections)
- Migrations not applied: Run `yarn db:migrate`
- Schema out of sync: Run `yarn db:reset` for fresh start (⚠️ DESTRUCTIVE)

**Materialized Views:**
The project uses materialized views for identified users analytics. These are created via migrations:
- `analytics_identified_users_mv` - Production identified users
- `analytics_test_identified_users_mv` - Test identified users
- Refreshed every minute by cron job (`yarn cron:watch`)
- Manual refresh: `yarn cron:refresh-views`

---

### 4. Monorepo Workspace Issues

#### Symptom
```
Module not found: Can't resolve '@jvidalv/react-analytics'
```

#### Solutions

```bash
# 1. Verify workspace configuration
cat package.json | grep -A 3 workspaces
# Should show: "workspaces": ["packages/*"]

# 2. Check analytics package exists
ls packages/analytics/package.json

# 3. Reinstall dependencies
rm -rf node_modules packages/analytics/node_modules
yarn install

# 4. Build analytics package
cd packages/analytics
yarn build
cd ../..

# 5. Verify Next.js can resolve it
yarn build
```

**Common Causes**
- Analytics package not built (`dist/` folder missing)
- Node modules out of sync
- Wrong package name in web app's package.json
- Yarn cache corruption: `yarn cache clean`

---

### 5. Analytics Package Build Failures

#### Symptom
```
Error: Cannot find package '@babel/preset-typescript'
```

#### Solutions

```bash
# 1. Ensure devDependencies installed
cd packages/analytics
cat package.json | grep -A 5 devDependencies

# 2. Install missing deps
yarn install

# 3. Clear build cache
rm -rf dist node_modules
yarn install
yarn build

# 4. Check for TypeScript errors
yarn tsc --noEmit
```

**Required Build Dependencies**
- `@babel/core`
- `@babel/preset-react`
- `@babel/preset-typescript`
- `rollup`
- `@rollup/plugin-babel`
- `@rollup/plugin-typescript`
- `@rollup/plugin-commonjs`
- `@rollup/plugin-node-resolve`

---

### 6. NextAuth / Authentication Issues

#### Symptom
- Infinite redirect loops
- Session not persisting
- "Not authenticated" on protected routes

#### Solutions

**Check AUTH_SECRET**
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
echo "AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local
```

**Verify OAuth Credentials**
```bash
# Check all auth variables are set
grep -E "^AUTH_" .env.local

# Required:
# AUTH_SECRET
# AUTH_GITHUB_ID
# AUTH_GITHUB_SECRET
# AUTH_GOOGLE_ID
# AUTH_GOOGLE_SECRET
```

**Check Callback URLs**
- GitHub: Settings → Developer settings → OAuth Apps
  - Callback: `http://localhost:3000/api/auth/callback/github`
- Google: Cloud Console → APIs & Services → Credentials
  - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**Session Not Persisting**
```sql
-- Check if session exists
SELECT * FROM sessions
WHERE user_id = 'your-user-id'
ORDER BY expires DESC;

-- Check if user exists
SELECT * FROM users WHERE email = 'your@email.com';
```

**Middleware Edge Runtime Limitation**
```typescript
// ❌ Don't import full auth in middleware
import { auth } from '@/auth'

// ✅ Use cookie-based check
import { cookies } from 'next/headers'
const sessionCookie = cookies().get('authjs.session-token')
```

---

### 7. Event Batching Not Working

#### Symptom
Events sent individually instead of batched.

#### Debug
```typescript
// Add logging to analytics client
const client = createAnalyticsClient({
  apiKey: 'xxx',
  batchInterval: 5000, // 5 seconds
  maxBatchSize: 100,
  debug: true // If supported
})

// Check network tab
// Should see batched POST every 5 seconds
```

**Common Causes**
- `batchInterval` set to 0 (sends immediately)
- Storage adapter not configured (can't queue events)
- Page navigates before batch sends (events lost)

**Solution**: Implement flush on page unload
```typescript
useEffect(() => {
  const handleUnload = () => {
    analytics.flush() // Send queued events
  }
  window.addEventListener('beforeunload', handleUnload)
  return () => window.removeEventListener('beforeunload', handleUnload)
}, [])
```

---

### 8. Analytics Query Performance Issues

#### Symptom
Dashboard queries are slow (> 2 seconds).

#### Diagnostic
```sql
-- Check table size
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'analytics%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
EXPLAIN ANALYZE
SELECT * FROM analytics
WHERE api_key = 'xxx'
  AND date >= NOW() - INTERVAL '7 days'
ORDER BY date DESC
LIMIT 100;
```

#### Optimizations

**Add Indexes** (already in schema, but verify)
```sql
-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'analytics';

-- Should have indexes on:
-- - api_key
-- - identify_id
-- - user_id
-- - date
```

**Partition Table by Date** (for large datasets)
```sql
-- Create partitioned table (example)
CREATE TABLE analytics_partitioned (
  LIKE analytics INCLUDING ALL
) PARTITION BY RANGE (date);

-- Create monthly partitions
CREATE TABLE analytics_2025_11 PARTITION OF analytics_partitioned
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

**Use Materialized Views** for aggregations
```sql
CREATE MATERIALIZED VIEW analytics_daily_stats AS
SELECT
  api_key,
  DATE(date) as day,
  COUNT(*) as event_count,
  COUNT(DISTINCT identify_id) as unique_users
FROM analytics
GROUP BY api_key, DATE(date);

-- Refresh periodically
REFRESH MATERIALIZED VIEW analytics_daily_stats;
```

---

### 9. CORS Configuration Issues

#### Symptom
```
Access to fetch at '...' has been blocked by CORS policy
```

#### Current CORS Setup
```typescript
// In /api/analytics/push/route.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}
```

#### Troubleshooting
```bash
# Test OPTIONS preflight
curl -X OPTIONS \
  -H "Origin: http://example.com" \
  -H "Access-Control-Request-Method: POST" \
  http://localhost:3000/api/analytics/push

# Should return CORS headers
```

**If Specific Origin Needed**
```typescript
const allowedOrigins = [
  'https://your-app.com',
  'http://localhost:3000'
]

const origin = req.headers.get('origin')
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0],
  // ... rest
}
```

---

### 10. TypeScript Type Errors

#### Common Errors

**Missing Event Type**
```typescript
// ❌ Error: Type 'string' is not assignable to type 'AnalyticsEvent'
import type { AnalyticsEvent } from '@jvidalv/react-analytics'

const events: AnalyticsEvent[] = [/* ... */]
```

**Wrong Import Path**
```typescript
// ❌ Wrong
import { track } from '@jvidalv/react-analytics/dist/core'

// ✅ Correct
import { useAnalytics } from '@jvidalv/react-analytics'
const analytics = useAnalytics()
analytics.track(...)
```

**Drizzle Schema Type Mismatch**
```typescript
// ❌ Passing Date object
await db.insert(analytics).values({
  date: new Date()
})

// ✅ Drizzle expects timestamp
await db.insert(analytics).values({
  date: new Date() // Drizzle auto-converts
})
```

---

## Architecture Deep Dive

### Analytics Event Flow

```
┌─────────────────────┐
│   React App         │
│  (Client Side)      │
└──────────┬──────────┘
           │
           ├─► Router Detection
           │   └─► usePathname() / useSegments() / useLocation()
           │
           ├─► Event Creation
           │   └─► core.ts: createEvent()
           │
           ├─► Event Queue
           │   └─► Batching (5 sec interval)
           │
           ├─► Storage Persistence
           │   └─► localStorage / AsyncStorage
           │
           ▼
    POST /api/analytics/push
           │
           ▼
┌─────────────────────┐
│   Next.js API       │
│   (Server Side)     │
└──────────┬──────────┘
           │
           ├─► Validate API Key
           │   └─► Check analytics_api_keys table
           │
           ├─► Validate Events
           │   └─► Type, required fields, property size
           │
           ├─► Enrich Events
           │   └─► Add country, user-agent, metadata
           │
           ├─► Link User Events
           │   └─► Update identifyId if userId provided
           │
           ▼
┌─────────────────────┐
│   PostgreSQL        │
│   (Database)        │
└─────────────────────┘
     analytics (prod)
     analytics_test
```

### Request/Response Lifecycle

#### 1. Client Request
```typescript
// Client-side
const events: AnalyticsEvent[] = [{
  type: 'navigation',
  path: '/home',
  date: new Date(),
  properties: {}
}]

fetch('https://api.domain.com/api/analytics/push', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'prod_xxx',
    identifyId: 'device-uuid',
    userId: 'user-123',
    appVersion: '1.0.0',
    events,
    info: { platform: 'web', browser: 'Chrome' }
  })
})
```

#### 2. Server Validation
```typescript
// Server-side (/api/analytics/push/route.ts)

// Validate API key
const apiKeyRecord = await db
  .select()
  .from(analyticsApiKeys)
  .where(or(
    eq(analyticsApiKeys.apiKey, apiKey),
    eq(analyticsApiKeys.apiKeyTest, apiKey)
  ))

// Determine table (production vs test)
const isTestKey = apiKey === apiKeyData.apiKeyTest
const targetTable = isTestKey ? analyticsTest : analytics

// Validate each event
events.forEach(event => {
  if (!VALID_EVENT_TYPES.includes(event.type)) {
    throw new Error('Invalid event type')
  }
  if (event.properties && JSON.stringify(event.properties).length > 600) {
    throw new Error('Properties too large')
  }
})
```

#### 3. Event Enrichment
```typescript
// Add request metadata
const requestMetadata = {
  country: req.headers.get('x-vercel-ip-country') || null,
  userAgent: req.headers.get('user-agent') || null
}

// Format events for database
const dbEvents = events.map(event => ({
  id: uuidv7(),
  apiKey,
  identifyId,
  userId,
  appVersion,
  date: new Date(event.date),
  type: event.type,
  properties: {
    [specialPropertyKey]: specialPropertyValue,
    ...(event.properties ? { data: event.properties } : {})
  },
  info: { ...info, requestMetadata },
  createdAt: new Date(),
  updatedAt: new Date()
}))
```

#### 4. User Linking
```typescript
// If userId provided, link all previous events
if (userId && identifyId) {
  const existingIdentify = await db
    .select({ identifyId: targetTable.identifyId })
    .from(targetTable)
    .where(eq(targetTable.userId, userId))

  const previousIdentifyId = existingIdentify[0]?.identifyId

  // Update all events from old identifyId to new one
  if (previousIdentifyId && previousIdentifyId !== identifyId) {
    await db
      .update(targetTable)
      .set({ identifyId })
      .where(eq(targetTable.identifyId, previousIdentifyId))
  }
}
```

#### 5. Database Insert
```typescript
// Bulk insert events
await db.insert(targetTable).values(dbEvents)

return NextResponse.json(
  { success: true },
  { status: 201, headers: corsHeaders }
)
```

---

## Environment-Specific Issues

### Development vs Production

#### Local Development
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_...
```

#### Production
```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-domain.com

# Stripe (live mode)
STRIPE_SECRET_KEY=sk_live_...
```

### Edge Cases

**Development on Different Port**
```bash
# If running on :3001
NEXTAUTH_URL=http://localhost:3001

# Update OAuth callbacks too
# GitHub: http://localhost:3001/api/auth/callback/github
```

**Behind Reverse Proxy**
```bash
# May need to trust proxy headers
# In Next.js config:
module.exports = {
  experimental: {
    trustHostHeader: true
  }
}
```

---

## Testing Strategies

### Unit Testing Analytics Package

```bash
cd packages/analytics
yarn test

# Specific test file
yarn test app-state.test.ts

# Watch mode
yarn test:watch

# Coverage
yarn test:coverage
```

### Integration Testing

```typescript
// Test analytics ingestion
describe('Analytics API', () => {
  it('should accept valid events', async () => {
    const response = await fetch('http://localhost:3000/api/analytics/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: testApiKey,
        identifyId: 'test-device',
        events: [{
          type: 'action',
          name: 'test-action',
          date: new Date(),
          properties: {}
        }]
      })
    })

    expect(response.status).toBe(201)

    // Verify in database
    const events = await db
      .select()
      .from(analyticsTest)
      .where(eq(analyticsTest.identifyId, 'test-device'))

    expect(events).toHaveLength(1)
  })
})
```

### Manual Testing Checklist

- [ ] Analytics events appear in dashboard
- [ ] Test and production keys route correctly
- [ ] User identification links events
- [ ] Event properties saved correctly
- [ ] Country detection works
- [ ] API key authentication blocks invalid keys
- [ ] CORS allows cross-origin requests
- [ ] Batch sending works
- [ ] Events survive page refresh (persisted in storage)
- [ ] Router detection works (Next.js/Expo/RR)

---

## Performance Monitoring

### Database Query Performance

```sql
-- Enable query timing
SET enable_timing = on;

-- Slow query log
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%analytics%'
ORDER BY total_time DESC
LIMIT 10;
```

### API Response Times

```typescript
// Add timing middleware
export async function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  const duration = Date.now() - start
  response.headers.set('X-Response-Time', `${duration}ms`)

  console.log(`${request.method} ${request.url} - ${duration}ms`)

  return response
}
```

### Client-Side Performance

```typescript
// Monitor batch send performance
const client = createAnalyticsClient({
  apiKey: 'xxx',
  onBatchSend: (events, duration) => {
    console.log(`Sent ${events.length} events in ${duration}ms`)
  }
})
```

---

## Security Considerations

### API Key Security
- ✅ **DO**: Store in environment variables
- ✅ **DO**: Use separate test/production keys
- ❌ **DON'T**: Commit keys to git
- ❌ **DON'T**: Expose production keys client-side

### Input Validation
```typescript
// Always validate event types
const VALID_EVENT_TYPES = [
  'navigation',
  'action',
  'identify',
  'state',
  'error'
] as const

if (!VALID_EVENT_TYPES.includes(event.type)) {
  throw new Error('Invalid event type')
}

// Limit property size
const MAX_PROPERTIES_LENGTH = 600
if (JSON.stringify(properties).length > MAX_PROPERTIES_LENGTH) {
  throw new Error('Properties too large')
}
```

### SQL Injection Prevention
```typescript
// ✅ Good: Drizzle ORM
await db
  .select()
  .from(analytics)
  .where(eq(analytics.apiKey, apiKey))

// ❌ Bad: Raw SQL
await db.execute(
  `SELECT * FROM analytics WHERE api_key = '${apiKey}'`
)
```

---

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] OAuth callbacks updated for production URL
- [ ] Stripe webhooks configured
- [ ] Analytics package published to npm
- [ ] Build succeeds without errors
- [ ] All tests passing
- [ ] Performance tested under load
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Database backups configured
- [ ] SSL certificates valid
- [ ] CORS configured correctly

---

## Useful Debugging Queries

### Check Recent Events
```sql
SELECT
  id,
  type,
  date,
  properties,
  info,
  created_at
FROM analytics
ORDER BY created_at DESC
LIMIT 10;
```

### Find Events by User
```sql
SELECT
  type,
  properties,
  date
FROM analytics
WHERE user_id = 'user-xxx'
ORDER BY date DESC;
```

### Count Events by Type
```sql
SELECT
  type,
  COUNT(*) as count,
  COUNT(DISTINCT identify_id) as unique_users
FROM analytics
WHERE date >= NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY count DESC;
```

### Find Large Events
```sql
SELECT
  id,
  type,
  LENGTH(properties::text) as property_size,
  properties
FROM analytics
WHERE LENGTH(properties::text) > 500
ORDER BY property_size DESC;
```

### Check API Key Usage
```sql
SELECT
  ak.api_key,
  a.slug,
  COUNT(an.*) as event_count
FROM analytics_api_keys ak
JOIN apps a ON ak.app_id = a.id
LEFT JOIN analytics an ON an.api_key = ak.api_key
GROUP BY ak.api_key, a.slug
ORDER BY event_count DESC;
```

---

**Last Updated**: November 2025
**For Questions**: See CLAUDE.md or AGENTS.md
