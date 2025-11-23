#!/usr/bin/env tsx

/**
 * Prepare Seed Data
 *
 * Replaces actual API keys with placeholder for later injection
 */

import { readFileSync, writeFileSync } from "fs";

function prepareFile(
  inputFile: string,
  outputFile: string,
  tableName: string,
  knownApiKey: string,
) {
  console.log(`\n📝 Processing ${inputFile}...`);

  const content = readFileSync(inputFile, "utf-8");

  console.log(`   Using API key: ${knownApiKey}`);

  // Replace with placeholder based on table name
  const placeholder =
    tableName === "analytics" ? "{{API_KEY}}" : "{{API_KEY_TEST}}";
  const withPlaceholder = content.replace(
    new RegExp(`'${knownApiKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`, "g"),
    `'${placeholder}'`,
  );

  writeFileSync(outputFile, withPlaceholder);

  const occurrences = (
    content.match(
      new RegExp(knownApiKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    ) || []
  ).length;
  console.log(`   ✅ Replaced ${occurrences} occurrences with ${placeholder}`);
  console.log(`   ✅ Saved to ${outputFile}`);
}

function main() {
  console.log("🔧 Preparing seed data with placeholders...\n");

  prepareFile(
    "/tmp/analytics-dump/analytics_anonymized.sql",
    "/Users/jvidal/code/expofast/web/drizzle/seed-data/analytics.sql",
    "analytics",
    "prod-test-019a8c932ff87e5d888f7e434200dc33",
  );

  prepareFile(
    "/tmp/analytics-dump/analytics_test_anonymized.sql",
    "/Users/jvidal/code/expofast/web/drizzle/seed-data/analytics_test.sql",
    "analytics_test",
    "d7b9a944-10a1-4ea8-8fac-3b0c53a324dd",
  );

  console.log("\n✅ Seed data prepared!");
  console.log("   Files saved to drizzle/seed-data/");
}

main();
