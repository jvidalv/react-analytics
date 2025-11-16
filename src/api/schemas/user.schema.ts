import { t } from "elysia";

// Full user object returned from GET /me
export const UserSchema = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.Union([t.String(), t.Null()]),
  email: t.String({ format: "email" }),
  emailVerified: t.Union([t.String(), t.Null()]),
  image: t.Union([t.String(), t.Null()]),
  plan: t.String(),
  devModeEnabled: t.Boolean(),
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.String({ format: "date-time" }),
});

// POST /me request body - all fields optional
export const UpdateUserBodySchema = t.Object({
  name: t.Optional(t.String()),
  image: t.Optional(t.String()),
});

// POST /me response
export const UpdateUserResponseSchema = t.Object({
  updatedFields: t.Record(t.String(), t.Any()),
});

// POST /user/mode request body
export const ToggleDevModeBodySchema = t.Object({
  devModeEnabled: t.Boolean(),
});

// POST /user/mode response
export const ToggleDevModeResponseSchema = t.Object({
  devModeEnabled: t.Boolean(),
});
