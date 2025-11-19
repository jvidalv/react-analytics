import { Elysia } from "elysia";
import { usersListRoute } from "./list.route";
import { usersFiltersRoute } from "./filters.route";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(usersListRoute)
  .use(usersFiltersRoute);
