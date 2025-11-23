<div align="center">
  <img src="https://github.com/jvidalv/react-analytics/blob/main/public/assets/images/logo.png" alt="React Analytics Logo" width="200" />
  <h1>React Analytics</h1>
  <p>Privacy-first analytics platform for React applications. Track user behavior, monitor errors, and gain insights without compromising privacy.</p>

  [![npm version](https://badge.fury.io/js/@jvidalv%2Freact-analytics.svg)](https://www.npmjs.com/package/@jvidalv/react-analytics)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

  **[🌐 Official Platform: reactanalytics.app](https://reactanalytics.app)**
</div>

## Open Source & Hosted Options

**🚀 Get Started Instantly:** Visit [reactanalytics.app](https://reactanalytics.app) for a fully managed, hosted solution.

**⚙️ Self-Host:** This project is open source and self-hostable. Built with modern web technologies and designed for developers who want full control over their analytics data.

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

📦 **NPM Package:** [`@jvidalv/react-analytics`](https://www.npmjs.com/package/@jvidalv/react-analytics)

This monorepo includes the `@jvidalv/react-analytics` package in `packages/analytics`. This is the open source npm package that enables analytics tracking in React applications.

```bash
# Install the package
npm install @jvidalv/react-analytics
# or
yarn add @jvidalv/react-analytics
```

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

# Authentication
AUTH_SECRET=your-secret-key-here  # Generate: openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OAuth (configure at least one provider)
# GitHub: https://github.com/settings/developers
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Google: https://console.cloud.google.com
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Production Variables

```env
# Cron secret for materialized view refresh
CRON_SECRET=your-cron-secret  # Generate: openssl rand -base64 32

# Base URL (defaults to http://localhost:3000)
BASE_URL=https://your-production-domain.com
```

### Optional Variables

```env
# Email service (Resend)
RESEND_API_KEY=re_...

# AI features (OpenAI)
OPENAI_API_KEY=sk-...

# Payment processing (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET_KEY=whsec_...
PRODUCT_PRO_PLAN_ID=prod_...
PRODUCT_STARTER_PLAN_ID=prod_...
NEXT_PUBLIC_FREE_PLAN=https://...
NEXT_PUBLIC_STARTER_PLAN=https://...
NEXT_PUBLIC_PRO_PLAN=https://...
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
│   └── meta/                    # Migration metadata
├── scripts/                     # Utility scripts
│   ├── reset-database.ts        # Reset database
│   ├── run-cron.ts              # Run cron tasks manually
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
