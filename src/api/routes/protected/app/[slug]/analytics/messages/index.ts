import { Elysia } from "elysia";
import { messagesListRoute } from "./list.route";
import { messagesOneRoute } from "./one.route";
import { messagesUpdateRoute } from "./update.route";

export const messagesRoutes = new Elysia({ prefix: "/messages" })
  .use(messagesListRoute)
  .use(messagesOneRoute)
  .use(messagesUpdateRoute);
