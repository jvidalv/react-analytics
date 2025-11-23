import { Elysia, t } from "elysia";
import { getUserFromStore } from "@/api/utils/auth";
import { SuccessResponse } from "@/api/schemas/common.schema";
import {
  UpdateUserBodySchema,
  UpdateUserResponseSchema,
} from "@/api/schemas/user.schema";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const postUserMeRoute = new Elysia().post(
  "/user/me",
  async ({ body, store, set }) => {
    const user = getUserFromStore(store);

    const validFields = ["name", "image"] as const;
    const updateData: Record<string, string> = {};

    for (const key of validFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key] as string;
      }
    }

    if (Object.keys(updateData).length === 0) {
      set.status = 400;
      throw new Error("No valid fields provided");
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .execute();

    return {
      success: true,
      message: {
        updatedFields: updateData,
      },
    };
  },
  {
    body: UpdateUserBodySchema,
    response: SuccessResponse(UpdateUserResponseSchema),
    detail: {
      summary: "Update current user",
      description: "Update the currently authenticated user's profile",
      tags: ["User"],
    },
  },
);
