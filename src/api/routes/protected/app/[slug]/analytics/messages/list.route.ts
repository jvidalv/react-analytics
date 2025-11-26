import { Elysia } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getMessageStatusTable,
  getIdentifiedUsersMv,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";
import { ListMessagesQuerySchema } from "@/api/schemas/message.schema";

export const messagesListRoute = new Elysia().get(
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
    const messagesTable = getMessageStatusTable(isTest);
    const identifiedUsersMv = getIdentifiedUsersMv(isTest);

    // Build status condition
    const statusCondition = status ? sql`AND m.status = ${status}` : sql``;

    // Get total count
    const countResult = await db.execute(
      sql`
        SELECT COUNT(*) as total
        FROM ${messagesTable} m
        WHERE m.api_key = ${apiKey}
        ${statusCondition}
      `,
    );

    const total = Number((countResult[0] as any)?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Get messages with analytics data and user info
    const messagesResult = await db.execute(
      sql`
        SELECT
          m.id,
          m.analytics_id,
          m.status,
          m.notes,
          m.created_at,
          a.identify_id,
          a.user_id,
          a.properties->>'contact' as contact,
          a.properties->>'content' as content,
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
        FROM ${messagesTable} m
        JOIN ${analyticsTable} a ON m.analytics_id = a.id
        LEFT JOIN ${identifiedUsersMv} u ON a.identify_id = u.identify_id AND u.api_key = ${apiKey}
        WHERE m.api_key = ${apiKey}
        ${statusCondition}
        ORDER BY a.date DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
    );

    const messages = (messagesResult as any[]).map((row) => ({
      id: row.id,
      analyticsId: row.analytics_id,
      contact: row.contact,
      content: row.content,
      status: row.status,
      notes: row.notes,
      platform: row.platform,
      country: row.country,
      identifyId: row.identify_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userAvatar: row.user_avatar,
      date: new Date(row.date).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
    }));

    return {
      messages,
      pagination: { page, limit, total, totalPages },
    };
  },
  {
    query: ListMessagesQuerySchema,
    detail: {
      summary: "Get paginated list of messages",
      description:
        "Returns a paginated list of contact form messages with optional status filtering",
      tags: ["Analytics"],
    },
  },
);
