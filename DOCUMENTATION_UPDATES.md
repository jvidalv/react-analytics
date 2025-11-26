# Documentation Updates - Summary of Changes

This document tracks the key updates made to CLAUDE.md, AGENTS.md, and BUGBOT.md based on the current codebase state (as of Nov 24, 2025).

## Key Changes in Recent Commits

### Dependency Management

- **Removed**: stripe, openai, @hookform/resolvers, zustand, html-to-image, @radix-ui/react-toast, tailwindcss-animate, @tailwindcss/postcss
- **Added**: mdx, @react-email/tailwind, typescript-eslint
- **Moved**: @jvidalv/react-analytics from devDependencies to dependencies
- **New Script**: `yarn check:deps` - Check for unused dependencies

### Environment Variables

- **Removed**: AUTH_DRIZZLE_URL (was duplicate of DATABASE_URL)
- **Updated Plan Names**: Free/Starter/Pro (was Straw/Wood/Metal)
- **Added**: CRON_SECRET, BASE_URL for cron job authentication

### Architecture Changes

- **Data Fetching**: Migrated from SWR to React Query (@tanstack/react-query)
- **API Routes**: All routes now use Elysia (not Next.js API routes)
- **Route Structure**: Analytics moved from `/src/api/routes/public/analytics/` to `/src/api/routes/analytics/`
- **Removed**: /docs section entirely (commit b56d4fe)
- **Removed**: Seed data scripts and files (analytics_rows.sql, seed-analytics.ts, etc.)

### Technology Stack Updates

- Next.js: 15.x → 16.0.3
- React: 19.0.0 → 19.2.0
- Tailwind CSS: 3.x → 4.1.17 (major version upgrade)
- Drizzle ORM: 0.39.x → 0.44.7

## Updates Applied to CLAUDE.md

### ✅ Materialized Views Section (Lines 245-274)

- Already documented correctly
- Includes refresh schedule (every minute)
- Explains cron job endpoint

### ✅ Environment Variables (Lines 566-602)

- Still shows AUTH_DRIZZLE_URL (needs removal)
- Still shows old plan names (METAL/WOOD/STRAW)
- Missing CRON_SECRET and BASE_URL

### ⚠️ Tech Stack Section (Lines 31-68)

- Shows Next.js 15.1.6 (should be 16.0.3)
- Shows React 19.0.0 (should be 19.2.0)
- Shows Tailwind 3.4.1 (should be 4.1.17)
- Shows Zustand + SWR (should be React Query only)
- Shows AWS S3 (not in dependencies)
- Shows Apple provider (not configured)

### ⚠️ API Routes Section (Lines 134-160)

- Shows /docs route (removed in commit b56d4fe)
- Structure needs update to reflect Elysia routes

## Updates Needed for AGENTS.md

### Technology Stack (Lines 81-86)

- Update Next.js version to 16.0.3
- Update React version to 19.2.0

### Data Fetching Patterns (Lines 181-230)

- Add React Query section
- Document query keys pattern
- Document useQuery with Eden Treaty
- Document cache invalidation with queryClient.invalidateQueries()

### Remove References

- Remove any db:push command references
- Remove db:add-data script references

## Updates Needed for BUGBOT.md

### API Route Debugging (Lines 252-302)

- Update to reflect Elysia structure at /src/api/routes/
- Remove Next.js API route patterns

### Database Commands (Lines 142-190)

- Remove db:push references
- Remove db:add-data references
- Keep db:reset as the recommended approach

### Add New Sections

1. **React Query Debugging**
   - Query cache issues
   - Stale data problems
   - DevTools usage
   - Query key conflicts

2. **Eden Treaty Debugging**
   - Type mismatches
   - fetcherProtected authentication
   - CORS issues

3. **Cron Job Debugging**
   - Check if cron:watch is running
   - Manual refresh with yarn cron:refresh-views
   - CRON_SECRET verification
   - View refresh timestamps

## Critical Environment Variable Updates

Update all .env examples to match current .env.example:

