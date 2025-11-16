import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

// Response schema
const PlatformAggregatesResponseSchema = t.Object({
  ios: t.Number(),
  android: t.Number(),
  web: t.Number(),
});

export const platformAggregatesRoute = new Elysia().get(
  "/platform-aggregates",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Query platform aggregates with OS-based grouping
    // iOS includes: native iOS + web on iPhone/iPad
    // Android includes: native Android + web on Android devices
    // Web includes: desktop and other web traffic
    const result = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE platform = 'ios') AS ios,
        COUNT(*) FILTER (WHERE platform = 'android') AS android,
        COUNT(*) FILTER (WHERE platform = 'web') AS web
      FROM (
        SELECT DISTINCT ON (identify_id)
          identify_id,
          CASE
            WHEN info->>'platform' = 'ios' THEN 'ios'
            WHEN info->>'platform' = 'android' THEN 'android'
            WHEN info->>'platform' = 'web' AND (
              info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
              info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
            ) THEN 'ios'
            WHEN info->>'platform' = 'web' AND
              info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'android'
            ELSE 'web'
          END AS platform
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
        ORDER BY identify_id, date DESC
      ) sub
    `);

    const row = result[0] as any;

    return {
      ios: Number(row?.ios || 0),
      android: Number(row?.android || 0),
      web: Number(row?.web || 0),
    };
  },
  {
    // response: PlatformAggregatesResponseSchema,
    detail: {
      summary: "Get platform distribution of users",
      description:
        "Returns unique users grouped by platform (iOS, Android, Web). iOS/Android counts include both native apps and mobile web users.",
      tags: ["Analytics"],
    },
  },
);
