import { z } from "zod";

/**
 * Common schemas shared across analytics API endpoints
 */

// Pagination metadata schema
export const PaginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

// Common query parameters
export const ApiKeyQuerySchema = z.object({
  apiKey: z.string().uuid("Invalid API key format"),
});

export type ApiKeyQuery = z.infer<typeof ApiKeyQuerySchema>;

// Platform filter
export const PlatformSchema = z.enum(["ios", "android", "web"]);
export type Platform = z.infer<typeof PlatformSchema>;

// Country code (ISO 3166-1 alpha-2)
export const CountryCodeSchema = z
  .string()
  .length(2, "Country code must be 2 characters")
  .toUpperCase();

// Date string (ISO 8601)
export const DateStringSchema = z.string().datetime();

// Generic JSON object for flexible properties
export const JsonObjectSchema = z.record(z.unknown());

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
