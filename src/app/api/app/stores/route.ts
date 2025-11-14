import { NextResponse } from "next/server";
import { appStores, apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { uuidv7 } from "uuidv7";

// GET: Fetch app store data by app slug
export const GET = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "App slug is required" },
        { status: 400 },
      );
    }

    // Find the app by slug
    const app = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    // Retrieve app store data
    const storeData = await db
      .select()
      .from(appStores)
      .where(eq(appStores.appId, app[0].id))
      .limit(1);

    if (!storeData.length) {
      return NextResponse.json(
        { error: "No store data found for this app" },
        { status: 404 },
      );
    }

    return NextResponse.json(storeData[0].storeData);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch app store data" },
      { status: 500 },
    );
  }
};

// POST: Create or update app store data
export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, storeData } = await req.json();

    if (!slug || !storeData) {
      return NextResponse.json(
        { error: "App slug and storeData are required" },
        { status: 400 },
      );
    }

    // Find the app by slug
    const app = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appId = app[0].id;

    // Check if app store data already exists
    const existingStore = await db
      .select()
      .from(appStores)
      .where(eq(appStores.appId, appId))
      .limit(1);

    if (existingStore.length > 0) {
      // Update existing store data
      await db
        .update(appStores)
        .set({ storeData })
        .where(eq(appStores.appId, appId))
        .execute();

      return NextResponse.json({ message: "Store data updated successfully" });
    }

    // Insert new store data
    const newStore = {
      id: uuidv7(),
      appId,
      storeData,
    };

    await db.insert(appStores).values(newStore);

    return NextResponse.json(newStore, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create or update app store data" },
      { status: 500 },
    );
  }
};
