import { Elysia, t } from "elysia";
import { db } from "@/db";
import { countDistinct, eq } from "drizzle-orm";
import { analytics, analyticsTest } from "@/db/schema";

// Response schema for combined overview
const StatsCombinedOverviewResponseSchema = t.Object({
  totalUsersProd: t.Number(),
  totalUsersTest: t.Number(),
  hasAnyData: t.Boolean(),
});

export const overviewCombinedRoute = new Elysia().get(
  "/overview-combined",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKeyProd = (store as any).apiKeyProd as string;
    const apiKeyTest = (store as any).apiKeyTest as string;

    // Query total users from production table
    const [totalUsersProdRow] = await db
      .select({ count: countDistinct(analytics.identifyId) })
      .from(analytics)
      .where(eq(analytics.apiKey, apiKeyProd));
    const totalUsersProd = Number(totalUsersProdRow?.count || 0);

    // Query total users from test table
    const [totalUsersTestRow] = await db
      .select({ count: countDistinct(analyticsTest.identifyId) })
      .from(analyticsTest)
      .where(eq(analyticsTest.apiKey, apiKeyTest));
    const totalUsersTest = Number(totalUsersTestRow?.count || 0);

    return {
      totalUsersProd,
      totalUsersTest,
      hasAnyData: totalUsersProd > 0 || totalUsersTest > 0,
    };
  },
  {
    response: StatsCombinedOverviewResponseSchema,
    detail: {
      summary: "Get combined analytics overview (both prod and test)",
      description:
        "Returns total users from both production and test tables to determine if any data exists",
      tags: ["Analytics"],
    },
  },
);
