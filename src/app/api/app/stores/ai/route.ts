import { NextResponse } from "next/server";
import { apps, aiRequests } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { OpenAI } from "openai";
import { ALL_LANGUAGES } from "@/lib/languages";
import { FieldName, MAX_CHARACTERS, TONE_STYLES, ToneStyle } from "@/lib/ai";
import { Platform } from "@/lib/platforms";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ALLOWED_PLATFORMS = ["ios", "android"] as const;
const ALLOWED_FIELDS = ["shortDescription", "description"] as const;
const REQUEST_LIMITS = { perMinute: 5, perDay: 20, perMonth: 100 };

const getRequestCount = async (userId: string, duration: number) => {
  const dateLimit = new Date(Date.now() - duration);
  const requests = await db
    .select({ id: aiRequests.id })
    .from(aiRequests)
    .where(
      and(eq(aiRequests.userId, userId), gte(aiRequests.createdAt, dateLimit)),
    );

  return requests.length;
};

export const POST = async (req: Request) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, language, tone, fieldName, platform } = await req.json();

  if (!slug || !language || !tone || !fieldName || !platform) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (
    !ALLOWED_PLATFORMS.includes(platform) ||
    !ALLOWED_FIELDS.includes(fieldName)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const app = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);

  if (!app.length) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const requestLog = await db
    .insert(aiRequests)
    .values({
      userId,
      status: "pending",
    })
    .returning({ id: aiRequests.id });

  const requestId = requestLog[0]?.id;

  // **Rate Limiting Check**
  const [requestsPerMinute, requestsPerDay, requestsPerMonth] =
    await Promise.all([
      getRequestCount(userId, 60 * 1000), // 1 min
      getRequestCount(userId, 24 * 60 * 60 * 1000), // 1 day
      getRequestCount(userId, 30 * 24 * 60 * 60 * 1000), // 1 month
    ]);

  if (
    requestsPerMinute >= REQUEST_LIMITS.perMinute ||
    requestsPerDay >= REQUEST_LIMITS.perDay ||
    requestsPerMonth >= REQUEST_LIMITS.perMonth
  ) {
    await db
      .update(aiRequests)
      .set({ status: "rejected" })
      .where(eq(aiRequests.id, requestId));

    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const validLanguage = ALL_LANGUAGES.find(
      (lang) => lang.locale === language,
    );
    if (!validLanguage) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    const TONE_STYLE = TONE_STYLES[tone as ToneStyle];
    if (!TONE_STYLE) {
      return NextResponse.json({ error: "Invalid tone" }, { status: 400 });
    }

    const maxLength =
      MAX_CHARACTERS[fieldName as FieldName][platform as Platform];

    let prompt = `Generate a ${TONE_STYLE} description for a mobile app in ${validLanguage.name}.`;
    prompt += `\n\nThe description should be within ${maxLength} characters and optimized for the ${platform === "ios" ? "Apple App Store" : "Google Play Store"}.`;
    prompt += `\n\nApp details:\n- Name: ${app[0].name}\n- Description: ${app[0].description || "No description available"}`;

    if (platform === "ios") prompt += `\n\nImportant: Do not use emojis.`;

    await db
      .update(aiRequests)
      .set({ prompt })
      .where(eq(aiRequests.id, requestId));

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      max_tokens: Math.floor(maxLength / 2),
      temperature: 0.7,
    });

    const generatedText = aiResponse.choices[0]?.message?.content
      ?.trim()
      .replace(/^"|"$/g, "");

    if (!generatedText) {
      await db
        .update(aiRequests)
        .set({ status: "failed" })
        .where(eq(aiRequests.id, requestId));

      return NextResponse.json(
        { error: "AI failed to generate text" },
        { status: 500 },
      );
    }

    await db
      .update(aiRequests)
      .set({ status: "success", response: generatedText })
      .where(eq(aiRequests.id, requestId));

    return NextResponse.json({ text: generatedText });
  } catch {
    await db
      .update(aiRequests)
      .set({ status: "failed" })
      .where(eq(aiRequests.id, requestId));
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 },
    );
  }
};
