import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql, eq, gte, desc, count } from "drizzle-orm";
import { getIdentifiedUsersMv } from "@/api/utils/analytics";

// Response schemas
const NewJoinerSchema = t.Object({
  identifyId: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  name: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  avatar: t.Union([t.String(), t.Null()]),
  platform: t.Union([t.String(), t.Null()]),
  country: t.Union([t.String(), t.Null()]),
  appVersion: t.Union([t.String(), t.Null()]),
  isIdentified: t.Boolean(),
  firstSeen: t.String(), // ISO date string
  lastSeen: t.String(), // ISO date string
});

const PaginationSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

const NewJoinersResponseSchema = t.Object({
  users: t.Array(NewJoinerSchema),
  pagination: PaginationSchema,
});

export const newJoinersRoute = new Elysia().get(
  "/new-joiners",
  async ({ store, query }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get query parameters
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "25", 10);

    // Get correct materialized view
    const identifiedUsersMv = getIdentifiedUsersMv(isTest);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Always show last week (7 days)
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    // Get total count using Drizzle ORM
    const countResult = await db
      .select({ count: count() })
      .from(identifiedUsersMv)
      .where(
        sql`${identifiedUsersMv.apiKey} = ${apiKey} AND ${identifiedUsersMv.firstSeen} >= ${startDate.toISOString()}`,
      );

    const total = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results using Drizzle ORM
    const usersResult = await db
      .select({
        identifyId: identifiedUsersMv.identifyId,
        userId: identifiedUsersMv.userId,
        name: identifiedUsersMv.name,
        email: identifiedUsersMv.email,
        avatar: identifiedUsersMv.avatar,
        platform: identifiedUsersMv.platform,
        country: identifiedUsersMv.country,
        appVersion: identifiedUsersMv.appVersion,
        firstSeen: identifiedUsersMv.firstSeen,
        lastSeen: identifiedUsersMv.lastSeen,
      })
      .from(identifiedUsersMv)
      .where(
        sql`${identifiedUsersMv.apiKey} = ${apiKey} AND ${identifiedUsersMv.firstSeen} >= ${startDate.toISOString()}`,
      )
      .orderBy(desc(identifiedUsersMv.firstSeen))
      .limit(limit)
      .offset(offset);

    // Map results to user objects
    const users = usersResult.map((row) => ({
      identifyId: row.identifyId,
      userId: row.userId,
      name: row.name || null,
      email: row.email || null,
      avatar: row.avatar || null,
      platform: row.platform || null,
      country: row.country || null,
      appVersion: row.appVersion || null,
      isIdentified: true, // All users from this view are identified
      firstSeen: row.firstSeen
        ? new Date(row.firstSeen).toISOString()
        : new Date().toISOString(),
      lastSeen: row.lastSeen
        ? new Date(row.lastSeen).toISOString()
        : new Date().toISOString(),
    }));

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },
  {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
    // response: NewJoinersResponseSchema,
    detail: {
      summary: "Get new joiners list",
      description:
        "Returns a paginated list of new users (those whose first event was in the last week)",
      tags: ["Analytics"],
    },
  },
);
