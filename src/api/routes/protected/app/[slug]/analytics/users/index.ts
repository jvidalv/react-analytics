import { Elysia } from "elysia";
import { usersListRoute } from "./list.route";

export const usersRoutes = new Elysia({ prefix: "/users" }).use(usersListRoute);
