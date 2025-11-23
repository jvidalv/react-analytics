import { z } from "zod";
import { DateStringSchema, JsonObjectSchema } from "./common";

/**
 * Analytics event schemas
 */

// Event type enum
export const AnalyticsEventTypeSchema = z.enum([
  "navigation",
  "action",
  "error",
  "state",
  "identify",
]);

export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;

// Event properties with 600 character limit
export const EventPropertiesSchema = z.record(z.string(), z.unknown()).refine(
  (props) => {
    const jsonString = JSON.stringify(props);
    return jsonString.length <= 600;
  },
  {
    message:
      "Event properties must be less than 600 characters when stringified",
  },
);

// Base analytics event schema
export const AnalyticsEventSchema = z.object({
  id: z.string().uuid(),
  identifyId: z.string(),
  userId: z.string().nullable(),
  type: AnalyticsEventTypeSchema,
  properties: EventPropertiesSchema,
  date: DateStringSchema,
  info: JsonObjectSchema.nullable(),
  appVersion: z.string().nullable(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// Event for push endpoint (without id, generated server-side)
export const PushEventSchema = z.object({
  type: AnalyticsEventTypeSchema,
  properties: EventPropertiesSchema,
  date: DateStringSchema.optional(), // Server generates if not provided
});

export type PushEvent = z.infer<typeof PushEventSchema>;
