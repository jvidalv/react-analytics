import { Elysia } from "elysia";
import { refreshIdentifiedUsersMaterializedViews } from "@/api/utils/analytics";

/**
 * Route to refresh the identified users materialized views
 * This can be called manually or via a cron job
 */
export const refreshViewsRoute = new Elysia().post(
  "/refresh-views",
  async () => {
    try {
      await refreshIdentifiedUsersMaterializedViews();

      return {
        success: true,
        message: "Materialized views refreshed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to refresh materialized views",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    detail: {
      summary: "Refresh identified users materialized views",
      description:
        "Refreshes the materialized views for identified users. This ensures the views have the latest data from the analytics tables.",
      tags: ["Analytics"],
    },
  },
);
