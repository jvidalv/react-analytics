import { Elysia } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  getAnalyticsTable,
  getAnalyticsFromStore,
} from "@/api/utils/analytics";

export const errorRateAggregatesRoute = new Elysia().get(
  "/error-rate-aggregates",
  async ({ store }) => {
    const { apiKey, isTest } = getAnalyticsFromStore(store);

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Calculate time periods for growth metrics
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    // Query overall error stats (all time)
    const overallResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'error') AS total_errors,
        COUNT(*) AS total_events
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
    `);

    const overallRow = overallResult[0] as any;
    const totalErrors = Number(overallRow?.total_errors || 0);
    const totalEvents = Number(overallRow?.total_events || 0);
    const errorRate =
      totalEvents > 0
        ? Math.round((totalErrors / totalEvents) * 10000) / 100
        : 0;

    // Query current period (last 30 days)
    const currentResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'error') AS current_errors,
        COUNT(*) AS current_events
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
        AND date >= ${thirtyDaysAgo.toISOString()}
    `);

    const currentRow = currentResult[0] as any;
    const currentErrors = Number(currentRow?.current_errors || 0);
    const currentEvents = Number(currentRow?.current_events || 0);
    const currentRate =
      currentEvents > 0
        ? Math.round((currentErrors / currentEvents) * 10000) / 100
        : 0;

    // Query previous period (30-60 days ago)
    const previousResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'error') AS previous_errors,
        COUNT(*) AS previous_events
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
        AND date >= ${sixtyDaysAgo.toISOString()}
        AND date < ${thirtyDaysAgo.toISOString()}
    `);

    const previousRow = previousResult[0] as any;
    const previousErrors = Number(previousRow?.previous_errors || 0);
    const previousEvents = Number(previousRow?.previous_events || 0);
    const previousRate =
      previousEvents > 0
        ? Math.round((previousErrors / previousEvents) * 10000) / 100
        : 0;

    // Calculate absolute change in error rate (not percentage of percentage)
    const rateChange =
      previousRate > 0
        ? Math.round((currentRate - previousRate) * 100) / 100
        : 0;

    return {
      totalErrors,
      totalEvents,
      errorRate,
      growth: {
        current: currentRate,
        previous: previousRate,
        change: rateChange,
      },
    };
  },
  {
    // response: ErrorRateAggregatesResponseSchema,
    detail: {
      summary: "Get error rate statistics",
      description:
        "Returns overall and growth metrics for error rate (errors/total events)",
      tags: ["Analytics"],
    },
  },
);
