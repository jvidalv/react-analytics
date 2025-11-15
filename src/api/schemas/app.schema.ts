import { t } from "elysia";

// Full app object for responses
export const AppSchema = t.Object({
  id: t.String({ format: "uuid" }),
  userId: t.String({ format: "uuid" }),
  name: t.String(),
  slug: t.String(),
  logoUrl: t.Union([t.String(), t.Null()]),
  description: t.Union([t.String(), t.Null()]),
  primaryColor: t.Union([t.String(), t.Null()]),
  websiteUrl: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  features: t.Array(t.String()),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

// POST /app/create request body
export const CreateAppBodySchema = t.Object({
  id: t.Optional(t.String({ format: "uuid" })),
  name: t.String(),
  description: t.Optional(t.String()),
  primaryColor: t.Optional(t.String()),
  logoUrl: t.Optional(t.String()),
  features: t.Optional(t.Array(t.String())),
});

// PUT /app/:slug request body
export const UpdateAppBodySchema = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  primaryColor: t.Optional(t.String()),
  logoUrl: t.Optional(t.String()),
  features: t.Optional(t.Array(t.String())),
  websiteUrl: t.Optional(t.String()),
  email: t.Optional(t.String()),
});
