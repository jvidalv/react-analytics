import { Elysia } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";

export const countryAggregatesRoute = new Elysia().get(
  "/country-aggregates",
  async ({ store }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Query country aggregates using raw SQL
    // Uses DISTINCT ON to get most recent event per unique user
    const result = await db.execute(sql`
      SELECT info->'requestMetadata'->>'country' AS value, COUNT(*) AS count
      FROM (
        SELECT DISTINCT ON (identify_id) identify_id, info
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
        ORDER BY identify_id, date DESC
      ) sub
      GROUP BY value
      ORDER BY count DESC
    `);

    return { data: result };
  },
  {
    // response: CountryAggregatesResponseSchema,
    detail: {
      summary: "Get country distribution of users",
      description:
        "Returns unique users grouped by country code, ordered by count descending",
      tags: ["Analytics"],
    },
  },
);
