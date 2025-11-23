import { Elysia, t } from "elysia";
import { db } from "@/db";
import { analyticsApiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppFromStore } from "@/api/utils/app";
import { SuccessResponse } from "@/api/schemas/common.schema";

// Response schema
const ApiKeysSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  appId: t.String(),
  apiKey: t.String(),
  apiKeyTest: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const apiKeysRoute = new Elysia().get(
  "/api-keys",
  async ({ store, set }) => {
    const app = getAppFromStore(store);

    // Fetch API keys
    const [apiKeys] = await db
      .select()
      .from(analyticsApiKeys)
      .where(eq(analyticsApiKeys.appId, app.id))
      .limit(1);

    // API keys should always exist (created when app is created)
    if (!apiKeys) {
      set.status = 404;
      throw new Error("Analytics API keys not found for this app");
    }

    return {
      success: true,
      message: apiKeys,
    };
  },
  {
    response: SuccessResponse(ApiKeysSchema),
    detail: {
      summary: "Get analytics API keys",
      description:
        "Fetch analytics API keys for the app (production and development)",
      tags: ["Analytics"],
    },
  },
);
