import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getMessageStatusTable,
  getIdentifiedUsersMv,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";

export const messagesOneRoute = new Elysia().get(
  "/:messageId",
  async ({ store, params, set }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);
    const { messageId } = params;

    const analyticsTable = getAnalyticsTable(isTest);
    const messagesTable = getMessageStatusTable(isTest);
    const identifiedUsersMv = getIdentifiedUsersMv(isTest);

    const result = await db.execute(
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
        WHERE m.id = ${messageId} AND m.api_key = ${apiKey}
        LIMIT 1
      `,
    );

    if (result.length === 0) {
      set.status = 404;
      return { success: false, error: "Message not found" };
    }

    const row = result[0] as any;
    const message = {
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
    };

    return { success: true, message };
  },
  {
    params: t.Object({
      slug: t.String(),
      messageId: t.String(),
    }),
    detail: {
      summary: "Get single message by ID",
      description: "Returns a single message with all details",
      tags: ["Analytics"],
    },
  },
);
