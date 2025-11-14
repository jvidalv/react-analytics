import { z } from "zod";
import {
  ApiKeyQuerySchema,
  PaginationMetaSchema,
  PlatformSchema,
  CountryCodeSchema,
  DateStringSchema,
  JsonObjectSchema,
} from "./common";
import { AnalyticsEventSchema } from "./events";

/**
 * User analytics schemas for all /api/analytics/users/* endpoints
 */

// ============================================================================
// GET /api/analytics/users/all - List all users with filters
// ============================================================================

export const GetUsersQuerySchema = ApiKeyQuerySchema.extend({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  platform: PlatformSchema.optional(),
  country: CountryCodeSchema.optional(),
  appVersion: z.string().optional(),
  query: z.string().optional(), // Search query for user/device info
});

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;

export const AnalyticsUserSchema = z.object({
  identifyId: z.string(),
  userId: z.string().nullable(),
  appVersion: z.string(),
  lastUpdate: DateStringSchema,
  deviceInformation: JsonObjectSchema,
  userInformation: JsonObjectSchema.optional(),
  firstSeen: DateStringSchema,
});

export type AnalyticsUser = z.infer<typeof AnalyticsUserSchema>;

export const UsersResponseSchema = z.object({
  data: z.array(AnalyticsUserSchema),
  pagination: PaginationMetaSchema,
});

export type UsersResponse = z.infer<typeof UsersResponseSchema>;

// ============================================================================
// GET /api/analytics/users/one - Get single user details
// ============================================================================

export const GetUserQuerySchema = ApiKeyQuerySchema.extend({
  identifyId: z.string().min(1, "identifyId is required"),
});

export type GetUserQuery = z.infer<typeof GetUserQuerySchema>;

export const UserDetailSchema = AnalyticsUserSchema.extend({
  active: z.boolean(), // Active if last event within 5 minutes
});

export type UserDetail = z.infer<typeof UserDetailSchema>;

export const UserResponseSchema = z.object({
  data: UserDetailSchema,
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// ============================================================================
// GET /api/analytics/users/one/sessions - Get user sessions
// ============================================================================

export const GetUserSessionsQuerySchema = GetUserQuerySchema; // Same as GetUserQuery

export type GetUserSessionsQuery = z.infer<typeof GetUserSessionsQuerySchema>;

// Session is an array of events (grouped by 5-min inactivity threshold)
export const SessionSchema = z.array(AnalyticsEventSchema);

export type Session = z.infer<typeof SessionSchema>;

export const UserSessionsResponseSchema = z.object({
  data: z.array(SessionSchema),
});

export type UserSessionsResponse = z.infer<typeof UserSessionsResponseSchema>;

// ============================================================================
// GET /api/analytics/users/stats - Get user statistics
// ============================================================================

export const GetUserStatsQuerySchema = ApiKeyQuerySchema;

export type GetUserStatsQuery = z.infer<typeof GetUserStatsQuerySchema>;

export const UserStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  identifiedCount: z.number().int().nonnegative(),
  anonymousCount: z.number().int().nonnegative(),
  iosCount: z.number().int().nonnegative(),
  androidCount: z.number().int().nonnegative(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

export const UserStatsResponseSchema = UserStatsSchema;

export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;

// ============================================================================
// GET /api/analytics/users/stats/aggregate - Get aggregated statistics
// ============================================================================

export const AggregateTypeSchema = z.enum([
  "navigation",
  "action",
  "error",
  "country",
]);

export type AggregateType = z.infer<typeof AggregateTypeSchema>;

export const GetAggregateQuerySchema = ApiKeyQuerySchema.extend({
  type: AggregateTypeSchema,
});

export type GetAggregateQuery = z.infer<typeof GetAggregateQuerySchema>;

export const AggregateRecordSchema = z.object({
  value: z.string().nullable(),
  count: z.number().int().nonnegative(),
});

export type AggregateRecord = z.infer<typeof AggregateRecordSchema>;

export const AggregateResponseSchema = z.object({
  data: z.array(AggregateRecordSchema),
});

export type AggregateResponse = z.infer<typeof AggregateResponseSchema>;

// ============================================================================
// GET /api/analytics/users/all/errors - Get daily error statistics
// ============================================================================

export const GetDailyErrorsQuerySchema = ApiKeyQuerySchema;

export type GetDailyErrorsQuery = z.infer<typeof GetDailyErrorsQuerySchema>;

export const DailyErrorRecordSchema = z.object({
  day: z.string(), // YYYY-MM-DD format
  message: z.string(),
  count: z.number().int().nonnegative(),
});

export type DailyErrorRecord = z.infer<typeof DailyErrorRecordSchema>;

export const DailyErrorsResponseSchema = z.array(DailyErrorRecordSchema);

export type DailyErrorsResponse = z.infer<typeof DailyErrorsResponseSchema>;
