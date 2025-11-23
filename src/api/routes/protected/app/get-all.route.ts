import { Elysia, t } from "elysia";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromStore } from "@/api/utils/auth";
import { SuccessResponse } from "@/api/schemas/common.schema";
import { AppSchema } from "@/api/schemas/app.schema";

export const getAllAppsRoute = new Elysia().get(
  "/all",
  async ({ store }) => {
    const user = getUserFromStore(store);

    const userApps = await db
      .select()
      .from(apps)
      .where(eq(apps.userId, user.id));

    const appsWithParsedFields = userApps.map((app) => ({
      ...app,
      features: app.features ? JSON.parse(app.features) : [],
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return {
      success: true,
      message: appsWithParsedFields,
    };
  },
  {
    response: SuccessResponse(t.Array(AppSchema)),
    detail: {
      summary: "Get all user apps",
      description: "Fetch all apps belonging to the authenticated user",
      tags: ["App"],
    },
  },
);
