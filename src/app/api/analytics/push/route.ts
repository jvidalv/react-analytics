import { NextResponse } from "next/server";
import { analytics, analyticsTest, analyticsApiKeys } from "@/db/schema";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import type { AnalyticsEvent } from "@jvidalv/react-analytics";

const MAX_PROPERTIES_LENGTH = 600;

const VALID_EVENT_TYPES = [
  "navigation",
  "action",
  "identify",
  "state",
  "error",
] as const;

type RequestBody = {
  apiKey: string;
  identifyId?: string;
  appVersion?: string;
  userId?: string;
  events: AnalyticsEvent[];
  info?: Record<string, unknown>;
};

// Helper function to validate JSON structure and length
const isValidProperties = (properties?: Record<string, unknown>): boolean => {
  if (!properties) return true;
  try {
    const jsonString = JSON.stringify(properties);
    return jsonString.length <= MAX_PROPERTIES_LENGTH;
  } catch {
    return false;
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const POST = async (req: Request) => {
  try {
    const {
      apiKey,
      identifyId,
      userId,
      appVersion,
      events,
      info,
    }: RequestBody = await req.json();

    if (!apiKey || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "apiKey and events are required" },
        { status: 400, headers: corsHeaders },
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

    if (!apiKeyRecord.length) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 403, headers: corsHeaders },
      );
    }

    const apiKeyData = apiKeyRecord[0];

    const isTestKey = apiKey === apiKeyData.apiKeyTest;
    const targetTable = isTestKey ? analyticsTest : analytics;

    // Get request metadata (such as country)
    const requestMetadata = {
      country:
        req.headers.get("x-vercel-ip-country") ||
        req.headers.get("cf-ipcountry") ||
        null,
      userAgent: req.headers.get("user-agent") || null,
    };

    const validEvents = events.map((event) => {
      if (!identifyId) {
        throw new Error(`Missing identifyId`);
      }

      if (!VALID_EVENT_TYPES.includes(event.type)) {
        throw new Error(`Invalid event type: ${event.type}`);
      }

      if (event.type === "navigation" && !event.path) {
        throw new Error(`Navigation event must have a path`);
      }

      if (event.type === "action" && !event.name) {
        throw new Error(`Action event must have a name`);
      }

      if (event.type === "identify" && !event.id) {
        throw new Error(`Identify event must have an id`);
      }

      if (event.type === "state" && typeof event.active !== "boolean") {
        throw new Error(`State event must have an active boolean value`);
      }

      if (event.properties && !isValidProperties(event.properties)) {
        throw new Error(`Invalid properties JSON format or exceeds limit`);
      }

      let specialPropertyKey: string;
      let specialPropertyValue: string | boolean;

      if (event.type === "navigation") {
        specialPropertyKey = "path";
        specialPropertyValue = event.path;
      } else if (event.type === "action") {
        specialPropertyKey = "name";
        specialPropertyValue = event.name;
      } else if (event.type === "identify") {
        specialPropertyKey = "id";
        specialPropertyValue = event.id;
      } else if (event.type === "state") {
        specialPropertyKey = "active";
        specialPropertyValue = event.active;
      } else if (event.type === "error") {
        specialPropertyKey = "message";
        specialPropertyValue = event.message;
      } else {
        throw new Error("Invalid event type");
      }

      const formattedProperties = {
        [specialPropertyKey]: specialPropertyValue,
        ...(event.properties ? { data: event.properties } : {}),
      };

      const eventInfo = {
        ...(info || {}),
        requestMetadata,
      };

      return {
        id: uuidv7(),
        apiKey,
        identifyId,
        userId,
        appVersion,
        date: new Date(event.date),
        type: event.type,
        properties: formattedProperties,
        info: eventInfo,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    if (userId && identifyId) {
      const existingIdentify = await db
        .select({ identifyId: targetTable.identifyId })
        .from(targetTable)
        .where(eq(targetTable.userId, userId))
        .limit(1);

      const previousIdentifyId = existingIdentify[0]?.identifyId;

      if (previousIdentifyId && previousIdentifyId !== identifyId) {
        await db
          .update(targetTable)
          .set({ identifyId })
          .where(eq(targetTable.identifyId, previousIdentifyId));
      }
    }

    await db.insert(targetTable).values(validEvents);

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to store analytics events" },
      { status: 500, headers: corsHeaders },
    );
  }
};
