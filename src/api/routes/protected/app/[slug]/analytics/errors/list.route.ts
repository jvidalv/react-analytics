import { Elysia } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getErrorStatusTable,
  getIdentifiedUsersMv,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";
import { ListErrorsQuerySchema } from "@/api/schemas/error.schema";

export const errorsListRoute = new Elysia().get(
  "/list",
  async ({ store, query }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);

    // Get query parameters
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "25", 10);
    const status = query.status || "";
    const offset = (page - 1) * limit;

    // Get correct tables
    const analyticsTable = getAnalyticsTable(isTest);
    const errorsTable = getErrorStatusTable(isTest);
    const identifiedUsersMv = getIdentifiedUsersMv(isTest);

    // Build status condition
    const statusCondition = status ? sql`AND e.status = ${status}` : sql``;

    // Get total count
    const countResult = await db.execute(
      sql`
        SELECT COUNT(*) as total
        FROM ${errorsTable} e
        WHERE e.api_key = ${apiKey}
        ${statusCondition}
      `,
    );

    const total = Number((countResult[0] as any)?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Get errors with analytics data and user info
    const errorsResult = await db.execute(
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
        WHERE e.api_key = ${apiKey}
        ${statusCondition}
        ORDER BY a.date DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
    );

    const errors = (errorsResult as any[]).map((row) => ({
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
    }));

    return {
      errors,
      pagination: { page, limit, total, totalPages },
    };
  },
  {
    query: ListErrorsQuerySchema,
    detail: {
      summary: "Get paginated list of errors",
      description:
        "Returns a paginated list of application errors with optional status filtering",
      tags: ["Analytics"],
    },
  },
);
