import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import { db } from "./db";
import { accounts, sessions, users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: {
    strategy: "database", // Uses Drizzle sessions table
    maxAge: 10 * 365 * 24 * 60 * 60, // 👈 Set to 10 years (seconds)
  },
  providers: [Google, Apple, GitHub],
  pages: {
    signIn: "/join",
  },
});
