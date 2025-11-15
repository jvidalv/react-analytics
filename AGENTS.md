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
2. Use Drizzle ORM for database queries
   - **Note**: Drizzle has a native `count()` function. Use it instead of `.select({ count: sql<number>`count(*)` })`
3. Validate inputs (see BUGBOT.md security section)
4. Add proper error handling
5. Include relevant tests

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
