import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

// User schema
const NewJoinerSchema = t.Object({
  identifyId: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  name: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  avatar: t.Union([t.String(), t.Null()]),
  isIdentified: t.Boolean(),
  firstSeen: t.String(), // ISO date string
  platform: t.String(),
});

const NewJoinersResponseSchema = t.Object({
  today: t.Array(NewJoinerSchema),
  lastWeek: t.Array(NewJoinerSchema),
  lastMonth: t.Array(NewJoinerSchema),
});

export const newJoinersRoute = new Elysia().get(
  "/new-joiners",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Calculate date thresholds
    const now = Date.now();
    const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Helper function to get new joiners for a time period
    const getNewJoinersForPeriod = async (
      startDate: Date,
      endDate?: Date,
    ) => {
      const endCondition = endDate
        ? sql`AND first_seen < ${endDate.toISOString()}`
        : sql``;

      const result = await db.execute(sql`
        WITH first_events AS (
          SELECT
            identify_id,
            MIN(date) AS first_seen
          FROM ${targetTable}
          WHERE api_key = ${apiKey}
          GROUP BY identify_id
          HAVING MIN(date) >= ${startDate.toISOString()}
            ${endCondition}
          LIMIT 10
        ),
        latest_event AS (
          SELECT DISTINCT ON (t.identify_id)
            t.identify_id,
            t.user_id,
            t.properties->'data'->>'name' AS name,
            t.properties->'data'->>'email' AS email,
            t.properties->'data'->>'avatar' AS avatar,
            t.user_id IS NOT NULL AS is_identified,
            fe.first_seen,
            CASE
              WHEN t.info->>'platform' = 'ios' THEN 'iOS'
              WHEN t.info->>'platform' = 'android' THEN 'Android'
              WHEN t.info->>'platform' = 'web' AND (
                t.info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
                t.info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
              ) THEN 'iOS'
              WHEN t.info->>'platform' = 'web' AND
                t.info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'Android'
              ELSE 'Web'
            END AS platform
          FROM ${targetTable} t
          INNER JOIN first_events fe ON t.identify_id = fe.identify_id
          WHERE t.api_key = ${apiKey}
          ORDER BY t.identify_id, t.date DESC
        )
        SELECT * FROM latest_event
        ORDER BY first_seen DESC
      `);

      return result.rows.map((row: any) => ({
        identifyId: row.identify_id,
        userId: row.user_id,
        name: row.name,
        email: row.email,
        avatar: row.avatar,
        isIdentified: row.is_identified,
        firstSeen: new Date(row.first_seen).toISOString(),
        platform: row.platform || "Web",
      }));
    };

    // Fetch users for each time period
    const [today, lastWeek, lastMonth] = await Promise.all([
      getNewJoinersForPeriod(oneDayAgo),
      getNewJoinersForPeriod(sevenDaysAgo, oneDayAgo),
      getNewJoinersForPeriod(thirtyDaysAgo, sevenDaysAgo),
    ]);

    return {
      today,
      lastWeek,
      lastMonth,
    };
  },
  {
    response: NewJoinersResponseSchema,
    detail: {
      summary: "Get new joiners grouped by time period",
      description:
        "Returns up to 10 new users for today, last week, and last month",
      tags: ["Analytics"],
    },
  },
);
