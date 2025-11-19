import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

// Response schema
const IdentificationAggregatesResponseSchema = t.Object({
  identified: t.Number(),
  anonymous: t.Number(),
  total: t.Number(),
  identificationRate: t.Number(),
  growth: t.Object({
    current: t.Number(),
    previous: t.Number(),
    change: t.Number(),
  }),
});

export const identificationAggregatesRoute = new Elysia().get(
  "/identification-aggregates",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Calculate time periods for growth metrics
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    // Query overall identification stats (all time) with platform breakdown
    // Use subquery to determine if identify_id has ever been identified
    const overallResult = await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE is_identified) AS identified,
        COUNT(*) FILTER (WHERE NOT is_identified) AS anonymous,

        -- iOS breakdown
        COUNT(*) FILTER (WHERE platform = 'ios') AS ios_total,
        COUNT(*) FILTER (WHERE platform = 'ios' AND is_identified) AS ios_identified,
        COUNT(*) FILTER (WHERE platform = 'ios' AND NOT is_identified) AS ios_anonymous,

        -- Android breakdown
        COUNT(*) FILTER (WHERE platform = 'android') AS android_total,
        COUNT(*) FILTER (WHERE platform = 'android' AND is_identified) AS android_identified,
        COUNT(*) FILTER (WHERE platform = 'android' AND NOT is_identified) AS android_anonymous,

        -- Web breakdown
        COUNT(*) FILTER (WHERE platform = 'web') AS web_total,
        COUNT(*) FILTER (WHERE platform = 'web' AND is_identified) AS web_identified,
        COUNT(*) FILTER (WHERE platform = 'web' AND NOT is_identified) AS web_anonymous
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
          END AS platform,
          -- Check if this identify_id has ever had an identify event with user_id
          (
            SELECT COUNT(*) > 0
            FROM ${targetTable} t2
            WHERE t2.api_key = ${apiKey}
              AND t2.identify_id = ${targetTable}.identify_id
              AND t2.type = 'identify'
              AND t2.user_id IS NOT NULL
          ) AS is_identified
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
        ORDER BY identify_id, date DESC
      ) sub
    `);

    const overallRow = overallResult[0] as any;
    const total = Number(overallRow?.total || 0);
    const identified = Number(overallRow?.identified || 0);
    const anonymous = Number(overallRow?.anonymous || 0);
    const identificationRate =
      total > 0 ? Math.round((identified / total) * 1000) / 10 : 0;

    // Query current period (last 30 days)
    const currentResult = await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS identified
      FROM (
        SELECT DISTINCT ON (identify_id)
          identify_id,
          user_id
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
          AND date >= ${thirtyDaysAgo.toISOString()}
        ORDER BY identify_id, date DESC
      ) sub
    `);

    const currentRow = currentResult[0] as any;
    const currentTotal = Number(currentRow?.total || 0);
    const currentIdentified = Number(currentRow?.identified || 0);
    const currentRate =
      currentTotal > 0
        ? Math.round((currentIdentified / currentTotal) * 1000) / 10
        : 0;

    // Query previous period (30-60 days ago)
    const previousResult = await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS identified
      FROM (
        SELECT DISTINCT ON (identify_id)
          identify_id,
          user_id
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
          AND date >= ${sixtyDaysAgo.toISOString()}
          AND date < ${thirtyDaysAgo.toISOString()}
        ORDER BY identify_id, date DESC
      ) sub
    `);

    const previousRow = previousResult[0] as any;
    const previousTotal = Number(previousRow?.total || 0);
    const previousIdentified = Number(previousRow?.identified || 0);
    const previousRate =
      previousTotal > 0
        ? Math.round((previousIdentified / previousTotal) * 1000) / 10
        : 0;

    // Calculate absolute change in identification rate (not percentage of percentage)
    const rateChange =
      previousRate > 0
        ? Math.round((currentRate - previousRate) * 10) / 10
        : 0;

    return {
      identified,
      anonymous,
      total,
      identificationRate,
      platforms: {
        ios: {
          total: Number(overallRow?.ios_total || 0),
          identified: Number(overallRow?.ios_identified || 0),
          anonymous: Number(overallRow?.ios_anonymous || 0),
        },
        android: {
          total: Number(overallRow?.android_total || 0),
          identified: Number(overallRow?.android_identified || 0),
          anonymous: Number(overallRow?.android_anonymous || 0),
        },
        web: {
          total: Number(overallRow?.web_total || 0),
          identified: Number(overallRow?.web_identified || 0),
          anonymous: Number(overallRow?.web_anonymous || 0),
        },
      },
      growth: {
        current: currentRate,
        previous: previousRate,
        change: rateChange,
      },
    };
  },
  {
    // response: IdentificationAggregatesResponseSchema,
    detail: {
      summary: "Get user identification/conversion statistics",
      description:
        "Returns overall and growth metrics for identified vs anonymous users",
      tags: ["Analytics"],
    },
  }
);
