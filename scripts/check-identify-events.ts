import { db } from "../src/db/index";
import { sql } from "drizzle-orm";

async function checkData() {
  console.log("=== Checking for identify events ===\n");

  const identifyEvents = await db.execute(sql`
    SELECT
      identify_id,
      user_id,
      type,
      properties
    FROM analytics
    WHERE user_id IS NOT NULL AND type = 'identify'
    LIMIT 5
  `);

  console.log("Identify Event Samples:");
  for (const row of identifyEvents) {
    console.log("\n---");
    console.log("identify_id:", row.identify_id);
    console.log("user_id:", row.user_id);
    console.log("type:", row.type);
    console.log("properties:", JSON.stringify(row.properties, null, 2));
  }

  process.exit(0);
}

checkData().catch(console.error);
