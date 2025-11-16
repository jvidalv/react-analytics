import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
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

    // Query total users (all time)
    const totalUsersResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as count
      FROM ${table}
      WHERE api_key = ${apiKey}
    `);
    const totalUsers = Number(totalUsersResult.rows[0]?.count || 0);

    // Query MAU (current period - last 30 days)
    const mauCurrentResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as count
      FROM ${table}
      WHERE api_key = ${apiKey}
        AND date >= NOW() - INTERVAL '30 days'
    `);
    const mauCurrent = Number(mauCurrentResult.rows[0]?.count || 0);

    // Query MAU (previous period - 30-60 days ago)
    const mauPreviousResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as count
      FROM ${table}
      WHERE api_key = ${apiKey}
        AND date >= NOW() - INTERVAL '60 days'
        AND date < NOW() - INTERVAL '30 days'
    `);
    const mauPrevious = Number(mauPreviousResult.rows[0]?.count || 0);

    // Query DAU (current period - last 24 hours)
    const dauCurrentResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as count
      FROM ${table}
      WHERE api_key = ${apiKey}
        AND date >= NOW() - INTERVAL '1 day'
    `);
    const dauCurrent = Number(dauCurrentResult.rows[0]?.count || 0);

    // Query DAU (previous period - 24-48 hours ago)
    const dauPreviousResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as count
      FROM ${table}
      WHERE api_key = ${apiKey}
        AND date >= NOW() - INTERVAL '2 days'
        AND date < NOW() - INTERVAL '1 day'
    `);
    const dauPrevious = Number(dauPreviousResult.rows[0]?.count || 0);

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
