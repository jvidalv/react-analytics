import { NextResponse } from "next/server";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user data
    const selectedUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const user = selectedUsers?.[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the latest purchased plan
    const latestTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.email, user.email))
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    const userPlan = latestTransaction.length
      ? latestTransaction[0].productName
      : "straw";

    // Update user row with the latest plan (non-blocking)
    db.update(users)
      .set({ plan: userPlan })
      .where(eq(users.id, session.user.id))
      .execute()
      .catch(console.error); // Log any errors but don't block response

    return NextResponse.json({
      ...user,
      plan: userPlan,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const validFields = ["name", "image", "aiModel"];
    const updateData: Record<string, typeof users> = {};

    for (const key of validFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 },
      );
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .execute();

    return NextResponse.json({ success: true, updatedFields: updateData });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
};
