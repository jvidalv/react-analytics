import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "@/db";
import {
  PushRequestBodySchema,
  PushSuccessResponseSchema,
  PushErrorResponseSchema,
  ErrorCodes,
} from "@/api/schemas/analytics.schema";
import {
  validateApiKey,
  getAnalyticsTable,
  extractRequestMetadata,
  isValidPropertiesSize,
  buildEventObject,
  reconcileIdentity,
  logPushMetrics,
  checkRateLimit,
} from "@/api/utils/analytics";

export const postPushRoute = new Elysia()
  .use(
    cors({
      origin: true, // Allow all origins (web apps from any domain)
      credentials: false, // No credentials needed (API key in body)
      methods: ["POST", "OPTIONS"], // POST for events, OPTIONS for preflight
      exposeHeaders: [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
      ], // Let clients read rate limit headers
      allowedHeaders: ["Content-Type"], // Only need JSON
      maxAge: 86400, // Cache preflight for 24 hours
      preflight: true, // Handle OPTIONS requests
    })
  )
  .post(
  "/push",
  async ({ body, request, set }) => {
    const startTime = Date.now();

    try {
      // 1. Validate API key and determine production vs test
      const validationResult = await validateApiKey(body.apiKey);

      if (!validationResult) {
        set.status = 403;
        logPushMetrics({
          apiKey: body.apiKey,
          eventCount: body.events.length,
          duration: Date.now() - startTime,
          success: false,
          error: "Invalid API key",
        });

        return {
          success: false,
          error: {
            code: ErrorCodes.INVALID_API_KEY,
            message: "Invalid API key provided",
          },
        };
      }

      const { isTestKey } = validationResult;
      const targetTable = getAnalyticsTable(isTestKey);

      // 2. Check rate limit
      const rateLimitResult = await checkRateLimit(body.apiKey, targetTable);

      // Set rate limit headers
      set.headers["X-RateLimit-Limit"] = rateLimitResult.limit.toString();
      set.headers["X-RateLimit-Remaining"] =
        rateLimitResult.remaining.toString();
      set.headers["X-RateLimit-Reset"] = rateLimitResult.resetAt.toISOString();

      if (!rateLimitResult.allowed) {
        set.status = 429;
        logPushMetrics({
          apiKey: body.apiKey,
          eventCount: body.events.length,
          duration: Date.now() - startTime,
          success: false,
          error: "Rate limit exceeded",
        });

        return {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: `Rate limit exceeded. Maximum ${rateLimitResult.limit} requests per minute.`,
          },
        };
      }

      // 3. Extract request metadata from headers
      const requestMetadata = extractRequestMetadata(request.headers);

      // 4. Validate properties size for each event
      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i];
        if (event.properties && !isValidPropertiesSize(event.properties)) {
          set.status = 400;
          logPushMetrics({
            apiKey: body.apiKey,
            eventCount: body.events.length,
            duration: Date.now() - startTime,
            success: false,
            error: "Properties too large",
          });

          return {
            success: false,
            error: {
              code: ErrorCodes.PROPERTIES_TOO_LARGE,
              message: "Event properties exceed maximum size (600 characters)",
              field: `events[${i}].properties`,
            },
          };
        }
      }

      // 5. Build all event objects for insertion
      const eventObjects = body.events.map((event) =>
        buildEventObject(event, {
          apiKey: body.apiKey,
          identifyId: body.identifyId,
          userId: body.userId,
          appVersion: body.appVersion,
          info: body.info,
          requestMetadata,
        })
      );

      // 6. Batch insert all events (single query - performance improvement!)
      await db.insert(targetTable).values(eventObjects);

      // 7. Trigger identity reconciliation asynchronously (don't block response)
      if (body.userId && body.identifyId) {
        void reconcileIdentity(
          body.userId,
          body.identifyId,
          body.apiKey,
          targetTable
        );
      }

      // 8. Log metrics for observability
      logPushMetrics({
        apiKey: body.apiKey,
        eventCount: body.events.length,
        duration: Date.now() - startTime,
        success: true,
      });

      // 9. Return success response
      set.status = 201;
      return { success: true };
    } catch (error) {
      // Handle unexpected errors
      console.error("[Analytics Push] Unexpected error:", error);

      logPushMetrics({
        apiKey: body.apiKey,
        eventCount: body.events.length,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      set.status = 500;
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Failed to store analytics events",
        },
      };
    }
  },
  {
    body: PushRequestBodySchema,
    response: {
      201: PushSuccessResponseSchema,
      400: PushErrorResponseSchema,
      403: PushErrorResponseSchema,
      429: PushErrorResponseSchema,
      500: PushErrorResponseSchema,
    },
    detail: {
      summary: "Push analytics events",
      description:
        "Receive and store analytics events from mobile applications. Supports both production and test environments via different API keys.",
      tags: ["Analytics"],
    },
  }
);
