import { Elysia } from "elysia";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAppFromStore } from "@/api/utils/app";
import { SuccessResponse } from "@/api/schemas/common.schema";
import { AppSchema, UpdateAppBodySchema } from "@/api/schemas/app.schema";
import { APP_FEATURES, FeatureKey } from "@/lib/features";

const VALID_FEATURE_KEYS = new Set(APP_FEATURES.map((feature) => feature.key));

const validateFeatures = (features?: string[]) => {
  if (!features) return true;
  if (!Array.isArray(features)) return false;
  return features.every((feature) =>
    VALID_FEATURE_KEYS.has(feature as FeatureKey),
  );
};

export const putUpdateAppRoute = new Elysia().put(
  "/",
  async ({ body, store, set }) => {
    const app = getAppFromStore(store);

    if (body.features && !validateFeatures(body.features)) {
      set.status = 400;
      throw new Error("Invalid features provided");
    }

    const updatedFields: Record<string, string | null> = {};

    if (body.name !== undefined) updatedFields.name = body.name;
    if (body.description !== undefined)
      updatedFields.description = body.description;
    if (body.primaryColor !== undefined)
      updatedFields.primaryColor = body.primaryColor;
    if (body.websiteUrl !== undefined)
      updatedFields.websiteUrl = body.websiteUrl;
    if (body.email !== undefined) updatedFields.email = body.email;
    if (body.features !== undefined)
      updatedFields.features = JSON.stringify(body.features);

    if (Object.keys(updatedFields).length === 0) {
      set.status = 400;
      throw new Error("No valid fields to update");
    }

    await db.update(apps).set(updatedFields).where(eq(apps.id, app.id));

    // Fetch updated app
    const [updatedApp] = await db
      .select()
      .from(apps)
      .where(eq(apps.id, app.id))
      .limit(1);

    const appWithParsedFields = {
      ...updatedApp,
      features: updatedApp.features ? JSON.parse(updatedApp.features) : [],
      createdAt: updatedApp.createdAt.toISOString(),
      updatedAt: updatedApp.updatedAt.toISOString(),
    };

    return {
      success: true,
      message: appWithParsedFields,
    };
  },
  {
    body: UpdateAppBodySchema,
    response: SuccessResponse(AppSchema),
    detail: {
      summary: "Update app",
      description: "Update an existing app by its slug",
      tags: ["App"],
    },
  },
);
