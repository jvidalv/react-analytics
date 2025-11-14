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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("pageSize") || "10", 10);
    const offset = (page - 1) * limit;

    const platform = searchParams.get("platform");
    const country = searchParams.get("country");
    const appVersion = searchParams.get("appVersion");
    const query = searchParams.get("query")?.toLowerCase() || "";

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

    const whereClauses = [sql`api_key = ${apiKey}`];

    if (platform) whereClauses.push(sql`info->>'platform' = ${platform}`);
    if (country)
      whereClauses.push(sql`info->'requestMetadata'->>'country' = ${country}`);
    if (appVersion) whereClauses.push(sql`app_version = ${appVersion}`);
    if (query) {
      whereClauses.push(sql`
          identify_id IN (
      SELECT identify_id
      FROM ${targetTable}
          WHERE api_key = ${apiKey}
          AND (
          lower(properties->'data'->>'email') LIKE ${`%${query}%`} OR
          lower(properties->'data'->>'firstName') LIKE ${`%${query}%`} OR
          lower(properties->'data'->>'lastName') LIKE ${`%${query}%`} OR
          lower(properties->>'name') LIKE ${`%${query}%`} OR
          lower(properties->>'path') LIKE ${`%${query}%`} OR
          lower(properties->>'message') LIKE ${`%${query}%`} OR
          lower(
          coalesce(properties->'data'->>'firstName', '') || ' ' || coalesce(properties->'data'->>'lastName', '')
          ) LIKE ${`%${query}%`}
          )
          )
      `);
    }

    const totalResult = await db.execute(sql`
        WITH latest_identified AS (
            SELECT DISTINCT ON (identify_id)
                identify_id
            FROM ${targetTable}
            WHERE type = 'identify' AND user_id IS NOT NULL AND ${sql.join(whereClauses, sql` AND `)}
            ORDER BY identify_id, date DESC
        ),
             latest_anonymous AS (
                 SELECT DISTINCT ON (identify_id)
                     identify_id
                 FROM ${targetTable}
                 WHERE identify_id NOT IN (
                     SELECT identify_id FROM ${targetTable} WHERE type = 'identify' AND user_id IS NOT NULL
                 )
                   AND ${sql.join(whereClauses, sql` AND `)}
                 ORDER BY identify_id, date DESC
             ),
             all_ids AS (
                 SELECT identify_id FROM latest_identified
                 UNION
                 SELECT identify_id FROM latest_anonymous
             )
        SELECT COUNT(*) AS total FROM all_ids
    `);

    const total = Number(totalResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    const users = (await db.execute(sql`
        WITH latest_identified AS (
            SELECT DISTINCT ON (identify_id)
                identify_id,
                user_id,
                app_version,
                info,
                date,
                type,
                properties
            FROM ${targetTable}
            WHERE type = 'identify' AND user_id IS NOT NULL AND ${sql.join(whereClauses, sql` AND `)}
            ORDER BY identify_id, date DESC
        ),
             latest_anonymous AS (
                 SELECT DISTINCT ON (identify_id)
                     identify_id,
                     user_id,
                     app_version,
                     info,
                     date,
                     type,
                     properties
                 FROM ${targetTable}
                 WHERE identify_id NOT IN (
                     SELECT identify_id FROM ${targetTable} WHERE type = 'identify' AND user_id IS NOT NULL
                 )
                   AND ${sql.join(whereClauses, sql` AND `)}
                 ORDER BY identify_id, date DESC
             ),
             all_users AS (
                 SELECT * FROM latest_identified
                 UNION ALL
                 SELECT * FROM latest_anonymous
             ),
             first_seen AS (
                 SELECT identify_id, MIN(date) AS first_time_seen
                 FROM ${targetTable}
                 WHERE ${sql.join(whereClauses, sql` AND `)}
                 GROUP BY identify_id
             )
        SELECT
            u.identify_id,
            u.user_id,
            u.app_version,
            u.info,
            u.date,
            u.type,
            u.properties,
            f.first_time_seen
        FROM all_users u
                 LEFT JOIN first_seen f ON u.identify_id = f.identify_id
        ORDER BY u.date DESC
        LIMIT ${limit} OFFSET ${offset}
    `)) as {
      identify_id: string;
      user_id: string | null;
      app_version: string;
      info: string;
      date: string;
      type: string;
      properties: {
        data?: {
          email?: string;
          firstName?: string;
          lastName?: string;
          avatarUrl?: string;
        } & Record<string, unknown>;
      };
      first_time_seen: string;
    }[];

    const formattedUsers = users.map((user) => ({
      identifyId: user.identify_id,
      userId: user.user_id,
      appVersion: user.app_version,
      lastUpdate: user.date,
      deviceInformation: user.info,
      userInformation: user.properties?.data,
      firstSeen: user.first_time_seen,
    }));

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      },
    });
  } catch (err) {
    console.error("Error fetching users with filters:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
};
