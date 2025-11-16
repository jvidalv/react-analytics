import { Elysia } from "elysia";
import { db } from "@/db";
import { analyticsApiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppFromStore } from "@/api/utils/app";
import { getUserFromStore } from "@/api/utils/auth";
import { statsRoutes } from "./stats";

// Define store type for analytics context
type AnalyticsStore = {
  apiKey: string;
  isTest: boolean;
};

export const analyticsRoutes = new Elysia({ prefix: "/analytics" })
  .onBeforeHandle(async ({ set, store }) => {
    // Get app and user from store (already validated by parent routes)
    const app = getAppFromStore(store);
    const user = getUserFromStore(store);

    // Get analytics API keys for this app
    const [apiKeys] = await db
      .select()
      .from(analyticsApiKeys)
      .where(eq(analyticsApiKeys.appId, app.id))
      .limit(1);

    if (!apiKeys) {
      set.status = 404;
      return {
        success: false,
        error: "Analytics not configured for this app",
      };
    }

    // Use devModeEnabled to determine which key to use
    const isTest = user.devModeEnabled;
    const apiKey = isTest ? apiKeys.apiKeyTest : apiKeys.apiKey;

    // Store for child routes to access
    (store as AnalyticsStore).apiKey = apiKey;
    (store as AnalyticsStore).isTest = isTest;
  })
  .use(statsRoutes);
