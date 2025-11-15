import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  name: text(),
  email: text().notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text(),
  plan: text().default("free"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull(),
  productId: text().notNull(),
  productName: text().default("free").notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const sessions = pgTable("session", {
  sessionToken: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const apps = pgTable("apps", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  logoUrl: text(),
  description: text(),
  primaryColor: text(),
  features: text().default("[]"),
  websiteUrl: text(),
  email: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const aiRequests = pgTable("ai_requests", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  prompt: jsonb("prompt"),
  response: jsonb("response"),
  status: text().default("pending").notNull(), // Can be "pending", "success", "failed", or "rejected"
  createdAt: timestamp().notNull().defaultNow(),
});

export const analyticsApiKeys = pgTable("analytics_api_keys", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  appId: uuid()
    .notNull()
    .references(() => apps.id, { onDelete: "cascade" }),
  apiKey: uuid("api_key").notNull().defaultRandom().unique(),
  apiKeyTest: uuid("api_key_test").notNull().defaultRandom().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const analytics = pgTable(
  "analytics",
  {
    id: uuid().primaryKey().defaultRandom(),
    identifyId: text("identify_id").notNull(),
    userId: text("user_id"),
    type: text("type")
      .notNull()
      .$type<"navigation" | "identify" | "action" | "state" | "error">(),
    properties: jsonb("properties").notNull(),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    info: jsonb("info").default({}),
    appVersion: text("app_version").default("0.0.0").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    apiKey: uuid()
      .notNull()
      .references(() => analyticsApiKeys.apiKey, { onDelete: "cascade" }),
  },
  (table) => ({
    idxApiKeyIdentifyIdDate: index("idx_analytics_api_key_identify_id_date").on(
      table.apiKey,
      table.identifyId,
      table.date.desc(),
    ),
    idxIdentifyIdTypeDate: index("idx_analytics_identify_id_type_date").on(
      table.identifyId,
      table.type,
      table.date.desc(),
    ),
  }),
);

export const analyticsTest = pgTable(
  "analytics_test",
  {
    id: uuid().primaryKey().defaultRandom(),
    identifyId: text("identify_id").notNull(),
    userId: text("user_id"),
    type: text("type")
      .notNull()
      .$type<"navigation" | "identify" | "action" | "state" | "error">(),
    properties: jsonb("properties").notNull(),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    info: jsonb("info").default({}),
    appVersion: text("app_version").default("0.0.0").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    apiKey: uuid()
      .notNull()
      .references(() => analyticsApiKeys.apiKeyTest, { onDelete: "cascade" }),
  },
  (table) => ({
    idxApiKeyIdentifyIdDate: index(
      "idx_analytics_test_api_key_identify_id_date",
    ).on(table.apiKey, table.identifyId, table.date.desc()),
    idxIdentifyIdTypeDate: index("idx_analytics_test_identify_id_type_date").on(
      table.identifyId,
      table.type,
      table.date.desc(),
    ),
  }),
);
