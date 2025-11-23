import { Elysia } from "elysia";
import { postPushRoute } from "./post-push.route";

export const analyticsRoutes = new Elysia({ prefix: "/analytics" }).use(
  postPushRoute,
);
