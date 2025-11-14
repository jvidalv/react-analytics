// /app/api/analytics/users/one/info/route.ts

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
    const identifyId = searchParams.get("identifyId");
    const apiKey = searchParams.get("apiKey");

    if (!identifyId || !apiKey) {
      return NextResponse.json(
        { error: "identifyId and apiKey are required" },
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
        WITH latest_identify AS (
            SELECT properties
            FROM ${targetTable}
            WHERE identify_id = ${identifyId}
              AND type = 'identify'
              AND api_key = ${apiKey}
            ORDER BY date DESC
            LIMIT 1
        ),
             latest_state AS (
                 SELECT date, properties
                 FROM ${targetTable}
                 WHERE identify_id = ${identifyId}
                   AND type = 'state'
                   AND api_key = ${apiKey}
                 ORDER BY date DESC
                 LIMIT 1
             ),
             last_event AS (
                 SELECT date
                 FROM ${targetTable}
                 WHERE identify_id = ${identifyId}
                   AND api_key = ${apiKey}
                 ORDER BY date DESC
                 LIMIT 1
             )
        SELECT
            t.identify_id,
            t.user_id,
            t.app_version,
            t.info,
            (SELECT properties FROM latest_identify) AS latest_identify_properties,
            (SELECT json_build_object('date', date, 'properties', properties) FROM latest_state) AS latest_state_event,
            (SELECT date FROM last_event) AS last_update
        FROM ${targetTable} t
        WHERE t.identify_id = ${identifyId}
          AND t.api_key = ${apiKey}
        ORDER BY t.date DESC
        LIMIT 1
    `);

    const row = result?.[0];

    if (!row) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let active = true;
    try {
      // @ts-expect-error -- untyped
      const lastUpdateTime = new Date(row.last_update).getTime();
      const now = Date.now();
      const INACTIVITY_THRESHOLD = 2 * 60 * 1000;

      if (row.latest_state_event) {
        // @ts-expect-error -- untyped
        const { properties } = row.latest_state_event;
        if (
          properties?.active === false &&
          // @ts-expect-error -- untyped
          row.last_update === row.latest_state_event.date
        ) {
          active = false;
        } else if (now - lastUpdateTime > INACTIVITY_THRESHOLD) {
          active = false;
        }
      } else {
        if (now - lastUpdateTime > INACTIVITY_THRESHOLD) {
          active = false;
        }
      }
    } catch {
      active = false;
    }

    return NextResponse.json({
      data: {
        identifyId: row.identify_id,
        userId: row.user_id,
        appVersion: row.app_version,
        lastUpdate: row.last_update,
        deviceInformation: row.info,
        active,
        // @ts-expect-error -- untyped
        userInformation: row.latest_identify_properties?.data,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 },
    );
  }
};
