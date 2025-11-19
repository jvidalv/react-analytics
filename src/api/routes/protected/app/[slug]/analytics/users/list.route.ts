import { Elysia, t } from "elysia";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getAnalyticsTable } from "@/api/utils/analytics";

// Response schemas
const UserSchema = t.Object({
  identifyId: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  name: t.Union([t.String(), t.Null()]),
  email: t.Union([t.String(), t.Null()]),
  avatar: t.Union([t.String(), t.Null()]),
  isIdentified: t.Boolean(),
  lastSeen: t.String(), // ISO date string
});

const PaginationSchema = t.Object({
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
  totalPages: t.Number(),
});

const UsersListResponseSchema = t.Object({
  users: t.Array(UserSchema),
  pagination: PaginationSchema,
});

export const usersListRoute = new Elysia().get(
  "/list",
  async ({ store, query }) => {
    // Access from store (set by parent route)
    const apiKey = (store as any).apiKey as string;
    const isTest = (store as any).isTest as boolean;

    // Get query parameters
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "50", 10);
    const search = query.search || "";
    const platformFilter = query.platform || "";
    const countryFilter = query.country || "";
    const versionFilter = query.version || "";

    // Get correct table (production or test)
    const targetTable = getAnalyticsTable(isTest);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build search condition
    const searchCondition =
      search.length > 0
        ? sql`AND (
          properties->'data'->>'name' ILIKE ${'%' + search + '%'} OR
          properties->'data'->>'email' ILIKE ${'%' + search + '%'} OR
          properties->'data'->>'firstName' ILIKE ${'%' + search + '%'} OR
          properties->'data'->>'lastName' ILIKE ${'%' + search + '%'}
        )`
        : sql``;

    // Build filter conditions
    const platformCondition = platformFilter
      ? sql`AND (
          CASE
            WHEN info->>'platform' = 'ios' THEN 'iOS'
            WHEN info->>'platform' = 'android' THEN 'Android'
            WHEN info->>'platform' = 'web' AND (
              info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
              info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
            ) THEN 'iOS'
            WHEN info->>'platform' = 'web' AND
              info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'Android'
            ELSE 'Web'
          END = ${platformFilter}
        )`
      : sql``;

    const countryCondition = countryFilter
      ? sql`AND info->'requestMetadata'->>'country' = ${countryFilter}`
      : sql``;

    const versionCondition = versionFilter
      ? sql`AND app_version = ${versionFilter}`
      : sql``;

    // Get total count
    const countResult = await db.execute(sql`
      SELECT COUNT(DISTINCT identify_id) as total
      FROM ${targetTable}
      WHERE api_key = ${apiKey}
        AND type = 'identify'
      ${searchCondition}
      ${platformCondition}
      ${countryCondition}
      ${versionCondition}
    `);

    const total = Number((countResult[0] as any)?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Get users with pagination
    const usersResult = await db.execute(sql`
      SELECT
        identify_id,
        user_id,
        COALESCE(
          properties->'data'->>'name',
          NULLIF(TRIM(COALESCE(properties->'data'->>'firstName', '') || ' ' || COALESCE(properties->'data'->>'lastName', '')), '')
        ) as name,
        properties->'data'->>'email' as email,
        COALESCE(
          properties->'data'->>'avatarUrl',
          properties->'data'->>'avatar'
        ) as avatar,
        app_version,
        info->'requestMetadata'->>'country' as country,
        CASE
          WHEN info->>'platform' = 'ios' THEN 'iOS'
          WHEN info->>'platform' = 'android' THEN 'Android'
          WHEN info->>'platform' = 'web' AND (
            info->'requestMetadata'->>'userAgent' LIKE '%iPhone%' OR
            info->'requestMetadata'->>'userAgent' LIKE '%iPad%'
          ) THEN 'iOS'
          WHEN info->>'platform' = 'web' AND
            info->'requestMetadata'->>'userAgent' LIKE '%Android%' THEN 'Android'
          ELSE 'Web'
        END as platform,
        date as last_seen
      FROM (
        SELECT DISTINCT ON (identify_id)
          identify_id,
          user_id,
          properties,
          app_version,
          info,
          date
        FROM ${targetTable}
        WHERE api_key = ${apiKey}
          AND type = 'identify'
          ${searchCondition}
          ${platformCondition}
          ${countryCondition}
          ${versionCondition}
        ORDER BY identify_id, date DESC
      ) sub
      ORDER BY last_seen DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Map results to user objects
    const users = (usersResult as any[]).map((row) => ({
      identifyId: row.identify_id,
      userId: row.user_id,
      name: row.name || null,
      email: row.email || null,
      avatar: row.avatar || null,
      isIdentified: row.user_id !== null,
      lastSeen: row.last_seen ? new Date(row.last_seen).toISOString() : new Date().toISOString(),
      country: row.country || null,
      platform: row.platform || 'Web',
      appVersion: row.app_version || '0.0.0',
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
      search: t.Optional(t.String()),
      platform: t.Optional(t.String()),
      country: t.Optional(t.String()),
      version: t.Optional(t.String()),
    }),
    // response: UsersListResponseSchema,
    detail: {
      summary: "Get paginated list of users",
      description:
        "Returns a paginated list of both identified and anonymous users with search capability",
      tags: ["Analytics"],
    },
  }
);
