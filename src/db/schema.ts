import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { jsonb } from "drizzle-orm/pg-core";

// Single source of truth for message status values
export const MESSAGE_STATUS_VALUES = ["new", "seen", "completed"] as const;
export type MessageStatusType = (typeof MESSAGE_STATUS_VALUES)[number];

// Single source of truth for error status values
export const ERROR_STATUS_VALUES = ["new", "seen", "fixed"] as const;
export type ErrorStatusType = (typeof ERROR_STATUS_VALUES)[number];

export const users = pgTable("user", {
  id: uuid().primaryKey().defaultRandom(),
  name: text(),
  email: text().notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text(),
  plan: text().default("free"),
  devModeEnabled: boolean().default(true).notNull(),
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
  description: text(),
  primaryColor: text(),
  features: text().default("[]"),
  websiteUrl: text(),
  email: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const analyticsApiKeys = pgTable("analytics_api_keys", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  appId: uuid()
    .notNull()
    .references(() => apps.id, { onDelete: "cascade" }),
  apiKey: text("api_key").notNull().unique(),
  apiKeyTest: text("api_key_test").notNull().unique(),
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
      .$type<
        "navigation" | "identify" | "action" | "state" | "error" | "message"
      >(),
    properties: jsonb("properties").notNull(),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    info: jsonb("info").default({}),
    appVersion: text("app_version").default("0.0.0").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    apiKey: text()
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
      .$type<
        "navigation" | "identify" | "action" | "state" | "error" | "message"
      >(),
    properties: jsonb("properties").notNull(),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    info: jsonb("info").default({}),
    appVersion: text("app_version").default("0.0.0").notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    apiKey: text()
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

// Materialized view for identified users (production)
export const analyticsIdentifiedUsersMv = pgTable(
  "analytics_identified_users_mv",
  {
    apiKey: text("api_key").notNull(),
    identifyId: text("identify_id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name"),
    email: text("email"),
    avatar: text("avatar"),
    platform: text("platform"),
    country: text("country"),
    appVersion: text("app_version"),
    firstSeen: timestamp("first_seen", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    lastSeen: timestamp("last_seen", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
);

// Materialized view for identified users (test)
export const analyticsTestIdentifiedUsersMv = pgTable(
  "analytics_test_identified_users_mv",
  {
    apiKey: text("api_key").notNull(),
    identifyId: text("identify_id").notNull(),
    userId: text("user_id").notNull(),
    name: text("name"),
    email: text("email"),
    avatar: text("avatar"),
    platform: text("platform"),
    country: text("country"),
    appVersion: text("app_version"),
    firstSeen: timestamp("first_seen", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    lastSeen: timestamp("last_seen", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
);

// Message status tracking (production)
export const messageStatus = pgTable(
  "message_status",
  {
    id: uuid().primaryKey().defaultRandom(),
    analyticsId: uuid("analytics_id")
      .notNull()
      .references(() => analytics.id, { onDelete: "cascade" }),
    apiKey: text("api_key")
      .notNull()
      .references(() => analyticsApiKeys.apiKey, { onDelete: "cascade" }),
    status: text("status").notNull().default("new").$type<MessageStatusType>(),
    notes: text("notes"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    idxAnalyticsId: index("idx_message_status_analytics_id").on(
      table.analyticsId,
    ),
    idxApiKeyStatus: index("idx_message_status_api_key_status").on(
      table.apiKey,
      table.status,
    ),
  }),
);

// Message status tracking (test)
export const messageStatusTest = pgTable(
  "message_status_test",
  {
    id: uuid().primaryKey().defaultRandom(),
    analyticsId: uuid("analytics_id")
      .notNull()
      .references(() => analyticsTest.id, { onDelete: "cascade" }),
    apiKey: text("api_key")
      .notNull()
      .references(() => analyticsApiKeys.apiKeyTest, { onDelete: "cascade" }),
    status: text("status").notNull().default("new").$type<MessageStatusType>(),
    notes: text("notes"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    idxAnalyticsId: index("idx_message_status_test_analytics_id").on(
      table.analyticsId,
    ),
    idxApiKeyStatus: index("idx_message_status_test_api_key_status").on(
      table.apiKey,
      table.status,
    ),
  }),
);

// Error status tracking (production)
export const errorStatus = pgTable(
  "error_status",
  {
    id: uuid().primaryKey().defaultRandom(),
    analyticsId: uuid("analytics_id")
      .notNull()
      .references(() => analytics.id, { onDelete: "cascade" }),
    apiKey: text("api_key")
      .notNull()
      .references(() => analyticsApiKeys.apiKey, { onDelete: "cascade" }),
    status: text("status").notNull().default("new").$type<ErrorStatusType>(),
    notes: text("notes"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    idxAnalyticsId: index("idx_error_status_analytics_id").on(
      table.analyticsId,
    ),
    idxApiKeyStatus: index("idx_error_status_api_key_status").on(
      table.apiKey,
      table.status,
    ),
  }),
);

// Error status tracking (test)
export const errorStatusTest = pgTable(
  "error_status_test",
  {
    id: uuid().primaryKey().defaultRandom(),
    analyticsId: uuid("analytics_id")
      .notNull()
      .references(() => analyticsTest.id, { onDelete: "cascade" }),
    apiKey: text("api_key")
      .notNull()
      .references(() => analyticsApiKeys.apiKeyTest, { onDelete: "cascade" }),
    status: text("status").notNull().default("new").$type<ErrorStatusType>(),
    notes: text("notes"),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    idxAnalyticsId: index("idx_error_status_test_analytics_id").on(
      table.analyticsId,
    ),
    idxApiKeyStatus: index("idx_error_status_test_api_key_status").on(
      table.apiKey,
      table.status,
    ),
  }),
);
