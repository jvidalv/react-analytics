// app/api/analytics/errors/daily/route.ts
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

  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");
  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
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
  const table = isTestKey ? analyticsTest : analytics;

  const result = await db.execute(sql`
    SELECT
      to_char(date_trunc('day', date), 'YYYY-MM-DD') AS day,
      coalesce(properties->>'message', properties->'data'->>'message', 'unknown') AS message,
      count(*) AS count
    FROM ${table}
    WHERE
      type = 'error'
      AND api_key = ${apiKey}
      AND date >= now() - interval '7 days'
    GROUP BY day, message
    ORDER BY day ASC
  `);

  return NextResponse.json(result);
};
