import { t, Static } from "elysia";
import { type MessageStatusType } from "@/db/schema";

// Message status schema (for runtime validation)
export const MessageStatusSchema = t.Union([
  t.Literal("new"),
  t.Literal("seen"),
  t.Literal("completed"),
]);

// Re-export the type from schema for type safety (single source of truth)
export type MessageStatus = MessageStatusType;

// Full message object (joined analytics + status + user info)
export const MessageSchema = t.Object({
  id: t.String({ format: "uuid" }),
  analyticsId: t.String({ format: "uuid" }),
  contact: t.String(),
  content: t.String(),
  status: MessageStatusSchema,
  notes: t.Union([t.String(), t.Null()]),
  platform: t.Union([t.String(), t.Null()]),
  country: t.Union([t.String(), t.Null()]),
  identifyId: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  userName: t.Union([t.String(), t.Null()]),
  userEmail: t.Union([t.String(), t.Null()]),
  userAvatar: t.Union([t.String(), t.Null()]),
  date: t.String(),
  createdAt: t.String(),
});

// Explicit type definition for better inference
export interface Message {
  id: string;
  analyticsId: string;
  contact: string;
  content: string;
  status: MessageStatus;
  notes: string | null;
  platform: string | null;
  country: string | null;
  identifyId: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  date: string;
  createdAt: string;
}

// Update message request schema
export const UpdateMessageRequestSchema = t.Object({
  status: t.Optional(MessageStatusSchema),
  notes: t.Optional(t.Union([t.String(), t.Null()])),
});

export type UpdateMessageRequest = Static<typeof UpdateMessageRequestSchema>;

// List messages query params schema
export const ListMessagesQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
});

export type ListMessagesQuery = Static<typeof ListMessagesQuerySchema>;

// Pagination schema
export const PaginationSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

export type Pagination = Static<typeof PaginationSchema>;

// List messages response schema
export const MessagesListResponseSchema = t.Object({
  messages: t.Array(MessageSchema),
  pagination: PaginationSchema,
});

// Explicit type for better inference
export interface MessagesListResponse {
  messages: Message[];
  pagination: Pagination;
}

// Update message response schema
export const UpdateMessageResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.Optional(MessageSchema),
  error: t.Optional(t.String()),
});

export type UpdateMessageResponse = Static<typeof UpdateMessageResponseSchema>;
