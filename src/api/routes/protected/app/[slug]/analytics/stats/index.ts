import { Elysia } from "elysia";
import { overviewRoute } from "./overview.route";

export const statsRoutes = new Elysia({ prefix: "/stats" }).use(overviewRoute);
