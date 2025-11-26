import { Elysia } from "elysia";
import { db } from "@/db";
import { apps, analyticsApiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromStore } from "@/api/utils/auth";
import { SuccessResponse } from "@/api/schemas/common.schema";
import { AppSchema, CreateAppBodySchema } from "@/api/schemas/app.schema";
import { uuidv7 } from "uuidv7";
import { APP_FEATURES, FeatureKey } from "@/lib/features";
import { generateRandomHexColor } from "@/lib/colors";
import { generateApiKey } from "@/lib/api-keys";

const VALID_FEATURE_KEYS = new Set(APP_FEATURES.map((feature) => feature.key));

const validateFeatures = (features?: string[]) => {
  if (!features) return true;
  if (!Array.isArray(features)) return false;
  return features.every((feature) =>
    VALID_FEATURE_KEYS.has(feature as FeatureKey),
  );
};

export const postCreateAppRoute = new Elysia().post(
  "/create",
  async ({ body, store, set }) => {
    const user = getUserFromStore(store);

    if (!validateFeatures(body.features)) {
      set.status = 400;
      throw new Error("Invalid features provided");
    }

    // Generate base slug
    let slug = body.name.toLowerCase().replace(/\s+/g, "-");

    // Check if slug already exists and modify if necessary
    let existingApp = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    while (existingApp.length > 0) {
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      slug = `${slug}-${randomSuffix}`;
      existingApp = await db
        .select()
        .from(apps)
        .where(eq(apps.slug, slug))
        .limit(1);
    }

    const newApp = {
      id: body.id || uuidv7(),
      userId: user.id,
      name: body.name,
      slug,
      description: body.description || null,
      primaryColor: body.primaryColor || generateRandomHexColor(),
      features: JSON.stringify(body.features || []),
      email: user.email,
      websiteUrl: null,
    };

    // Create app and analytics API keys in a transaction
    await db.transaction(async (tx) => {
      // Insert the app
      await tx.insert(apps).values(newApp);

      // Create analytics API keys for the app
      const newApiKeys = {
        id: uuidv7(),
        userId: user.id,
        appId: newApp.id,
        apiKey: generateApiKey(slug, false), // Production key
        apiKeyTest: generateApiKey(slug, true), // Test/dev key
      };

      await tx.insert(analyticsApiKeys).values(newApiKeys);
    });

    // Get the created app with timestamps
    const [createdApp] = await db
      .select()
      .from(apps)
      .where(eq(apps.id, newApp.id))
      .limit(1);

    const appWithParsedFields = {
      ...createdApp,
      features: createdApp.features ? JSON.parse(createdApp.features) : [],
      createdAt: createdApp.createdAt.toISOString(),
      updatedAt: createdApp.updatedAt.toISOString(),
    };

    set.status = 201;
    return {
      success: true,
      message: appWithParsedFields,
    };
  },
  {
    body: CreateAppBodySchema,
    response: SuccessResponse(AppSchema),
    detail: {
      summary: "Create new app",
      description: "Create a new app for the authenticated user",
      tags: ["App"],
    },
  },
);
