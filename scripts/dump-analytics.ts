#!/usr/bin/env tsx

/**
 * Dump Analytics Data
 *
 * Exports analytics and analytics_test data to SQL files
 */

import postgres from "postgres";
import { config } from "dotenv";
import { writeFileSync, mkdirSync } from "fs";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not defined");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function dumpTable(tableName: string, outputFile: string) {
  console.log(`\n📦 Dumping ${tableName}...`);

  try {
    const rows = await sql`SELECT * FROM ${sql(tableName)}`;

    console.log(`   Found ${rows.length} rows`);

    if (rows.length === 0) {
      console.log(`   ⚠️  No data to dump`);
      return;
    }

    // Generate INSERT statements
    const columns = Object.keys(rows[0]);
    const inserts: string[] = [];

    for (const row of rows) {
      const values = columns.map((col) => {
        const val = row[col];
        if (val === null) return "NULL";
        if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
        if (typeof val === "boolean") return val ? "true" : "false";
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (typeof val === "object")
          return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
        return val;
      });

      inserts.push(
        `INSERT INTO ${tableName} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`,
      );
    }

    writeFileSync(outputFile, inserts.join("\n") + "\n");
    console.log(`   ✅ Saved to ${outputFile}`);
  } catch (error) {
    console.error(`   ❌ Error dumping ${tableName}:`, error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting analytics data dump...\n");

  // Create output directory
  mkdirSync("/tmp/analytics-dump", { recursive: true });

  await dumpTable("analytics", "/tmp/analytics-dump/analytics.sql");
  await dumpTable("analytics_test", "/tmp/analytics-dump/analytics_test.sql");

  console.log("\n✅ Dump complete!");
  console.log("   Files saved to /tmp/analytics-dump/");

  await sql.end();
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
