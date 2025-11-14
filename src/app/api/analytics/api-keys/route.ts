import { NextResponse } from "next/server";
import { analyticsApiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { uuidv7 } from "uuidv7";

// GET: Fetch or create API keys for a specific app
export const GET = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 },
      );
    }

    let apiKeys = await db
      .select()
      .from(analyticsApiKeys)
      .where(eq(analyticsApiKeys.appId, appId))
      .limit(1);

    if (!apiKeys.length) {
      const newApiKeys = {
        id: uuidv7(),
        userId: session.user.id,
        appId,
      };

      await db.insert(analyticsApiKeys).values(newApiKeys);

      apiKeys = await db
        .select()
        .from(analyticsApiKeys)
        .where(eq(analyticsApiKeys.appId, appId))
        .limit(1);
    }

    return NextResponse.json(apiKeys[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch or create API keys" },
      { status: 500 },
    );
  }
};
