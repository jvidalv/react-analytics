import { z } from "zod";
import { JsonObjectSchema } from "./common";
import { PushEventSchema } from "./events";

/**
 * Analytics push endpoint schemas for /api/analytics/push
 */

// POST /api/analytics/push - Push analytics events
export const PushEventsBodySchema = z.object({
  apiKey: z
    .string()
    .refine(
      (key) =>
        // Accept old UUID format: "550e8400-e29b-41d4-a716-446655440000"
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          key,
        ) ||
        // Accept new custom format: "prod-myapp-7c9e66797425440de944be07fc1f90ae7"
        /^(prod|dev)-[a-z0-9-]+-[0-9a-f]{32}$/.test(key),
      { message: "Invalid API key format" },
    ),
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
