import { NextResponse } from "next/server";
import { apps, aiRequests } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { OpenAI } from "openai";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const REQUEST_LIMITS = { perMinute: 10, perDay: 30, perMonth: 100 };

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

const sanitizeAIResponse = (raw: string): string =>
  raw
    .trim()
    .replace(/^```(json)?/, "")
    .replace(/```$/, "")
    .trim();

export const POST = async (req: Request) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    slug,
    language,
    entries,
  }: { slug: string; language: Locale; entries: Record<string, string> } =
    await req.json();

  if (!slug || !language || !entries || typeof entries !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid parameters" },
      { status: 400 },
    );
  }

  const app = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);
  if (!app.length) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const languageInfo = ALL_LANGUAGES.find((l) => l.locale === language);
  if (!languageInfo) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  const requestLog = await db
    .insert(aiRequests)
    .values({ userId, status: "pending" })
    .returning({ id: aiRequests.id });
  const requestId = requestLog[0].id;

  const [perMinute, perDay, perMonth] = await Promise.all([
    getRequestCount(userId, 60 * 1000),
    getRequestCount(userId, 24 * 60 * 60 * 1000),
    getRequestCount(userId, 30 * 24 * 60 * 60 * 1000),
  ]);

  if (
    perMinute >= REQUEST_LIMITS.perMinute ||
    perDay >= REQUEST_LIMITS.perDay ||
    perMonth >= REQUEST_LIMITS.perMonth
  ) {
    await db
      .update(aiRequests)
      .set({ status: "rejected" })
      .where(eq(aiRequests.id, requestId));
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const entriesText = JSON.stringify(entries, null, 2);
    const prompt = `
You are a professional translator. Your task is to translate the following JSON object values into ${languageInfo.name}.

RULES:
- Keep all key names exactly the same.
- DO NOT translate or modify placeholders inside double curly brackets like {{name}}, {{count}}, etc.
- Translate only the text values.
- DO NOT include explanations or comments.
- Return ONLY a valid JSON object. DO NOT wrap it in \`\`\`json or \`\`\`.
- Do NOT add line breaks or extra text before or after.

App context:
- Name: ${app[0].name}
- Description: ${app[0].description || "No description"}

JSON to translate:
${entriesText}
`.trim();

    await db
      .update(aiRequests)
      .set({ prompt })
      .where(eq(aiRequests.id, requestId));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    const cleaned = sanitizeAIResponse(raw || "");

    let parsed: Record<string, string> | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      await db
        .update(aiRequests)
        .set({ status: "failed", response: raw })
        .where(eq(aiRequests.id, requestId));
      return NextResponse.json(
        { error: "Invalid AI response format", raw },
        { status: 500 },
      );
    }

    await db
      .update(aiRequests)
      .set({ status: "success", response: parsed })
      .where(eq(aiRequests.id, requestId));

    return NextResponse.json({ translations: parsed });
  } catch {
    await db
      .update(aiRequests)
      .set({ status: "failed" })
      .where(eq(aiRequests.id, requestId));
    return NextResponse.json(
      { error: "Failed to generate translations" },
      { status: 500 },
    );
  }
};
