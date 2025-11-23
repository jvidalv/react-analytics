# React Analytics

Privacy-first analytics platform for React applications. Track user behavior, monitor errors, and gain insights without compromising privacy.

## Open Source

This project is open source and self-hostable. Built with modern web technologies and designed for developers who want full control over their analytics data.

## Quick Start

### Prerequisites

- **Node.js 22+** (uses NVM: `nvm use 24`)
- Docker & Docker Compose
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/jvidalv/react-analytics.git
cd react-analytics/web

# Use correct Node version
nvm use 24

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# Start PostgreSQL database
yarn db

# Run database migrations
yarn db:migrate

# Start development server (includes Next.js + cron watchers)
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Database Management

The project uses **Drizzle migrations** for all schema changes:

```bash
# Generate new migration from schema.ts changes
yarn db:generate

# Apply pending migrations
yarn db:migrate

# Visual database browser
yarn db:studio

# Reset database (⚠️ DESTRUCTIVE - drops all tables)
yarn db:reset

# Load 288k+ anonymized analytics events (after creating an app)
yarn db:add-data <prod-api-key> <test-api-key>
```

**Important:** Never bypass the migration system. Always use `yarn db:generate` → `yarn db:migrate` for schema changes. See `DATABASE_SETUP.md` for complete database documentation.

## Privacy & Compliance

### Privacy-First Design

React Analytics is built with privacy at its core:

- **Self-Hosted** - Your data stays on your infrastructure, never shared with third parties
- **Open Source** - Fully auditable code, no hidden tracking
- **Data Ownership** - Complete control over your analytics data
- **GDPR-Friendly** - Designed to support compliance when properly configured
- **No External Dependencies** - All data processing happens on your servers

### GDPR Considerations

⚠️ **Important**: This library is designed to be GDPR-friendly when self-hosted, but **you are responsible for ensuring compliance** with applicable data protection laws.

**If you collect user identities** (name, email) using the `identify()` method, you **MUST**:

- ✅ Obtain explicit user consent before tracking
- ✅ Implement data access and deletion mechanisms
- ✅ Maintain a data retention policy
- ✅ Provide clear privacy notices to users
- ✅ Honor user rights (access, deletion, portability)

**Documentation:**

- [PRIVACY.md](./PRIVACY.md) - Technical privacy features and data collection details
- [GDPR.md](./GDPR.md) - GDPR compliance implementation guide with code examples
- [DISCLAIMER.md](./DISCLAIMER.md) - Legal disclaimer and responsibilities
- [LICENSE](./LICENSE) - MIT License with data protection notice

### Privacy vs SaaS Analytics

| Feature                | React Analytics | Google Analytics | Mixpanel |
| ---------------------- | --------------- | ---------------- | -------- |
| Self-Hosted            | ✅ Yes          | ❌ No            | ❌ No    |
| Open Source            | ✅ Yes          | ❌ No            | ❌ No    |
| Full Data Ownership    | ✅ Yes          | ❌ No            | ❌ No    |
| No Third-Party Sharing | ✅ Yes          | ❌ No            | ❌ No    |
| Your Infrastructure    | ✅ Yes          | ❌ No            | ❌ No    |

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **PostgreSQL** - Primary database (via Docker locally, Neon in production)
- **Drizzle ORM** - Type-safe database queries with migrations
- **NextAuth v5** - Authentication (Google, GitHub, Apple)
- **Elysia** - Backend API framework with type safety
- **Stripe** - Payment processing
- **Tailwind CSS 4** - Styling
- **TypeScript 5** - Full type safety
- **Vitest** - Testing framework (analytics package)

## Analytics Package

This monorepo includes the `@jvidalv/react-analytics` package in `packages/analytics`. This is the open source npm package that enables analytics tracking in React applications.

### Features

- **Universal** - Works with React, React Native, Expo, and Next.js
- **Auto-detection** - Automatically detects routing framework
- **Event Batching** - Efficient 5-second batching with configurable intervals
- **Storage Adapters** - localStorage (web), AsyncStorage (React Native)
- **Device Detection** - Platform, OS, browser, device info
- **TypeScript** - Full type safety

### Building the Package

```bash
cd packages/analytics

# Build CJS + ESM bundles
yarn build

# Run tests
yarn test

# Watch mode
yarn test:watch

# Publish to npm
npm publish
```

## Environment Variables

Create a `.env.local` file in the root directory. You can copy `.env.example` as a starting point:

```bash
cp .env.example .env.local
```

### Required Variables

