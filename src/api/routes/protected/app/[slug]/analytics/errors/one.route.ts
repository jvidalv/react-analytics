import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getErrorStatusTable,
  getIdentifiedUsersMv,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";

export const errorsOneRoute = new Elysia().get(
  "/:errorId",
  async ({ store, params, set }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);
    const { errorId } = params;

    const analyticsTable = getAnalyticsTable(isTest);
    const errorsTable = getErrorStatusTable(isTest);
    const identifiedUsersMv = getIdentifiedUsersMv(isTest);

    const result = await db.execute(
      sql`
        SELECT
          e.id,
          e.analytics_id,
          e.status,
          e.notes,
          e.created_at,
          a.identify_id,
          a.user_id,
          a.properties->>'message' as message,
          a.properties->'data'->>'name' as name,
          a.properties->'data'->>'stack' as stack,
          a.properties->'data'->>'componentStack' as component_stack,
          a.properties->'data'->>'route' as route,
          a.properties->'data'->>'source' as source,
          a.app_version,
          a.date,
          a.info->'requestMetadata'->>'country' as country,
          CASE
            WHEN a.info->>'platform' = 'ios' THEN 'iOS'
            WHEN a.info->>'platform' = 'android' THEN 'Android'
            ELSE 'Web'
          END as platform,
          u.name as user_name,
          u.email as user_email,
          u.avatar as user_avatar
        FROM ${errorsTable} e
        JOIN ${analyticsTable} a ON e.analytics_id = a.id
        LEFT JOIN ${identifiedUsersMv} u ON a.identify_id = u.identify_id AND u.api_key = ${apiKey}
        WHERE e.id = ${errorId} AND e.api_key = ${apiKey}
        LIMIT 1
      `,
    );

    if (result.length === 0) {
      set.status = 404;
      return { success: false, errorMessage: "Error not found" };
    }

    const row = result[0] as any;
    const error = {
      id: row.id,
      analyticsId: row.analytics_id,
      message: row.message,
      name: row.name,
      stack: row.stack,
      componentStack: row.component_stack,
      route: row.route,
      source: row.source,
      status: row.status,
      notes: row.notes,
      platform: row.platform,
      country: row.country,
      appVersion: row.app_version,
      identifyId: row.identify_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userAvatar: row.user_avatar,
      date: new Date(row.date).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
    };

    return { success: true, error };
  },
  {
    params: t.Object({
      slug: t.String(),
      errorId: t.String(),
    }),
    detail: {
      summary: "Get single error by ID",
      description: "Returns a single error with all details",
      tags: ["Analytics"],
    },
  },
);
