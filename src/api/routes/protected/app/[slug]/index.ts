import { Elysia } from "elysia";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppWithParsedFields } from "@/api/utils/app";
import { getOneAppRoute } from "./get-one.route";
import { putUpdateAppRoute } from "./put-update.route";
import { analyticsRoutes } from "./analytics";

export const appSlugRoutes = new Elysia({ prefix: "/:slug" })
  .onBeforeHandle(async ({ set, store, params }) => {
    const { slug } = params;

    const [app] = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (!app) {
      set.status = 404;
      return {
        success: false,
        error: "App not found",
      };
    }

    // Parse JSON fields
    const appWithParsedFields: AppWithParsedFields = {
      ...app,
      features: app.features ? JSON.parse(app.features) : [],
    };

    // Store app in Elysia store for reuse in child routes
    Object.assign(store, { app: appWithParsedFields });
  })
  .use(getOneAppRoute)
  .use(putUpdateAppRoute)
  .use(analyticsRoutes);