```env
# Database (local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/postgres
AUTH_DRIZZLE_URL=postgresql://postgres:postgres@localhost:5434/postgres

# Authentication
AUTH_SECRET=your-secret-key-here  # Generate: openssl rand -base64 32

# Cron (for materialized view refresh)
CRON_SECRET=your-cron-secret  # Only needed in production
```

### OAuth Providers

Configure at least one OAuth provider for authentication:

```env
# Google OAuth (https://console.cloud.google.com)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# GitHub OAuth (https://github.com/settings/developers)
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Apple OAuth (optional)
AUTH_APPLE_ID=your-apple-id
AUTH_APPLE_SECRET=your-apple-secret
```

### Optional Variables

```env
# Stripe (only if using payment features)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_KEY=whsec_...

# AWS S3 (only if using file uploads)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=...
S3_BUCKET_URL=...

# OpenAI (only if using AI features)
OPENAI_API_KEY=sk-...

# Resend (only if using transactional emails)
RESEND_API_KEY=re_...
```

## Project Structure

```
react-analytics/
├── packages/analytics/          # @jvidalv/react-analytics NPM package
│   ├── src/                     # Universal analytics library
│   ├── test/                    # Vitest tests
│   └── dist/                    # Build output (CJS + ESM)
├── src/                         # Next.js application
│   ├── app/                     # App Router pages
│   ├── api/                     # Elysia API routes
│   ├── domains/                 # Business logic
│   ├── db/                      # Database (schema, migrations)
│   └── components/              # UI components
├── drizzle/                     # Database migrations
│   ├── 0000_*.sql               # Migration files
│   ├── meta/                    # Migration metadata
│   └── seed-data/               # Anonymized analytics (288k+ events)
├── scripts/                     # Utility scripts
│   ├── seed-analytics.ts        # Load seed data
│   ├── reset-database.ts        # Reset database
│   └── watch-crons.ts           # Cron watcher for dev
└── CLAUDE.md                    # AI reference guide
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive AI reference guide
- **[AGENTS.md](./AGENTS.md)** - AI agent documentation hub
- **[BUGBOT.md](./BUGBOT.md)** - Debugging & troubleshooting guide
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup and seed data guide

## Development Workflow

### Making Schema Changes

**Always use migrations** for database schema changes:

```bash
# 1. Edit src/db/schema.ts
export const myTable = pgTable("my_table", {
  id: uuid().primaryKey().defaultRandom(),
  name: text("name").notNull(),
});

# 2. Generate migration
yarn db:generate

# 3. Review generated SQL
cat drizzle/XXXX_*.sql

# 4. Edit if needed (e.g., for materialized views)
# Replace CREATE TABLE with CREATE MATERIALIZED VIEW if needed

# 5. Apply migration
yarn db:migrate

# 6. Commit both files
git add src/db/schema.ts drizzle/
git commit -m "feat: add my_table"
```

### Materialized Views

The project uses materialized views for optimized analytics queries:

- `analytics_identified_users_mv` - Production identified users
- `analytics_test_identified_users_mv` - Test identified users

These are refreshed every minute by a cron job. In development:

```bash
# Cron runs automatically with yarn dev
# Manual refresh:
yarn cron:refresh-views
```

## Testing

### Analytics Package Tests

```bash
cd packages/analytics
yarn test              # Run tests
yarn test:watch        # Watch mode
yarn test:coverage     # Coverage report
```

### Integration Testing

The project includes 288k+ anonymized analytics events for testing:

```bash
# 1. Create an app in the dashboard
# 2. Copy the API keys
# 3. Load seed data
yarn db:add-data <prod-api-key> <test-api-key>
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables (see Environment Variables above)
3. Migrations run automatically via `vercel-build` script
4. Set up cron job for materialized view refresh:
   - Path: `/api/cron/refresh-views`
   - Schedule: `* * * * *` (every minute)
   - Set `CRON_SECRET` environment variable

### Self-Hosting

1. Build application: `yarn build`
2. Run migrations: `yarn db:migrate`
3. Start server: `yarn start`
4. Set up cron job for view refresh (use `scripts/run-cron.ts`)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Use semantic commit messages (`feat:`, `fix:`, `docs:`, etc.)
2. Always use migrations for database changes
3. Run tests before submitting PR
4. Follow TypeScript and ESLint conventions
5. Update documentation when adding features

See `CLAUDE.md` for detailed development guidelines.

## License

MIT License - feel free to use this project for personal or commercial purposes.
