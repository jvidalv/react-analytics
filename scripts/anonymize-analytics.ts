#!/usr/bin/env tsx

/**
 * Anonymize Analytics Data
 *
 * Replaces all real email addresses with fake ones while maintaining consistency
 */

import { readFileSync, writeFileSync } from "fs";

const emailMap = new Map<string, string>();
let emailCounter = 1;

function anonymizeEmail(email: string): string {
  if (emailMap.has(email)) {
    return emailMap.get(email)!;
  }

  const fakeEmail = `user${emailCounter}@example.com`;
  emailMap.set(email, fakeEmail);
  emailCounter++;
  return fakeEmail;
}

function anonymizeContent(content: string): string {
  // Match email patterns in JSON strings
  // Pattern: "email":"actual@email.com" or \"email\":\"actual@email.com\"
  const emailPattern = /(["\\]email["\\]:\s*["\\])([^"\\]+@[^"\\]+)(["\\])/g;

  return content.replace(emailPattern, (match, prefix, email, suffix) => {
    const anonymized = anonymizeEmail(email);
    return `${prefix}${anonymized}${suffix}`;
  });
}

function processFile(inputFile: string, outputFile: string) {
  console.log(`\n📝 Processing ${inputFile}...`);

  const content = readFileSync(inputFile, "utf-8");
  const lines = content.split("\n");

  console.log(`   Found ${lines.length} lines`);

  const anonymizedLines = lines.map((line) => anonymizeContent(line));
  const anonymizedContent = anonymizedLines.join("\n");

  writeFileSync(outputFile, anonymizedContent);

  console.log(`   ✅ Anonymized ${emailMap.size} unique emails`);
  console.log(`   ✅ Saved to ${outputFile}`);
}

function main() {
  console.log("🔒 Starting email anonymization...\n");

  processFile(
    "/tmp/analytics-dump/analytics.sql",
    "/tmp/analytics-dump/analytics_anonymized.sql",
  );

  console.log(`\n📊 Summary:`);
  console.log(`   Total unique emails anonymized: ${emailMap.size}`);

  processFile(
    "/tmp/analytics-dump/analytics_test.sql",
    "/tmp/analytics-dump/analytics_test_anonymized.sql",
  );

  console.log("\n✅ Anonymization complete!");
}

main();
