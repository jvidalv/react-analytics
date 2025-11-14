# React Analytics Platform - AI Reference Guide

## Project Vision

**React Analytics** is a comprehensive analytics platform for React applications. It provides:
- Universal analytics tracking library (`@jvidalv/react-analytics`) for React, React Native, Expo, and Next.js
- Web dashboard for viewing, querying, and analyzing user behavior data
- Multi-app support allowing users to track analytics across multiple React applications
- Real-time and historical analytics with powerful querying capabilities

## Monorepo Architecture

This is a Yarn workspaces monorepo containing:

```
react-analytics/
├── packages/analytics/          # @jvidalv/react-analytics - NPM package
│   ├── src/                    # Universal analytics library
│   ├── test/                   # Vitest test suite
│   └── dist/                   # Rollup build output (CJS + ESM)
└── src/                        # Next.js analytics dashboard
    ├── app/                    # App Router pages
    ├── components/             # UI components
    ├── domains/                # Business logic
    └── db/                     # Database layer
```

## Technology Stack

### Core Framework
- **Next.js 15.1.6** - App Router, Server Components
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5** - Full type safety

### Database & ORM
- **PostgreSQL** - Primary database (Neon serverless in production)
- **Drizzle ORM 0.39.1** - Type-safe SQL queries
- **Local Dev**: Docker Compose (PostgreSQL on port 5434)

### Authentication
- **NextAuth v5** - OAuth authentication
- **Providers**: Google, Apple, GitHub
- **Sessions**: Database-backed, 10-year duration
- **Protection**: Middleware guards `/app/*` routes

### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Shadcn/ui** - Accessible component primitives (38 components)
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library

### State & Data Fetching
- **Zustand v5** - Lightweight state management
- **SWR 2.3.2** - Data fetching and caching

### External Services
- **Stripe** - Payment processing (3 tiers: Straw/Wood/Metal)
- **AWS S3** - File storage
- **OpenAI** - AI-powered features
- **Resend** - Transactional emails

## Core Product Features

### 1. Analytics Ingestion
- **Endpoint**: `POST /api/analytics/push`
- **Authentication**: API key-based (production + test keys)
- **Event Types**: Navigation, Actions, Errors, State, Identify
- **Properties**: Max 600 characters per event
- **Batching**: Client-side 5-second interval batching
- **Storage**: Separate tables for production vs test data

### 2. Analytics Dashboard
- **User Analytics**: `/app/s/[slug]/users`
  - Real-time user sessions
  - Event timeline
  - Error tracking
  - Navigation paths
  - Aggregated statistics
- **Filtering**: By date range, event type, user ID
- **Privacy**: Sensitive mode to hide user data

### 3. Multi-App Management
- **App Creation**: Users can create multiple apps
- **Slug-based**: Each app has unique slug for routing
- **API Keys**: Separate production/test keys per app
- **Settings**: `/app/s/[slug]/settings`

### 4. Analytics Package (`@jvidalv/react-analytics`)
- **Auto-detection**: Automatically detects Next.js, Expo Router, React Router
- **Event Types**:
  - **Navigation**: Automatic page/screen tracking
  - **Action**: Custom user actions
  - **Error**: Error boundary integration
  - **State**: App state changes (React Native)
  - **Identify**: User identification
- **Storage Adapters**: localStorage (web), AsyncStorage (React Native)
- **Device Detection**: Platform, OS, browser, device info
- **Batching**: 5-second intervals, max 100 events per batch

## Directory Structure Reference

### `/packages/analytics` - Analytics Library
```
packages/analytics/
├── src/
│   ├── analytics-provider.tsx   # Main React provider component
│   ├── core.ts                  # Core analytics engine
│   ├── router.tsx               # Router integrations (Next, Expo, RR)
│   ├── storage.ts               # Storage adapters
│   ├── device.ts                # Device detection (web/native)
│   ├── app-state.ts             # App state tracking (RN)
│   ├── types.ts                 # TypeScript definitions
│   ├── utils.ts                 # Utilities
│   └── index.ts                 # Public exports
├── test/                        # Vitest tests
├── rollup.config.js             # Build configuration
└── package.json                 # NPM package config
```

