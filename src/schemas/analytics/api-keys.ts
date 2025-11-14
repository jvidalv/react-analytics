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
  apiKey: z.string().uuid(), // Production API key
  apiKeyTest: z.string().uuid(), // Test API key
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ApiKeys = z.infer<typeof ApiKeysSchema>;

export const ApiKeysResponseSchema = ApiKeysSchema;

export type ApiKeysResponse = z.infer<typeof ApiKeysResponseSchema>;
