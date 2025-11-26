import { Elysia } from "elysia";
import { getUserFromStore } from "@/api/utils/auth";
import { SuccessResponse } from "@/api/schemas/common.schema";
import { UserSchema } from "@/api/schemas/user.schema";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const getUserMeRoute = new Elysia().get(
  "/user/me",
  async ({ store }) => {
    const user = getUserFromStore(store);

    // Fetch the latest purchased plan
    const latestTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.email, user.email))
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    const userPlan = latestTransaction.length
      ? latestTransaction[0].productName
      : "free";

    // Update user row with the latest plan (non-blocking)
    db.update(users)
      .set({ plan: userPlan })
      .where(eq(users.id, user.id))
      .execute()
      .catch(console.error); // Log any errors but don't block response

    return {
      success: true,
      message: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        image: user.image,
        plan: userPlan,
        devModeEnabled: user.devModeEnabled,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  },
  {
    response: SuccessResponse(UserSchema),
    detail: {
      summary: "Get current user",
      description: "Get the currently authenticated user's profile",
      tags: ["User"],
    },
  },
);
