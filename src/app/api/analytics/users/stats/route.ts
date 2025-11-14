import { NextResponse } from "next/server";
import { analytics, analyticsTest, analyticsApiKeys } from "@/db/schema";
import { db } from "@/db";
import { auth } from "@/auth";
import { eq, or, sql } from "drizzle-orm";

export const GET = async (req: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get("apiKey");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    const apiKeyRecord = await db
      .select()
      .from(analyticsApiKeys)
      .where(
        or(
          eq(analyticsApiKeys.apiKey, apiKey),
          eq(analyticsApiKeys.apiKeyTest, apiKey),
        ),
      )
      .limit(1);

    if (!apiKeyRecord.length || apiKeyRecord[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    const isTestKey = apiKey === apiKeyRecord[0].apiKeyTest;
    const targetTable = isTestKey ? analyticsTest : analytics;

    const result = await db.execute(sql`
        WITH first_events AS (
            SELECT DISTINCT ON (identify_id) identify_id, user_id, date, info
            FROM ${targetTable}
            WHERE api_key = ${apiKey}
            ORDER BY identify_id, CASE WHEN user_id IS NOT NULL THEN 0 ELSE 1 END, date
        )
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE user_id IS NOT NULL) AS identified,
            COUNT(*) FILTER (WHERE user_id IS NULL) AS anonymous,
            COUNT(*) FILTER (WHERE (info->>'platform') = 'ios') AS ios_total,
            COUNT(*) FILTER (WHERE (info->>'platform') = 'android') AS android_total
        FROM first_events;
    `);

    const row = result[0] as unknown as {
      total: string;
      identified: string;
      anonymous: string;
      ios_total: string;
      android_total: string;
    };

    return NextResponse.json({
      total: Number(row.total),
      identifiedCount: Number(row.identified),
      anonymousCount: Number(row.anonymous),
      iosCount: Number(row.ios_total),
      androidCount: Number(row.android_total),
    });
  } catch (error) {
    console.error("Error computing user totals:", error);
    return NextResponse.json(
      { error: "Failed to fetch user totals" },
      { status: 500 },
    );
  }
};
