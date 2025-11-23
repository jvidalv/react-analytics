import { Elysia } from "elysia";
import { getUserFromStore } from "@/api/utils/auth";
import { SuccessResponse } from "@/api/schemas/common.schema";
import {
  ToggleDevModeBodySchema,
  ToggleDevModeResponseSchema,
} from "@/api/schemas/user.schema";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const postUserModeRoute = new Elysia().post(
  "/user/mode",
  async ({ body, store }) => {
    const user = getUserFromStore(store);

    await db
      .update(users)
      .set({ devModeEnabled: body.devModeEnabled })
      .where(eq(users.id, user.id))
      .execute();

    return {
      success: true,
      message: {
        devModeEnabled: body.devModeEnabled,
      },
    };
  },
  {
    body: ToggleDevModeBodySchema,
    response: SuccessResponse(ToggleDevModeResponseSchema),
    detail: {
      summary: "Toggle development mode",
      description: "Toggle development mode for the current user",
      tags: ["User"],
    },
  },
);
