import { NextResponse } from "next/server";
import { apps } from "@/db/schema"; // Adjust this path based on your schema location
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userApps = await db
      .select()
      .from(apps)
      .where(eq(apps.userId, session.user.id));

    return NextResponse.json(
      userApps.map((app) => ({
        ...app,
        features: app.features ? JSON.parse(app.features) : [],
        languages: app.languages ? JSON.parse(app.languages) : [],
      })),
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 },
    );
  }
};