```bash
# REMOVE
AUTH_DRIZZLE_URL=postgresql://...  # No longer used

# REMOVE old plan names
PRODUCT_METAL_PLAN_ID=...
PRODUCT_WOOD_PLAN_ID=...
NEXT_PUBLIC_METAL_PLAN=...
NEXT_PUBLIC_WOOD_PLAN=...
NEXT_PUBLIC_STRAW_PLAN=...

# ADD new plan names
PRODUCT_PRO_PLAN_ID=...
PRODUCT_STARTER_PLAN_ID=...
NEXT_PUBLIC_FREE_PLAN=...
NEXT_PUBLIC_STARTER_PLAN=...
NEXT_PUBLIC_PRO_PLAN=...

# ADD cron variables
CRON_SECRET=...  # Generate: openssl rand -base64 32
BASE_URL=...     # Defaults to http://localhost:3000
```

## React Query Migration Pattern

Document this pattern in all files:

### Old (SWR):

```typescript
import useSWR from "swr";
import { mutate } from "swr";

const { data } = useSWR("/api/app/all");
await mutate("/api/app/all");
```

### New (React Query):

```typescript
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

// Query
const { data } = useQuery({
  queryKey: getAllAppsQueryKey(),
  queryFn: async () => {
    const { data, error } = await fetcherProtected.app.all.get();
    if (error) throw error;
    return data;
  },
});

// Cache invalidation
const queryClient = useQueryClient();
await queryClient.invalidateQueries({ queryKey: getAllAppsQueryKey() });
```

## Eden Treaty Pattern

Document this API client pattern:

```typescript
import { fetcherProtected } from "@/lib/fetcher";

// GET request
const { data, error } = await fetcherProtected
  .app({ slug: "my-app" })
  .analytics.users.list.get({ query: { page: 1, limit: 50 } });

// POST request
const { data, error } = await fetcherProtected.app.create.post({
  id: "...",
  name: "...",
  description: "...",
});

// Error handling
if (error) {
  console.error(error);
  return;
}
```

## Elysia Route Structure

Document current API structure:

```
/src/api/routes/
├── index.ts                          # Main Elysia app with Swagger
├── public/
│   ├── index.ts                      # Public routes group
│   └── health.route.ts               # Health check
├── analytics/
│   ├── index.ts                      # Analytics routes group
│   └── post-push.route.ts            # POST /api/analytics/push
└── protected/
    ├── index.ts                      # Protected routes group (requires auth)
    ├── user/                         # Current user routes
    └── app/
        ├── get-all.route.ts          # GET /api/app/all
        ├── post-create.route.ts      # POST /api/app/create
        └── [slug]/
            ├── get-one.route.ts      # GET /api/app/:slug
            ├── put-update.route.ts   # PUT /api/app/:slug/update
            └── analytics/
                ├── api-keys.route.ts
                ├── users/
                │   ├── list.route.ts
                │   ├── filters.route.ts
                │   └── new-joiners.route.ts
                └── stats/
                    ├── overview.route.ts
                    ├── country-aggregates.route.ts
                    ├── platform-aggregates.route.ts
                    ├── identification-aggregates.route.ts
                    └── error-rate-aggregates.route.ts
```

## Commands Reference

Update all command references:

### Available:

- `yarn dev` - Next.js + cron watchers (runs concurrently)
- `yarn dev:next` - Next.js only (no cron)
- `yarn build` - Production build
- `yarn db:generate` - Generate migration from schema changes
- `yarn db:migrate` - Apply pending migrations
- `yarn db:studio` - Visual database browser
- `yarn db:reset` - Reset database (DESTRUCTIVE)
- `yarn cron` - Run cron tasks manually
- `yarn cron:refresh-views` - Refresh materialized views manually
- `yarn cron:watch` - Watch mode for cron jobs (auto-runs with dev)
- `yarn check:deps` - Check for unused dependencies
- `yarn format` - Run ESLint + Prettier

### Removed:

- `yarn db:add-data` - Seed data script (removed)
- `yarn db:push` - Direct schema push (never existed, use migrations)

## Protected Routes

Current protected route pattern:

- Middleware protects `/a/*` routes (not `/app/*`)
- Dashboard: `/a`
- App selection: `/a/s/[slug]`
- App users: `/a/s/[slug]/users`
- App settings: `/a/s/[slug]/settings`

## Materialized View Refresh

Current cron job setup:

- **Development**: `yarn cron:watch` runs alongside Next.js dev server
- **Production**: Vercel Cron hits `/api/cron/refresh-views` every minute
- **Authentication**: Requires `CRON_SECRET` in production
- **Manual refresh**: `yarn cron:refresh-views`
- **Views refreshed**:
  - `analytics_identified_users_mv` (production data)
  - `analytics_test_identified_users_mv` (test data)
