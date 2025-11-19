import "dotenv/config";
import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function checkData() {
  console.log("=== Checking analytics table structure ===\n");

  // Query raw data from analytics table
  const analyticsRows = await db.execute(sql`
    SELECT
      identify_id,
      user_id,
      properties
    FROM analytics
    WHERE user_id IS NOT NULL
    LIMIT 3
  `);

  console.log("Sample Analytics Rows:");
  for (const row of analyticsRows) {
    console.log("\n---");
    console.log("identify_id:", row.identify_id);
    console.log("user_id:", row.user_id);
    console.log("properties:", JSON.stringify(row.properties, null, 2));
  }

  console.log("\n\n=== Checking materialized view ===\n");

  // Check materialized view
  const mvRows = await db.execute(sql`
    SELECT
      identify_id,
      user_id,
      name,
      email,
      avatar
    FROM analytics_identified_users_mv
    LIMIT 5
  `);

  console.log("Materialized View Rows:");
  for (const row of mvRows) {
    console.log("\n---");
    console.log("identify_id:", row.identify_id);
    console.log("user_id:", row.user_id);
    console.log("name:", row.name);
    console.log("email:", row.email);
    console.log("avatar:", row.avatar);
  }

  process.exit(0);
}

checkData().catch(console.error);
