import { db } from "@/db";
import { analytics, analyticsTest, analyticsApiKeys } from "@/db/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";
import type { AnalyticsEvent, EventType } from "@/api/schemas/analytics.schema";
import { MAX_PROPERTIES_LENGTH } from "@/api/schemas/analytics.schema";
import { uuidv7 } from "uuidv7";

// Type for analytics table
export type AnalyticsTable = typeof analytics | typeof analyticsTest;

/**
 * Get the appropriate analytics table based on API key
 */
export const getAnalyticsTable = (isTestKey: boolean): AnalyticsTable => {
  return isTestKey ? analyticsTest : analytics;
};

/**
 * Extract request metadata from headers
 */
export const extractRequestMetadata = (headers: Headers) => {
  return {
    country:
      headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || null,
    userAgent: headers.get("user-agent") || null,
  };
};

/**
 * Validate properties size (must be under MAX_PROPERTIES_LENGTH when stringified)
 */
export const isValidPropertiesSize = (
  properties?: Record<string, unknown>,
): boolean => {
  if (!properties) return true;
  try {
    const jsonString = JSON.stringify(properties);
    return jsonString.length <= MAX_PROPERTIES_LENGTH;
  } catch {
    return false;
  }
};

/**
 * Build formatted properties object for storage
 * Extracts the special property key (path, name, id, active, message) from event
 * and adds any additional properties under a 'data' key
 */
export const buildEventProperties = (event: AnalyticsEvent) => {
  let specialPropertyKey: string;
  let specialPropertyValue: string | boolean;

  switch (event.type) {
    case "navigation":
      specialPropertyKey = "path";
      specialPropertyValue = event.path;
      break;
    case "action":
      specialPropertyKey = "name";
      specialPropertyValue = event.name;
      break;
    case "identify":
      specialPropertyKey = "id";
      specialPropertyValue = event.id;
      break;
    case "state":
      specialPropertyKey = "active";
      specialPropertyValue = event.active;
      break;
    case "error":
      specialPropertyKey = "message";
      specialPropertyValue = event.message;
      break;
    default:
      // This should never happen due to TypeBox validation
      throw new Error(`Invalid event type: ${(event as any).type}`);
  }

  return {
    [specialPropertyKey]: specialPropertyValue,
    ...(event.properties ? { data: event.properties } : {}),
  };
};

/**
 * Build complete event object ready for database insertion
 */
export const buildEventObject = (
  event: AnalyticsEvent,
  {
    apiKey,
    identifyId,
    userId,
    appVersion,
    info,
    requestMetadata,
  }: {
    apiKey: string;
    identifyId: string;
    userId?: string;
    appVersion?: string;
    info?: Record<string, unknown>;
    requestMetadata: ReturnType<typeof extractRequestMetadata>;
  },
) => {
  const properties = buildEventProperties(event);
  const eventInfo = {
    ...(info || {}),
    requestMetadata,
  };

  return {
    id: uuidv7(),
    apiKey,
    identifyId,
    userId: userId || null,
    appVersion: appVersion || "0.0.0",
    date: new Date(event.date),
    type: event.type as EventType,
    properties,
    info: eventInfo,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Reconcile user identity - update old events with new identifyId when userId changes
 * This runs asynchronously and doesn't block the response
 */
export const reconcileIdentity = async (
  userId: string,
  newIdentifyId: string,
  apiKey: string,
  table: AnalyticsTable,
) => {
  try {
    // Find the previous identifyId for this userId
    const existingIdentify = await db
      .select({ identifyId: table.identifyId })
      .from(table)
      .where(eq(table.userId, userId))
      .limit(1);

    const previousIdentifyId = existingIdentify[0]?.identifyId;

    // If user had a different identifyId before, update all their old events
    if (previousIdentifyId && previousIdentifyId !== newIdentifyId) {
      await db
        .update(table)
        .set({ identifyId: newIdentifyId })
        .where(eq(table.identifyId, previousIdentifyId));

      console.log(
        `[Analytics] Reconciled identity: ${previousIdentifyId} → ${newIdentifyId} for userId: ${userId}`,
      );
    }
  } catch (error) {
    // Log but don't throw - this is a background operation
    console.error("[Analytics] Identity reconciliation failed:", error);
  }
};

/**
 * Validate and authenticate API key
 * Returns the API key data and whether it's a test key
 */
export const validateApiKey = async (apiKey: string) => {
  const apiKeyRecord = await db
    .select()
    .from(analyticsApiKeys)
    .where(eq(analyticsApiKeys.apiKey, apiKey))
    .limit(1);

  if (apiKeyRecord.length > 0) {
    return { apiKeyData: apiKeyRecord[0], isTestKey: false };
  }

  // Check if it's a test key
  const testKeyRecord = await db
    .select()
    .from(analyticsApiKeys)
    .where(eq(analyticsApiKeys.apiKeyTest, apiKey))
    .limit(1);

  if (testKeyRecord.length > 0) {
    return { apiKeyData: testKeyRecord[0], isTestKey: true };
  }

  return null;
};

/**
 * Check rate limit for API key
 * Returns whether the request should be allowed and current quota information
 */
export const checkRateLimit = async (
  apiKey: string,
  table: AnalyticsTable,
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> => {
  const windowMinutes = 1;
  const limit = 1000;

  // Calculate cutoff time for sliding window
  const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Count events in the last minute for this API key
  const result = await db
    .select({ count: count() })
    .from(table)
    .where(and(eq(table.apiKey, apiKey), gte(table.date, cutoffTime)));

  const currentCount = Number(result[0]?.count || 0);
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    current: currentCount,
    limit,
    remaining,
    resetAt: new Date(Date.now() + windowMinutes * 60 * 1000),
  };
};

/**
 * Log push request metrics for observability
 */
export const logPushMetrics = ({
  apiKey,
  eventCount,
  duration,
  success,
  error,
}: {
  apiKey: string;
  eventCount: number;
  duration: number;
  success: boolean;
  error?: string;
}) => {
  const logData = {
    type: "analytics_push",
    apiKey: apiKey.slice(0, 8) + "...", // Partial key for privacy
    eventCount,
    duration: `${duration}ms`,
    success,
    ...(error ? { error } : {}),
  };

  if (success) {
    console.log("[Analytics Push]", logData);
  } else {
    console.error("[Analytics Push Error]", logData);
  }
};
