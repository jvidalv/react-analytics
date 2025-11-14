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
    const type = searchParams.get("type");

    if (!apiKey || !type) {
      return NextResponse.json(
        { error: "apiKey and type are required" },
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

    if (type === "country") {
      const result = await db.execute(sql`
        SELECT info->'requestMetadata'->>'country' AS value, COUNT(*) AS count
        FROM (
          SELECT DISTINCT ON (identify_id) identify_id, info
          FROM ${targetTable}
          WHERE api_key = ${apiKey}
          ORDER BY identify_id, date DESC
        ) sub
        GROUP BY value
        ORDER BY count DESC
      `);

      return NextResponse.json({ data: result }, { status: 200 });
    }

    let field: string;
    switch (type) {
      case "navigation":
        field = "properties->>'path'";
        break;
      case "action":
        field = "properties->>'name'";
        break;
      case "error":
        field = "properties->>'message'";
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const result = await db.execute(sql`
        SELECT ${sql.raw(field)} AS value, COUNT(*) AS count
        FROM ${targetTable}
        WHERE api_key = ${apiKey} AND type = ${type}
        GROUP BY value
        ORDER BY count DESC
    `);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error("Error fetching aggregates:", err);
    return NextResponse.json(
      { error: "Failed to fetch aggregates" },
      { status: 500 },
    );
  }
};
