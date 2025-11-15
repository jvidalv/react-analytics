import { Elysia, t } from "elysia";
import { SuccessResponse } from "@/api/schemas/common.schema";

export const healthRoute = new Elysia().get(
  "/health",
  async () => {
    return {
      success: true,
      message: "OK",
    };
  },
  {
    response: SuccessResponse(t.String()),
    detail: {
      summary: "Health Check",
      description: "Check if the API is running",
      tags: ["Health"],
    },
  }
);
