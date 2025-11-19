# Database Setup Guide

This project uses a clean, single-migration database setup with anonymized seed data.

## Structure

```
drizzle/
├── 0000_vengeful_dormammu.sql     # Single migration with all schema
├── meta/
│   └── _journal.json               # Migration journal
└── seed-data/
    ├── analytics.sql               # Anonymized analytics data (288k+ records)
    └── analytics_test.sql          # Anonymized test data
```

## Key Features

- **Single Migration**: All schema in one clean migration file
- **Materialized Views**: Pre-computed views for identified users with indexes
- **Anonymized Data**: All real emails replaced with `user1@example.com`, `user2@example.com`, etc.
- **API Key Placeholders**: Seed data uses `{{API_KEY}}` and `{{API_KEY_TEST}}` placeholders

## Available Commands

### `yarn db:reset`
Drops all tables and views, then runs migrations from scratch.
**WARNING**: Deletes ALL data!

```bash
yarn db:reset
```

### `yarn db:add-data <api-key> <api-key-test>`
Injects anonymized analytics data associated with your API keys.

```bash
# Example:
yarn db:add-data prod-abc123 test-abc123
```

**Requirements**:
- API keys must exist in `analytics_api_keys` table
- Creates an app first through the UI, then use those API keys

### `yarn db:generate`
Generates a new migration from schema changes.

```bash
yarn db:generate
```

### `yarn db:migrate`
Runs pending migrations.

```bash
yarn db:migrate
```

## Workflow for Fresh Start

1. **Reset database** (drops everything):
   ```bash
   yarn db:reset
   ```

2. **Start the app**:
   ```bash
   yarn dev
   ```

3. **Create account and app** through the UI:
   - Sign up / Sign in
   - Create a new app
   - Copy the API keys from the dashboard

4. **Add seed data** (optional):
   ```bash
   yarn db:add-data <your-prod-api-key> <your-test-api-key>
   ```

5. **View analytics**: Dashboard will now show 288k+ anonymized events with materialized views

## Materialized Views

The migration creates two materialized views:

- `analytics_identified_users_mv` - Production identified users
- `analytics_test_identified_users_mv` - Test identified users

These views are automatically refreshed every minute by the cron job (`yarn cron:watch`).

Manual refresh:
```bash
yarn cron:refresh-views
```

## Schema Source of Truth

All schema is defined in `src/db/schema.ts`. When you make changes:

1. Edit `src/db/schema.ts`
2. Run `yarn db:generate` to create migration
3. Edit generated migration if needed (e.g., for materialized views)
4. Run `yarn db:migrate` to apply changes

## Seed Data

Seed data was created from actual production data with:
- **1,123 unique emails** anonymized to `user1@example.com` format
- **288,762 analytics events** from production
- **6 analytics_test events** for testing

The data maintains referential integrity and realistic patterns while protecting privacy.
