# AI Agent Documentation Hub

Welcome to the React Analytics platform AI agent documentation. This hub provides guidance for AI assistants working on this codebase.

## Quick Reference

This repository contains two comprehensive documentation files for AI agents:

### 📘 [CLAUDE.md](./CLAUDE.md) - Comprehensive Reference Guide
**Use this when you need to:**
- Understand the overall project architecture
- Learn about the technology stack
- Find directory structure and code organization
- Understand database schema and API routes
- Learn development workflow and commands
- Review code patterns and conventions
- Get started with development setup

**Best for:**
- ✅ Understanding "how things work"
- ✅ Learning the codebase structure
- ✅ Finding where code lives
- ✅ Development setup and configuration
- ✅ Code contribution guidelines

---

### 🐛 [BUGBOT.md](./BUGBOT.md) - Debugging & Troubleshooting Guide
**Use this when you need to:**
- Debug issues with analytics events
- Troubleshoot database connection problems
- Fix authentication issues
- Resolve build errors
- Optimize query performance
- Understand error messages
- Test and verify functionality

**Best for:**
- ✅ Fixing bugs and errors
- ✅ Troubleshooting deployment issues
- ✅ Performance optimization
- ✅ Security concerns
- ✅ Integration testing

---

## Documentation Structure

```
.
├── AGENTS.md        # This file - Documentation hub
├── CLAUDE.md        # Comprehensive reference guide
└── BUGBOT.md        # Debugging & troubleshooting guide
```

## Project Overview

**React Analytics** is a platform for tracking, viewing, and querying analytics data from React applications.

### Key Components

1. **Analytics Package** (`@jvidalv/react-analytics`)
   - Location: `/packages/analytics`
   - NPM package for universal React analytics
   - Supports: Web, React Native, Expo, Next.js
   - Features: Auto-routing detection, event batching, storage adapters

2. **Analytics Dashboard** (Next.js App)
   - Location: `/src`
   - Web platform for viewing and querying analytics
   - Multi-app support
   - Real-time user analytics

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth v5
- **Payments**: Stripe
- **Styling**: Tailwind CSS + Shadcn/ui

## Quick Start for AI Agents

### When You First Encounter This Codebase

1. **Read CLAUDE.md first** - Get familiar with:
   - Project vision and goals
   - Monorepo structure
   - Technology stack
   - Directory layout

2. **Bookmark BUGBOT.md** - For when you need to:
   - Debug issues
   - Troubleshoot errors
   - Optimize performance
   - Verify functionality

### Common Workflows

#### Contributing New Features
1. Read relevant sections in CLAUDE.md
2. Understand directory structure
3. Follow code patterns
4. Test using BUGBOT.md testing strategies

#### Fixing Bugs
1. Identify issue type
2. Check BUGBOT.md for common issues
3. Use debugging queries
4. Verify fix with testing checklist

#### Optimizing Performance
1. Check BUGBOT.md performance section
2. Use database query tools
3. Monitor API response times
4. Apply optimization strategies

## Frequently Needed Information

### Environment Setup
```bash
# See CLAUDE.md → Development Workflow
cp .env.example .env.local
yarn install
yarn db
yarn db:push
yarn dev
```

### Common Commands
```bash
yarn dev          # Start development server
yarn build        # Production build
yarn db           # Start local PostgreSQL
yarn db:push      # Push database schema
yarn test         # Run tests (in analytics package)
```

### Important Paths
```
/packages/analytics      # Analytics library
/src/app/api/analytics   # Analytics API routes
/src/app/app/s/[slug]    # App-specific pages
/src/domains             # Business logic
/src/db/schema.ts        # Database schema
```

### Debug Quick Links
- Analytics not showing: BUGBOT.md → Section 1
- Database errors: BUGBOT.md → Section 3
- Auth issues: BUGBOT.md → Section 6
- Build failures: BUGBOT.md → Section 5

## Best Practices for AI Agents

### When Reading Code
1. Understand the context (analytics platform)
2. Check CLAUDE.md for architecture patterns
3. Look for existing similar code
4. Follow established conventions

