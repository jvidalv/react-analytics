import { t, Static } from "elysia";

// Constants
export const MAX_PROPERTIES_LENGTH = 600;
export const MAX_EVENTS_PER_BATCH = 100;

// Event types enum
export const EventTypeSchema = t.Union([
  t.Literal("navigation"),
  t.Literal("action"),
  t.Literal("identify"),
  t.Literal("state"),
  t.Literal("error"),
]);

export type EventType = Static<typeof EventTypeSchema>;

// Base event schema (common fields)
const BaseEventSchema = t.Object({
  type: EventTypeSchema,
  date: t.String({ format: "date-time" }),
  properties: t.Optional(t.Record(t.String(), t.Unknown())),
});

// Navigation event schema
export const NavigationEventSchema = t.Composite([
  BaseEventSchema,
  t.Object({
    type: t.Literal("navigation"),
    path: t.String({ minLength: 1 }),
  }),
]);

// Action event schema
export const ActionEventSchema = t.Composite([
  BaseEventSchema,
  t.Object({
    type: t.Literal("action"),
    name: t.String({ minLength: 1 }),
  }),
]);

// Identify event schema
export const IdentifyEventSchema = t.Composite([
  BaseEventSchema,
  t.Object({
    type: t.Literal("identify"),
    id: t.String({ minLength: 1 }),
  }),
]);

// State event schema
export const StateEventSchema = t.Composite([
  BaseEventSchema,
  t.Object({
    type: t.Literal("state"),
    active: t.Boolean(),
  }),
]);

// Error event schema
export const ErrorEventSchema = t.Composite([
  BaseEventSchema,
  t.Object({
    type: t.Literal("error"),
    message: t.String({ minLength: 1 }),
  }),
]);

// Union of all event types
export const AnalyticsEventSchema = t.Union([
  NavigationEventSchema,
  ActionEventSchema,
  IdentifyEventSchema,
  StateEventSchema,
  ErrorEventSchema,
]);

export type AnalyticsEvent = Static<typeof AnalyticsEventSchema>;

// Push request body schema
export const PushRequestBodySchema = t.Object({
  apiKey: t.String({ format: "uuid" }),
  identifyId: t.String({ minLength: 1 }),
  userId: t.Optional(t.Union([t.String(), t.Null()])),
  appVersion: t.Optional(t.Union([t.String(), t.Null()])),
  events: t.Array(AnalyticsEventSchema, {
    minItems: 1,
    maxItems: MAX_EVENTS_PER_BATCH,
  }),
  info: t.Optional(t.Union([t.Record(t.String(), t.Unknown()), t.Null()])),
});

export type PushRequestBody = Static<typeof PushRequestBodySchema>;

// Success response schema
export const PushSuccessResponseSchema = t.Object({
  success: t.Literal(true),
});

// Error response schemas
export const PushErrorResponseSchema = t.Object({
  success: t.Literal(false),
  error: t.Object({
    code: t.String(),
    message: t.String(),
    field: t.Optional(t.String()),
  }),
});

// Common error codes
export const ErrorCodes = {
  INVALID_API_KEY: "INVALID_API_KEY",
  INVALID_EVENT_TYPE: "INVALID_EVENT_TYPE",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  PROPERTIES_TOO_LARGE: "PROPERTIES_TOO_LARGE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
