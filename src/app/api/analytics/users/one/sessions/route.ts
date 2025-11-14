import { NextResponse } from "next/server";
import { analytics, analyticsTest, analyticsApiKeys } from "@/db/schema";
import { db } from "@/db";
import { auth } from "@/auth";
import { eq, or, asc } from "drizzle-orm";

const MAX_EVENTS_TO_FETCH = 6000; // A high number to ensure we capture 20 sessions
const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

type AnalyticsEvent = {
  id: string;
  identifyId: string;
  userId: string | null;
  type: "navigation" | "identify" | "action" | "state";
  properties: Record<string, unknown>;
  date: string;
  info: Record<string, unknown>;
};

export const GET = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const identifyId = searchParams.get("identifyId");

    if (!identifyId) {
      return NextResponse.json(
        { error: "identifyId is required" },
        { status: 400 },
      );
    }

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

    const rawEvents = (await db
      .select({
        id: targetTable.id,
        identifyId: targetTable.identifyId,
        userId: targetTable.userId,
        appVersion: targetTable.appVersion,
        type: targetTable.type,
        properties: targetTable.properties,
        date: targetTable.date,
        info: targetTable.info,
      })
      .from(targetTable)
      .where(eq(targetTable.identifyId, identifyId))
      .orderBy(asc(targetTable.date))
      .limit(MAX_EVENTS_TO_FETCH)) as unknown as AnalyticsEvent[];

    const sessions: AnalyticsEvent[][] = [];
    let currentSession: AnalyticsEvent[] = [];
    let lastEventTime: number | null = null;

    for (const event of rawEvents) {
      const eventTime = new Date(event.date).getTime();

      // If more than 2 minutes have passed since the last event, start a new session
      if (
        lastEventTime !== null &&
        eventTime - lastEventTime > INACTIVITY_THRESHOLD_MS
      ) {
        if (currentSession.length) {
          sessions.push(
            [...currentSession].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            ),
          );
          currentSession = [];
        }
      }

      currentSession.push(event);

      lastEventTime = eventTime;
    }

    // Ensure the last session is included
    if (currentSession.length) {
      sessions.push(
        [...currentSession].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      );
    }

    const filteredSessions = sessions.filter((session) =>
      session.some((event) => event.type !== "state"),
    );

    return NextResponse.json(
      { data: filteredSessions.reverse() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching analytics sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics sessions" },
      { status: 500 },
    );
  }
};
