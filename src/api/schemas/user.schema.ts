import { t } from "elysia";

// Full user object returned from GET /me
export const UserSchema = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.Union([t.String(), t.Null()]),
  email: t.String({ format: "email" }),
  emailVerified: t.Union([t.String(), t.Null()]),
  image: t.Union([t.String(), t.Null()]),
  plan: t.String(),
  aiModel: t.String(),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

// POST /me request body - all fields optional
export const UpdateUserBodySchema = t.Object({
  name: t.Optional(t.String()),
  image: t.Optional(t.String()),
  aiModel: t.Optional(t.String()),
});

// POST /me response
export const UpdateUserResponseSchema = t.Object({
  updatedFields: t.Record(t.String(), t.Any()),
});
