import { Elysia } from "elysia";
import { getAppFromStore } from "@/api/utils/app";
import { SuccessResponse } from "@/api/schemas/common.schema";
import { AppSchema } from "@/api/schemas/app.schema";

export const getOneAppRoute = new Elysia().get(
  "/",
  async ({ store }) => {
    const app = getAppFromStore(store);

    // Convert Date objects to ISO strings
    const appResponse = {
      ...app,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };

    return {
      success: true,
      message: appResponse,
    };
  },
  {
    response: SuccessResponse(AppSchema),
    detail: {
      summary: "Get app by slug",
      description: "Fetch a single app by its slug",
      tags: ["App"],
    },
  },
);
