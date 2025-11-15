import { t, type TSchema } from "elysia";

export const SuccessResponse = <T extends TSchema>(messageSchema: T) =>
  t.Object({
    success: t.Boolean(),
    message: messageSchema,
  });

export const ErrorResponse = t.Object({
  success: t.Literal(false),
  error: t.String(),
});
