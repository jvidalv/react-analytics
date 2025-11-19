import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

export const usersFiltersRoute = new Elysia().get(
  "/filters",
  async ({ store }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Get unique countries
    const countriesResult = await db.execute(sql`
      SELECT DISTINCT info->'requestMetadata'->>'country' as country
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
        AND type = 'identify'
        AND info->'requestMetadata'->>'country' IS NOT NULL
      ORDER BY country
    `);

    const countries = (countriesResult as any[])
      .map((row) => row.country)
      .filter((c) => c);

    // Get unique versions
    const versionsResult = await db.execute(sql`
      SELECT DISTINCT app_version as version
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
        AND type = 'identify'
        AND app_version IS NOT NULL
      ORDER BY version DESC
    `);

    const versions = (versionsResult as any[])
      .map((row) => row.version)
      .filter((v) => v);

    return {
      countries,
      versions,
    };
  },
  {
    response: t.Object({
      countries: t.Array(t.String()),
      versions: t.Array(t.String()),
    }),
    detail: {
      summary: "Get available filter options",
      description:
        "Returns unique countries and versions for filtering users",
      tags: ["Analytics"],
    },
  }
);