### `/src/app` - Next.js Application
```
src/app/
├── api/
│   ├── analytics/
│   │   ├── push/route.ts          # Analytics ingestion endpoint
│   │   ├── api-keys/route.ts      # API key management
│   │   └── users/
│   │       ├── all/route.ts       # List all users
│   │       ├── one/route.ts       # Single user details
│   │       ├── stats/route.ts     # User statistics
│   │       └── sessions/route.ts  # User sessions
│   ├── auth/[...nextauth]/route.ts # NextAuth handlers
│   ├── user/me/route.ts           # Current user
│   └── stripe/route.ts            # Stripe webhooks
├── app/
│   ├── dashboard/page.tsx         # Main dashboard
│   ├── account/page.tsx           # User account settings
│   ├── docs/                      # Documentation pages
│   └── s/[slug]/                  # App-specific routes
│       ├── users/                 # Analytics dashboard
│       ├── settings/              # App settings
│       ├── stores/                # (Legacy: to be removed)
│       └── translations/          # (Legacy: to be removed)
├── join/                          # Authentication pages
└── legal/                         # Legal pages
```

### `/src/domains` - Business Logic
```
src/domains/
├── app/
│   ├── app.api.ts                 # App CRUD operations
│   ├── users/
│   │   ├── users.api.ts           # Analytics user queries
│   │   └── stats/users-stats.api.ts # User statistics
│   └── (legacy stores/translations to be removed)
├── user/
│   ├── me.api.ts                  # Current user operations
│   └── user.utils.ts              # User utilities
└── plan/api.plan.ts               # Pricing plan logic
```

## Database Schema

### Core Tables

