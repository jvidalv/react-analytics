import { z } from "zod";

/**
 * API Keys schemas for /api/analytics/api-keys endpoint
 */

// GET /api/analytics/api-keys - Get or create API keys for an app
export const GetApiKeysQuerySchema = z.object({
  appId: z.string().uuid("Invalid app ID format"),
});

export type GetApiKeysQuery = z.infer<typeof GetApiKeysQuerySchema>;

export const ApiKeysSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  appId: z.string().uuid(),
  apiKey: z.string().refine(
    (key) =>
      // Accept old UUID format OR new custom format
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        key,
      ) || /^prod-[a-z0-9-]+-[0-9a-f]{32}$/.test(key),
    { message: "Invalid production API key format" },
  ),
  apiKeyTest: z.string().refine(
    (key) =>
      // Accept old UUID format OR new custom format
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        key,
      ) || /^dev-[a-z0-9-]+-[0-9a-f]{32}$/.test(key),
    { message: "Invalid test API key format" },
  ),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ApiKeys = z.infer<typeof ApiKeysSchema>;

export const ApiKeysResponseSchema = ApiKeysSchema;

export type ApiKeysResponse = z.infer<typeof ApiKeysResponseSchema>;
