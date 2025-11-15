import { Elysia } from "elysia";
import { getAllAppsRoute } from "./get-all.route";
import { postCreateAppRoute } from "./post-create.route";
import { appSlugRoutes } from "./[slug]";

export const appRoutes = new Elysia({ prefix: "/app" })
  .use(getAllAppsRoute)
  .use(postCreateAppRoute)
  .use(appSlugRoutes);
