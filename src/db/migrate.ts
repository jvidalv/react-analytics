import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const runMigrations = async () => {
  // Skip migrations on Vercel Preview deployments
  if (process.env.VERCEL_ENV === "preview") {
    console.log("⏭️  Skipping migrations on preview deployment");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not defined");
    process.exit(1);
  }

  console.log("🚀 Starting database migrations...");

  // Create a dedicated client for migrations with a single connection
  const migrationClient = postgres(databaseUrl, {
    max: 1,
    onnotice: () => {}, // Suppress notices during migration
  });

  try {
    const db = drizzle(migrationClient, { casing: "snake_case" });

    // Run all pending migrations from ./drizzle folder
    await migrate(db, { migrationsFolder: "./drizzle" });

    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Always close the connection
    await migrationClient.end();
  }
};

// Execute migrations
runMigrations().catch((err) => {
  console.error("❌ Unexpected error during migration:", err);
  process.exit(1);
});
