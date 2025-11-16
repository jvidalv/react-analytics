import { Elysia, t } from "elysia";
import { db } from "@/db";
import { countDistinct, eq, and, gte, lt } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

// Response schema
const StatsOverviewResponseSchema = t.Object({
  totalUsers: t.Number(),
  mau: t.Number(),
  dau: t.Number(),
  mauChange: t.Number(),
  dauChange: t.Number(),
});

export const overviewRoute = new Elysia().get(
  "/overview",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get correct table (production or test)
    const table = getAnalyticsTable(isTest);

    // Calculate date thresholds using JavaScript Date
    const now = Date.now();
    const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    // Query total users (all time) using Drizzle query builder
    const [totalUsersRow] = await db
      .select({ count: countDistinct(table.identifyId) })
      .from(table)
      .where(eq(table.apiKey, apiKey));
    const totalUsers = Number(totalUsersRow?.count || 0);

    // Query MAU (current period - last 30 days)
    const [mauCurrentRow] = await db
      .select({ count: countDistinct(table.identifyId) })
      .from(table)
      .where(
        and(
          eq(table.apiKey, apiKey),
          gte(table.date, thirtyDaysAgo)
        )
      );
    const mauCurrent = Number(mauCurrentRow?.count || 0);

    // Query MAU (previous period - 30-60 days ago)
    const [mauPreviousRow] = await db
      .select({ count: countDistinct(table.identifyId) })
      .from(table)
      .where(
        and(
          eq(table.apiKey, apiKey),
          gte(table.date, sixtyDaysAgo),
          lt(table.date, thirtyDaysAgo)
        )
      );
    const mauPrevious = Number(mauPreviousRow?.count || 0);

    // Query DAU (current period - last 24 hours)
    const [dauCurrentRow] = await db
      .select({ count: countDistinct(table.identifyId) })
      .from(table)
      .where(
        and(
          eq(table.apiKey, apiKey),
          gte(table.date, oneDayAgo)
        )
      );
    const dauCurrent = Number(dauCurrentRow?.count || 0);

    // Query DAU (previous period - 24-48 hours ago)
    const [dauPreviousRow] = await db
      .select({ count: countDistinct(table.identifyId) })
      .from(table)
      .where(
        and(
          eq(table.apiKey, apiKey),
          gte(table.date, twoDaysAgo),
          lt(table.date, oneDayAgo)
        )
      );
    const dauPrevious = Number(dauPreviousRow?.count || 0);

    // Calculate period-over-period changes
    const mauChange =
      mauPrevious > 0 ? ((mauCurrent - mauPrevious) / mauPrevious) * 100 : 0;

    const dauChange =
      dauPrevious > 0 ? ((dauCurrent - dauPrevious) / dauPrevious) * 100 : 0;

    return {
      totalUsers,
      mau: mauCurrent,
      dau: dauCurrent,
      mauChange: Math.round(mauChange * 10) / 10, // Round to 1 decimal
      dauChange: Math.round(dauChange * 10) / 10,
    };
  },
  {
    response: StatsOverviewResponseSchema,
    detail: {
      summary: "Get analytics overview stats",
      description:
        "Returns core KPIs: Total Users, MAU, DAU with period-over-period changes",
      tags: ["Analytics"],
    },
  }
);