#### `users` - Platform users
```typescript
{
  id: string (uuid)
  name: string | null
  email: string (unique)
  emailVerified: timestamp | null
  image: string | null
  plan: 'free' | 'straw' | 'wood' | 'metal'
  aiModel: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `apps` - User applications
```typescript
{
  id: string (uuid)
  userId: string (fk -> users.id)
  slug: string (unique)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `analytics_api_keys` - API keys per app
```typescript
{
  id: string (uuid)
  appId: string (fk -> apps.id, cascade delete)
  apiKey: string (production key)
  apiKeyTest: string (test key)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `analytics` - Production analytics events
```typescript
{
  id: string (uuid)
  apiKey: string (indexed)
  identifyId: string (indexed) // Device/session identifier
  userId: string | null (indexed) // Identified user
  appVersion: string | null
  date: timestamp (indexed)
  type: 'navigation' | 'action' | 'identify' | 'state' | 'error'
  properties: jsonb // Event-specific data
  info: jsonb | null // Device/platform info
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `analytics_test` - Test environment events
- Same schema as `analytics` table
- Separate for development testing

### Supporting Tables
- `accounts` - OAuth provider accounts (NextAuth)
- `sessions` - User sessions (NextAuth)
- `transactions` - Stripe payment transactions

## API Routes Overview

### Analytics APIs

#### `POST /api/analytics/push`
Analytics event ingestion endpoint.

**Request Body:**
```typescript
{
  apiKey: string
  identifyId?: string
  userId?: string
  appVersion?: string
  events: AnalyticsEvent[]
  info?: Record<string, unknown>
}
```

**Features:**
- CORS enabled for cross-origin requests
- Validates event types and required fields
- Routes to production or test table based on API key
- Detects user country from request headers
- Automatically links events if userId provided
- Returns 201 on success

#### `GET /api/analytics/users/all`
List all unique users for an app.

**Query Params:** `appId`, `page`, `limit`, `search`, `startDate`, `endDate`

#### `GET /api/analytics/users/one`
Get detailed user analytics.

**Query Params:** `appId`, `identifyId`

**Returns:** User info, events timeline, session count

#### `GET /api/analytics/users/stats`
Get user statistics.

**Returns:** Total users, active users, retention metrics

### App Management APIs

#### `GET /api/app/all`
List user's apps.

#### `GET /api/app/one`
Get single app details.

**Query Params:** `slug`

## Authentication Flow

1. **Unauthenticated**: Redirected to `/join` page
2. **OAuth Flow**: Google/Apple/GitHub sign-in
3. **Session Creation**: Database-backed session (10 years)
4. **Cookie**: `authjs.session-token` cookie set
5. **Middleware**: Checks cookie on `/app/*` routes
6. **Protected Routes**: All `/app/*` routes require authentication

**Edge Cases:**
- Middleware uses edge runtime (limited Drizzle imports)
- Session validated via cookie presence only in middleware
- Full session data loaded in page components

## Analytics Package Architecture

### Event Flow
```
User Action
    ↓
Router Detection (Next.js/Expo/RR)
    ↓
Event Creation (core.ts)
    ↓
Event Queue (batching)
    ↓
Storage (localStorage/AsyncStorage)
    ↓
Batch Send (every 5 seconds)
    ↓
POST /api/analytics/push
    ↓
Database (analytics/analytics_test)
```

### Key Components

#### `AnalyticsProvider`
```typescript
<AnalyticsProvider client={analyticsClient}>
  {children}
</AnalyticsProvider>
```

#### `createAnalyticsClient`
```typescript
const client = createAnalyticsClient({
  apiKey: 'your-api-key',
  endpoint: 'https://your-domain.com/api/analytics/push',
  asyncStorageInstance: AsyncStorage, // For React Native
  appVersion: '1.0.0',
  batchInterval: 5000,
  maxBatchSize: 100
})
```

#### Router Detection
- **Next.js**: Uses `usePathname()` and `useSearchParams()`
- **Expo Router**: Uses `useSegments()` and `useGlobalSearchParams()`
- **React Router**: Uses `useLocation()`

## Development Workflow

### Initial Setup
```bash
# 1. Clone repository
git clone git@github.com:jvidalv/react-analytics.git
cd react-analytics

# 2. Copy environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Install dependencies (Node 24+ required)
nvm use 24
yarn install

# 4. Start local database
yarn db  # Starts PostgreSQL on port 5434

# 5. Push database schema
yarn db:push

# 6. Start development server
yarn dev  # http://localhost:3000
```

### Common Commands

```bash
# Development
yarn dev                    # Start Next.js dev server
yarn build                  # Production build
yarn start                  # Start production server

# Database
yarn db                     # Start Docker Postgres
yarn db:push                # Push schema to database

# Analytics Package
cd packages/analytics
yarn build                  # Build CJS + ESM bundles
yarn test                   # Run Vitest tests
yarn test:watch             # Watch mode
yarn test:coverage          # Coverage report
npm publish                 # Publish to npm

# Code Quality
yarn lint                   # ESLint
yarn format                 # ESLint --fix + Prettier

# Email Development
yarn emails:dev             # Preview emails on :3001

# Tunneling (for webhook testing)
yarn ngrok                  # Expose localhost via ngrok
```

### Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://...
AUTH_DRIZZLE_URL=postgresql://...

# Auth
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...
S3_BUCKET_URL=...

# APIs
OPENAI_API_KEY=...
RESEND_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET_KEY=...

# Product Plan IDs
PRODUCT_METAL_PLAN_ID=...
PRODUCT_WOOD_PLAN_ID=...
NEXT_PUBLIC_METAL_PLAN=...
NEXT_PUBLIC_WOOD_PLAN=...
NEXT_PUBLIC_STRAW_PLAN=...
```

## Git Commit Conventions

This project follows semantic commit conventions to maintain a clear and meaningful git history.

### Commit Message Format

```
<type>: <subject>

<body (optional)>
```

### Commit Types

- **feat**: New features or significant enhancements to existing features
  - Example: `feat: add user authentication with OAuth`
  - Use when adding new functionality that users will notice

- **fix**: Bug fixes
  - Example: `fix: resolve navigation crash on iOS`
  - Use when correcting defects or errors

- **refactor**: Code restructuring without changing functionality
  - Example: `refactor: reorganize analytics event handling`
  - Use when improving code structure, moving files, or renaming

- **docs**: Documentation updates
  - Example: `docs: update API endpoint documentation`
  - Use for README, CLAUDE.md, comments, or legal page updates

- **chore**: Maintenance tasks, dependency updates, configuration
  - Example: `chore: upgrade Next.js to v16`
  - Use for dependencies, build config, or routine maintenance

- **test**: Adding or updating tests
  - Example: `test: add analytics batching tests`
  - Use when working with test files

- **perf**: Performance improvements
  - Example: `perf: optimize database query for user analytics`
  - Use when specifically improving performance

### Commit Message Guidelines

- **Subject line**: Keep under 72 characters, use imperative mood ("add" not "added")
- **Body**: Explain the "why" not the "what" - the code shows what changed
- **Scope**: Optionally add scope in parentheses: `feat(analytics): add custom event tracking`
- **Breaking changes**: Prefix with `BREAKING:` in body for major changes

### Examples

**Good commits:**
```
feat: restructure pricing plans from one-time to subscription model

Changed from Straw/Wood/Metal tiers to Free/Starter/Pro SaaS pricing.
This enables recurring revenue and scales better with usage patterns.
```

```
docs: update legal pages for React Analytics rebrand

Updated privacy policy, terms of service, and license agreement to
reflect the new React Analytics brand and subscription model.
```

```
chore: upgrade Next.js 16, React 19, and Tailwind 4

Major framework upgrades to latest stable versions. Includes
migration to Turbopack and Tailwind CSS v4 configuration.
```

**Avoid:**
```
update stuff          # Too vague
Fixed bug             # Not descriptive enough
WIP                   # Work should be completed before committing
Updated 15 files      # Describes what, not why
```

### When to Commit

- Commit logical units of work that pass tests
- One feature/fix per commit when possible
- Separate refactoring from feature changes
- Group related changes together (e.g., all legal docs, all UI components)

### Multi-Commit Changes

For large changes affecting multiple areas:

1. **Break into logical commits** by concern (pricing, UI, docs)
2. **Ensure each commit builds** and doesn't break the app
3. **Order commits logically** (dependencies first, features after)
4. **Keep commits focused** - one purpose per commit

### AI-Assisted Development

This project uses AI tools (Claude Code, GitHub Copilot, etc.) to assist with development.

**Important**: Do NOT add co-author attribution or "Generated with Claude Code" footers to commit messages. Commits should be clean and professional without AI attribution.

The use of AI tools is documented here in CLAUDE.md, not in individual commits.

## Code Patterns & Conventions

### File Naming
- **Components**: PascalCase - `UserDashboard.tsx`
- **Utilities**: camelCase - `formatDate.ts`
- **API Routes**: kebab-case folders, `route.ts` file
- **Domains**: kebab-case - `users.api.ts`

### Database Queries
- Use Drizzle ORM, not raw SQL
- Import `db` from `@/db`
- Use `eq()`, `and()`, `or()` from `drizzle-orm`
- Always use prepared statements

### API Routes
- Return `NextResponse.json()`
- Include proper HTTP status codes
- Add CORS headers for analytics endpoints
- Validate input with TypeScript types
- Handle errors gracefully

### Component Structure
- Server Components by default
- Use `"use client"` only when needed
- Prefer Server Actions over API routes
- Keep client components small and focused

### Path Aliases
- `@/*` → `./src/*`
- Configured in `tsconfig.json`

## Debugging Tips

### Analytics Events Not Appearing
1. Check API key is correct (production vs test)
2. Verify CORS is enabled on endpoint
3. Check browser network tab for 403/400 errors
4. Ensure `identifyId` is being set
5. Check event properties are under 600 chars
6. Verify database table (analytics vs analytics_test)

### Database Connection Issues
1. Ensure Docker Postgres is running (`yarn db`)
2. Check `DATABASE_URL` in `.env.local`
3. Verify port 5434 is not in use
4. Run `yarn db:push` to sync schema

### Monorepo Build Issues
1. Clean node_modules: `rm -rf node_modules && yarn install`
2. Rebuild analytics: `cd packages/analytics && yarn build`
3. Check for ESLint errors in dist folders (should be ignored)
4. Ensure Node 24+ is active

### Authentication Issues
1. Check `AUTH_SECRET` is set
2. Verify OAuth credentials are correct
3. Check callback URLs in provider settings
4. Clear cookies and try again
5. Check middleware is not blocking non-app routes

## Performance Considerations

- **Analytics Tables**: Indexed on `apiKey`, `identifyId`, `userId`, `date`
- **Event Batching**: 5-second intervals reduce API calls
- **Server Components**: Most pages are server-rendered
- **SWR Caching**: API responses cached client-side
- **Database**: Connection pooling via Neon/Drizzle

## Security Best Practices

- **API Keys**: Never commit to git, use environment variables
- **CORS**: Only enable for analytics ingestion endpoint
- **Sessions**: Database-backed, not JWT
- **Input Validation**: Validate all user input
- **SQL Injection**: Use Drizzle ORM, never raw SQL
- **XSS**: React escapes by default, be careful with `dangerouslySetInnerHTML`

## Next Steps & Roadmap

### Planned Features
- Advanced analytics querying (filters, aggregations)
- Custom dashboard creation
- Real-time analytics updates
- Export functionality (CSV, JSON)
- Analytics visualization charts
- Funnel analysis
- Retention cohorts
- A/B testing integration

### Legacy Code to Remove
- Store management features (`/stores`)
- Translation features (`/translations`)
- Related API routes and database tables

---

**Last Updated**: November 2025
**Version**: 1.0.0
