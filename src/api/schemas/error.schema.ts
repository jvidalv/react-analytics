import { t, Static } from "elysia";
import { type ErrorStatusType } from "@/db/schema";

// Error status schema (for runtime validation)
export const ErrorStatusSchema = t.Union([
  t.Literal("new"),
  t.Literal("seen"),
  t.Literal("fixed"),
]);

// Re-export the type from schema for type safety (single source of truth)
export type ErrorStatus = ErrorStatusType;

// Full error object (joined analytics + status + user info)
export const ErrorSchema = t.Object({
  id: t.String({ format: "uuid" }),
  analyticsId: t.String({ format: "uuid" }),
  message: t.String(),
  name: t.Union([t.String(), t.Null()]),
  stack: t.Union([t.String(), t.Null()]),
  componentStack: t.Union([t.String(), t.Null()]),
  route: t.Union([t.String(), t.Null()]),
  source: t.Union([t.String(), t.Null()]),
  status: ErrorStatusSchema,
  notes: t.Union([t.String(), t.Null()]),
  platform: t.Union([t.String(), t.Null()]),
  country: t.Union([t.String(), t.Null()]),
  appVersion: t.Union([t.String(), t.Null()]),
  identifyId: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  userName: t.Union([t.String(), t.Null()]),
  userEmail: t.Union([t.String(), t.Null()]),
  userAvatar: t.Union([t.String(), t.Null()]),
  date: t.String(),
  createdAt: t.String(),
});

// Explicit type definition for better inference
export interface AnalyticsError {
  id: string;
  analyticsId: string;
  message: string;
  name: string | null;
  stack: string | null;
  componentStack: string | null;
  route: string | null;
  source: string | null;
  status: ErrorStatus;
  notes: string | null;
  platform: string | null;
  country: string | null;
  appVersion: string | null;
  identifyId: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  date: string;
  createdAt: string;
}

// Update error request schema
export const UpdateErrorRequestSchema = t.Object({
  status: t.Optional(ErrorStatusSchema),
  notes: t.Optional(t.Union([t.String(), t.Null()])),
});

export type UpdateErrorRequest = Static<typeof UpdateErrorRequestSchema>;

// List errors query params schema
export const ListErrorsQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
});

export type ListErrorsQuery = Static<typeof ListErrorsQuerySchema>;

// Pagination schema (reuse from message if needed, or define locally)
export const PaginationSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

export type Pagination = Static<typeof PaginationSchema>;

// List errors response schema
export const ErrorsListResponseSchema = t.Object({
  errors: t.Array(ErrorSchema),
  pagination: PaginationSchema,
});

// Explicit type for better inference
export interface ErrorsListResponse {
  errors: AnalyticsError[];
  pagination: Pagination;
}

// Update error response schema
export const UpdateErrorResponseSchema = t.Object({
  success: t.Boolean(),
  error: t.Optional(ErrorSchema),
  errorMessage: t.Optional(t.String()),
});

export type UpdateErrorResponse = Static<typeof UpdateErrorResponseSchema>;
