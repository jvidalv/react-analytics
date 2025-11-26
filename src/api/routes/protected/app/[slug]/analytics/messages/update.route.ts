import { Elysia, t } from "elysia";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import {
  getMessageStatusTable,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";
import { UpdateMessageRequestSchema } from "@/api/schemas/message.schema";

export const messagesUpdateRoute = new Elysia().put(
  "/:messageId",
  async ({ store, params, body, set }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);
    const { messageId } = params;

    const messagesTable = getMessageStatusTable(isTest);

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const result = await db
      .update(messagesTable)
      .set(updateData)
      .where(
        and(eq(messagesTable.id, messageId), eq(messagesTable.apiKey, apiKey)),
      )
      .returning();

    if (result.length === 0) {
      set.status = 404;
      return { success: false, error: "Message not found" };
    }

    return {
      success: true,
      message: {
        id: result[0].id,
        analyticsId: result[0].analyticsId,
        status: result[0].status,
        notes: result[0].notes,
        createdAt: result[0].createdAt.toISOString(),
      },
    };
  },
  {
    params: t.Object({
      slug: t.String(),
      messageId: t.String(),
    }),
    body: UpdateMessageRequestSchema,
    detail: {
      summary: "Update message status",
      description: "Update the status and/or notes of a message",
      tags: ["Analytics"],
    },
  },
);
