import { Elysia } from "elysia";
import { validateApiKey } from "@/api/utils/analytics";
import { statsRoutes } from "./stats";

// Define store type for analytics context
type AnalyticsStore = {
  apiKey: string;
  isTest: boolean;
};

export const analyticsRoutes = new Elysia({ prefix: "/analytics/:apiKey" })
  // Validate API key and store in state for child routes
  .onBeforeHandle(async ({ params, set, store }) => {
    const { apiKey } = params as { apiKey: string };

    // Validate API key exists in database
    const validation = await validateApiKey(apiKey);

    if (!validation) {
      set.status = 403;
      return {
        success: false,
        error: "Invalid API key",
      };
    }

    // Store for child routes to access
    (store as AnalyticsStore).apiKey = apiKey;
    (store as AnalyticsStore).isTest = validation.isTestKey;
  })
  // Register child routes
  .use(statsRoutes);
