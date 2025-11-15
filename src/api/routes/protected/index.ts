import { Elysia } from "elysia";
import { auth } from "@/auth";
import { StoreUser } from "@/api/utils/auth";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getUserMeRoute } from "./get-user-me.route";
import { postUserMeRoute } from "./post-user-me.route";
import { appRoutes } from "./app";

export const protectedRoutes = new Elysia({ prefix: "/protected" })
  .onBeforeHandle(async ({ set, store }) => {
    const session = await auth();
    if (!session?.user?.id) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Fetch full user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      set.status = 401;
      return {
        success: false,
        error: "User not found",
      };
    }

    // Store user in Elysia store for reuse in route handlers
    (store as { user: StoreUser }).user = user;
  })
  .use(getUserMeRoute)
  .use(postUserMeRoute)
  .use(appRoutes);
