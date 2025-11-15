import { Elysia } from "elysia";
import { healthRoute } from "./health.route";
import { analyticsRoutes } from "./analytics";

export const publicRoutes = new Elysia({ prefix: "/public" })
  .use(healthRoute)
  .use(analyticsRoutes);
