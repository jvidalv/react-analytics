import { Elysia } from "elysia";
import { healthRoute } from "./health.route";

export const publicRoutes = new Elysia({ prefix: "/public" }).use(healthRoute);
