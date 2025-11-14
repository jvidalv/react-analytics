import { z } from "zod";
import { JsonObjectSchema } from "./common";
import { PushEventSchema } from "./events";

/**
 * Analytics push endpoint schemas for /api/analytics/push
 */

// POST /api/analytics/push - Push analytics events
export const PushEventsBodySchema = z.object({
  apiKey: z.string().uuid("Invalid API key format"),
  identifyId: z.string().optional(),
  userId: z.string().optional(),
  appVersion: z.string().optional(),
  events: z
    .array(PushEventSchema)
    .min(1, "At least one event is required")
    .max(100, "Maximum 100 events per batch"),
  info: JsonObjectSchema.optional(), // Device/platform information
});

export type PushEventsBody = z.infer<typeof PushEventsBodySchema>;

export const PushEventsResponseSchema = z.object({
  success: z.literal(true),
  count: z.number().int().nonnegative().optional(),
});

export type PushEventsResponse = z.infer<typeof PushEventsResponseSchema>;
