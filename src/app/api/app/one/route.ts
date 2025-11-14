import { NextResponse } from "next/server";
import { apps, appStores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { uuidv7 } from "uuidv7";
import { APP_FEATURES, FeatureKey } from "@/lib/features";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";

const VALID_FEATURE_KEYS = new Set(APP_FEATURES.map((feature) => feature.key));
const VALID_LANGUAGE_KEYS = new Set(
  ALL_LANGUAGES.map((language) => language.locale),
);

const validateFeatures = (features: FeatureKey[]) => {
  if (!Array.isArray(features)) return false;
  return features.every((feature) => VALID_FEATURE_KEYS.has(feature));
};

const validateLanguages = (languages: Locale[]) => {
  if (!Array.isArray(languages)) return false;
  return languages.every((language) => VALID_LANGUAGE_KEYS.has(language));
};

// GET: Fetch one app for the authenticated user
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

    return NextResponse.json(app[0]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch app" }, { status: 500 });
  }
};

// POST: Create a new app
export const POST = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, description, primaryColor, features, logoUrl } =
      await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "App name is required" },
        { status: 400 },
      );
    }

    if (!validateFeatures(features)) {
      return NextResponse.json(
        { error: "Invalid features provided" },
        { status: 400 },
      );
    }

    // Generate base slug
    let slug = name.toLowerCase().replace(/\s+/g, "-");

    // Check if slug already exists and modify if necessary
    let existingApp = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    while (existingApp.length > 0) {
      const randomSuffix = Math.floor(10 + Math.random() * 90); // Generate two random digits
      slug = `${slug}-${randomSuffix}`;
      existingApp = await db
        .select()
        .from(apps)
        .where(eq(apps.slug, slug))
        .limit(1);
    }

    const newApp = {
      id: id || uuidv7(),
      userId: session.user.id,
      name,
      slug,
      description,
      primaryColor,
      logoUrl,
      features: JSON.stringify(features || []),
      email: session.user.email,
      languages: '["en"]',
    };

    await db.insert(apps).values(newApp);

    await db.insert(appStores).values({
      id: uuidv7(),
      appId: newApp.id,
      storeData: "{}",
    });

    return NextResponse.json(newApp, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create app" },
      { status: 500 },
    );
  }
};

// PUT: Update an existing app
export const PUT = async (req: Request) => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      id,
      name,
      description,
      primaryColor,
      logoUrl,
      features,
      websiteUrl,
      email,
      languages,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 },
      );
    }

    if (!validateLanguages(languages)) {
      return NextResponse.json(
        { error: "Invalid language(s) provided" },
        { status: 400 },
      );
    }

    if (!validateFeatures(features)) {
      return NextResponse.json(
        { error: "Invalid features provided" },
        { status: 400 },
      );
    }

    const updatedFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(primaryColor && { primaryColor }),
      ...(email && { email }),
      ...(websiteUrl && { websiteUrl }),
      ...(logoUrl && { logoUrl }),
      ...(features && { features: JSON.stringify(features) }),
      ...(languages && {
        languages: JSON.stringify(
          languages.includes("en")
            ? ["en", ...languages.filter((l: Locale) => l !== "en")]
            : languages,
        ),
      }),
    };

    const result = await db
      .update(apps)
      .set(updatedFields)
      .where(eq(apps.id, id))
      .execute();

    if (!result) {
      return NextResponse.json(
        { error: "App not found or not updated" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "App updated successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed to update app" },
      { status: 500 },
    );
  }
};
