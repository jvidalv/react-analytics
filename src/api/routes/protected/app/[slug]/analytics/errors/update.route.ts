import { Elysia, t } from "elysia";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import {
  getErrorStatusTable,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";
import { UpdateErrorRequestSchema } from "@/api/schemas/error.schema";

export const errorsUpdateRoute = new Elysia().put(
  "/:errorId",
  async ({ store, params, body, set }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);
    const { errorId } = params;

    const errorsTable = getErrorStatusTable(isTest);

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
      .update(errorsTable)
      .set(updateData)
      .where(and(eq(errorsTable.id, errorId), eq(errorsTable.apiKey, apiKey)))
      .returning();

    if (result.length === 0) {
      set.status = 404;
      return { success: false, errorMessage: "Error not found" };
    }

    return {
      success: true,
      error: {
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
      errorId: t.String(),
    }),
    body: UpdateErrorRequestSchema,
    detail: {
      summary: "Update error status",
      description: "Update the status and/or notes of an error",
      tags: ["Analytics"],
    },
  },
);
