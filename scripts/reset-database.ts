#!/usr/bin/env tsx

/**
 * Reset Database
 *
 * Drops all tables and views, then runs migrations from scratch
 * WARNING: This will delete ALL data in the database!
 */

import postgres from "postgres";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

async function resetDatabase() {
  console.log("⚠️  WARNING: This will DELETE ALL DATA in the database!");
  console.log("   Database:", databaseUrl?.split("@")[1] || "unknown");
  console.log("\n🗑️  Dropping all tables and views...\n");

  // TypeScript: databaseUrl is guaranteed to be defined due to exit above
  const sql = postgres(databaseUrl!, { max: 1 });

  try {
    // Drop materialized views first (they depend on tables) - ignore errors if they're tables
    console.log("   Dropping materialized views (or tables)...");
    try {
      await sql`DROP MATERIALIZED VIEW IF EXISTS analytics_identified_users_mv CASCADE`;
    } catch (_e) {
      await sql`DROP TABLE IF EXISTS analytics_identified_users_mv CASCADE`;
    }
    try {
      await sql`DROP MATERIALIZED VIEW IF EXISTS analytics_test_identified_users_mv CASCADE`;
    } catch (_e) {
      await sql`DROP TABLE IF EXISTS analytics_test_identified_users_mv CASCADE`;
    }

    // Drop all tables
    console.log("   Dropping tables...");
    await sql`DROP TABLE IF EXISTS account CASCADE`;
    await sql`DROP TABLE IF EXISTS session CASCADE`;
    await sql`DROP TABLE IF EXISTS analytics CASCADE`;
    await sql`DROP TABLE IF EXISTS analytics_test CASCADE`;
    await sql`DROP TABLE IF EXISTS analytics_api_keys CASCADE`;
    await sql`DROP TABLE IF EXISTS apps CASCADE`;
    await sql`DROP TABLE IF EXISTS ai_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS "user" CASCADE`;

    console.log("   ✅ All tables and views dropped\n");

    // Run migrations
    console.log("🚀 Running migrations...\n");

    const db = drizzle(sql, { casing: "snake_case" });
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Migrations completed successfully\n");
    console.log("📊 Database reset complete!");
    console.log("\n💡 Next steps:");
    console.log("   1. Create a new app and get API keys");
    console.log("   2. Run: yarn db:add-data <api-key> <api-key-test>");
  } catch (error) {
    console.error("\n❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

resetDatabase();