### When Writing Code
1. Follow TypeScript patterns from CLAUDE.md
2. **ALWAYS use Drizzle ORM query builder syntax** - Never use raw SQL
   - Use `.select()`, `.from()`, `.where()`, etc. instead of `db.execute(sql`...`)`
   - Drizzle provides type-safe query building with full TypeScript support
   - **Exception**: Only use raw SQL for complex queries Drizzle cannot express (document why)

   **DO ✅:**
   ```typescript
   // Use Drizzle query builder with countDistinct
   const [row] = await db
     .select({ count: countDistinct(table.identifyId) })
     .from(table)
     .where(eq(table.apiKey, apiKey));
   ```

   **DON'T ❌:**
   ```typescript
   // Never use raw SQL with table interpolation
   const table = getAnalyticsTable(isTest);
   await db.execute(sql`SELECT COUNT(*) FROM ${table} WHERE ...`);

   // Never use .distinct() on count() - it doesn't exist
   .select({ count: count(table.id).distinct() }) // ❌ Error!
   ```

   **Note**: Drizzle has native functions like `countDistinct()`, `count()`, `sum()`, `avg()`, etc. Always prefer these over raw SQL.

   **Date/Time Operations:**
   - **NEVER use `sql` template literals for date intervals**
   - **ALWAYS use JavaScript Date calculations** for date arithmetic

   **DO ✅:**
   ```typescript
   // Calculate dates in JavaScript
   const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

   // Use with standard Drizzle operators
   gte(table.date, thirtyDaysAgo)
   ```

   **DON'T ❌:**
   ```typescript
   // Never use sql template for date intervals
   gte(table.date, sql`NOW() - INTERVAL '30 days'`) // ❌ Not type-safe!
   ```

   **Why:** JavaScript Date calculations are type-safe, database-agnostic, more testable, and consistent with codebase patterns.

3. **ALWAYS use db:generate + db:migrate for database schema changes**
   - **NEVER use `yarn db:push`** - It's deprecated and bypasses migration tracking
   - ALWAYS generate migrations for schema changes
   - ALWAYS review generated SQL before applying
   - ALWAYS commit schema.ts and migration files together

   **DO ✅:**
   ```bash
   # 1. Modify schema in src/db/schema.ts
   export const users = pgTable("user", {
     // ... existing columns
     newColumn: text("new_column"),
   });

   # 2. Generate migration
   yarn db:generate

   # 3. Review the SQL
   cat drizzle/0001_*.sql

   # 4. Apply migration locally
   yarn db:migrate

   # 5. Commit both files
   git add src/db/schema.ts drizzle/
   git commit -m "feat: add new column to users"
   ```

   **DON'T ❌:**
   ```bash
   # Never use db:push (deprecated)
   yarn db:push  # ❌

   # Never commit schema without migration files
   git add src/db/schema.ts  # ❌ Missing drizzle/ folder
   git commit -m "update schema"

   # Never modify applied migrations
   vim drizzle/0000_*.sql  # ❌ Create new migration instead
   ```

   **Why:** Migrations provide version control for database schema, enable safe deployments, allow rollback capabilities, and maintain schema history. See CLAUDE.md → Database Schema Changes & Migrations for full details.

4. **NEVER manually cast API responses when using Eden Treaty**
   - Eden Treaty provides automatic end-to-end type safety
   - Backend schemas in `@/api/schemas/*.schema.ts` are the source of truth
   - Use `Static<typeof Schema>` to derive TypeScript types from Elysia schemas

   **DO ✅:**
   ```typescript
   // Backend schema exports type
   export const AppSchema = t.Object({ /* ... */ });
   export type App = Static<typeof AppSchema>;

   // Frontend API - NO casting needed
   const { data, error } = await fetcherProtected.app({ slug }).get();
   return data.message; // ✅ Automatically typed
   ```

   **DON'T ❌:**
   ```typescript
   // Never manually cast responses
   return data.message as App; // ❌
   return data.message as User[]; // ❌

   // Never create duplicate frontend types
   export type App = { id: string; name: string }; // ❌
   ```

   **See CLAUDE.md → Eden Treaty Type Inference for full details**

5. **ALWAYS run `npx tsc --noEmit` before marking tasks complete**
   - Validates TypeScript type safety
   - Catches errors early before build/deploy
   - Ensures code quality and prevents runtime errors
   - **This is critical** - TypeScript errors must be fixed before completion

6. Validate inputs (see BUGBOT.md security section)
7. Add proper error handling
8. Include relevant tests

### When Debugging
1. Check BUGBOT.md common issues first
2. Use provided SQL queries for diagnostics
3. Follow debugging workflows
4. Verify fixes with testing checklist

## Getting Help

### Documentation Hierarchy
```
General Question
    └─► AGENTS.md (this file)
        │
        ├─► "How does X work?"
        │   └─► CLAUDE.md
        │
        └─► "Why isn't X working?"
            └─► BUGBOT.md
```

### When Documentation Doesn't Help
1. Search codebase for similar patterns
2. Check git history for context
3. Review test files for usage examples
4. Look at API route implementations

## Document Maintenance

These documents should be updated when:
- ✅ Major architecture changes occur
- ✅ New features are added
- ✅ Common issues are discovered
- ✅ Dependencies are upgraded
- ✅ Best practices evolve

Last updated: November 2025

---

**Quick Links:**
- 📘 [CLAUDE.md - Comprehensive Reference](./CLAUDE.md)
- 🐛 [BUGBOT.md - Debugging Guide](./BUGBOT.md)
- 📦 [Analytics Package README](./packages/analytics/README.md)
