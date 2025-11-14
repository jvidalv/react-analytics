import { NextResponse } from "next/server";
import { translations, apps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { uuidv7 } from "uuidv7";

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

    const app = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    const appData = app[0];

    if (appData.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db
      .select()
      .from(translations)
      .where(eq(translations.appId, appData.id))
      .limit(1);

    if (!result.length) {
      const defaultLocales = appData.languages?.length
        ? (JSON.parse(appData.languages) as string[])
        : ["en"];

      const emptyData = Object.fromEntries(
        defaultLocales.map((locale) => [locale, {}]),
      );

      const newRecord = {
        id: uuidv7(),
        appId: appData.id,
        data: emptyData,
      };

      await db.insert(translations).values(newRecord);

      return NextResponse.json(newRecord, { status: 201 });
    }

    return NextResponse.json(result[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch or create translations" },
      { status: 500 },
    );
  }
};

// POST: Create or update translations by app slug
export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, data } = await req.json();

    if (!slug || !data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const topLevelKeys = Object.keys(data);
    if (topLevelKeys.length === 0) {
      return NextResponse.json(
        { error: "Translations data is empty" },
        { status: 400 },
      );
    }

    const firstKey = topLevelKeys[0];
    const value = data[firstKey];

    if (
      typeof firstKey !== "string" ||
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value)
    ) {
      return NextResponse.json(
        {
          error:
            "Translations must start with a locale key mapping to an object",
        },
        { status: 400 },
      );
    }

    const app = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (!app.length) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    if (app[0].userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await db
      .select()
      .from(translations)
      .where(eq(translations.appId, app[0].id))
      .limit(1);

    if (existing.length) {
      await db
        .update(translations)
        .set({ data })
        .where(eq(translations.appId, app[0].id))
        .execute();

      return NextResponse.json({
        message: "Translations updated successfully",
      });
    }

    const newTranslation = {
      id: uuidv7(),
      appId: app[0].id,
      data,
    };

    await db.insert(translations).values(newTranslation);

    return NextResponse.json(newTranslation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create or update translations" },
      { status: 500 },
    );
  }
};
