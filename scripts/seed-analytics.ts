#!/usr/bin/env tsx

/**
 * Seed Analytics Data
 *
 * Injects anonymized analytics data associated with a specific API key
 * Usage: yarn db:add-data <api-key-uuid>
 */

import postgres from "postgres";
import { config } from "dotenv";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

const apiKey = process.argv[2];
const apiKeyTest = process.argv[3];

if (!apiKey) {
  console.error("❌ Please provide an API key");
  console.log("\nUsage:");
  console.log("  yarn db:add-data <api-key> <api-key-test>");
  console.log("\nExample:");
  console.log("  yarn db:add-data prod-abc123 test-abc123");
  process.exit(1);
}

if (!apiKeyTest) {
  console.error("❌ Please provide a test API key");
  console.log("\nUsage:");
  console.log("  yarn db:add-data <api-key> <api-key-test>");
  console.log("\nExample:");
  console.log("  yarn db:add-data prod-abc123 test-abc123");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function seedData() {
  console.log("🌱 Seeding analytics data...\n");
  console.log(`   API Key (prod): ${apiKey}`);
  console.log(`   API Key (test): ${apiKeyTest}\n`);

  try {
    // Read seed data files
    const analyticsData = readFileSync(
      "drizzle/seed-data/analytics.sql",
      "utf-8"
    );
    const analyticsTestData = readFileSync(
      "drizzle/seed-data/analytics_test.sql",
      "utf-8"
    );

    // Replace placeholders with actual API keys
    const analyticsWithKey = analyticsData.replace(/{{API_KEY}}/g, apiKey);
    const analyticsTestWithKey = analyticsTestData.replace(
      /{{API_KEY_TEST}}/g,
      apiKeyTest
    );

    // Insert data into analytics table
    console.log("📊 Inserting analytics data...");
    const analyticsStatements = analyticsWithKey
      .split("\n")
      .filter((line) => line.trim().startsWith("INSERT"));

    for (const statement of analyticsStatements) {
      await sql.unsafe(statement);
    }
    console.log(`   ✅ Inserted ${analyticsStatements.length} analytics records`);

    // Insert data into analytics_test table
    console.log("📊 Inserting analytics_test data...");
    const analyticsTestStatements = analyticsTestWithKey
      .split("\n")
      .filter((line) => line.trim().startsWith("INSERT"));

    for (const statement of analyticsTestStatements) {
      await sql.unsafe(statement);
    }
    console.log(
      `   ✅ Inserted ${analyticsTestStatements.length} analytics_test records`
    );

    // Refresh materialized views
    console.log("\n🔄 Refreshing materialized views...");
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_identified_users_mv`;
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_test_identified_users_mv`;
    console.log("   ✅ Materialized views refreshed");

    console.log("\n✅ Data seeding complete!");
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedData();
