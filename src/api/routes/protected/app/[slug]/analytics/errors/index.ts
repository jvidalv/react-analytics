import { Elysia } from "elysia";
import { errorsListRoute } from "./list.route";
import { errorsOneRoute } from "./one.route";
import { errorsUpdateRoute } from "./update.route";

export const errorsRoutes = new Elysia({ prefix: "/errors" })
  .use(errorsListRoute)
  .use(errorsOneRoute)
  .use(errorsUpdateRoute);
