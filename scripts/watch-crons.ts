#!/usr/bin/env tsx

/**
 * Cron Watcher for Local Development
 *
 * This script continuously runs cron tasks at specified intervals
 * to replicate production behavior during local development.
 *
 * Usage:
 *   npm run cron:watch
 *   Or automatically via: npm run dev
 */

const CRON_TASKS = [
  {
    name: "refresh-views",
    path: "/api/cron/refresh-views",
    intervalMinutes: 1, // Run every minute (like production)
  },
];

async function runCronTask(taskName: string, path: string) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}${path}`;

  try {
    const startTime = Date.now();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: process.env.CRON_SECRET
          ? `Bearer ${process.env.CRON_SECRET}`
          : "Bearer local-dev-token",
        "Content-Type": "application/json",
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(
        `✅ [${new Date().toLocaleTimeString()}] ${taskName} completed in ${duration}ms`
      );
    } else {
      console.error(
        `❌ [${new Date().toLocaleTimeString()}] ${taskName} failed (${response.status}) - ${duration}ms`
      );
      console.error("   Error:", data.error || data.message);
    }
  } catch (error) {
    console.error(
      `❌ [${new Date().toLocaleTimeString()}] ${taskName} failed:`,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

async function waitForServer(maxRetries = 30, retryDelay = 1000) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(baseUrl, { method: "HEAD" });
      if (response.ok || response.status === 404) {
        console.log("✅ Dev server is ready, starting cron watcher...\n");
        return true;
      }
    } catch (error) {
      // Server not ready yet
      if (i === 0) {
        console.log("⏳ Waiting for dev server to start...");
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.error("❌ Dev server failed to start after 30 seconds");
  return false;
}

async function main() {
  console.log("🕐 Cron Watcher starting...\n");

  // Wait for dev server to be ready
  const serverReady = await waitForServer();
  if (!serverReady) {
    process.exit(1);
  }

  // Schedule each cron task
  const intervals: NodeJS.Timeout[] = [];

  for (const task of CRON_TASKS) {
    console.log(
      `📅 Scheduling ${task.name} to run every ${task.intervalMinutes} minute(s)`
    );

    // Run immediately on start
    await runCronTask(task.name, task.path);

    // Then schedule to run at intervals
    const interval = setInterval(
      async () => {
        await runCronTask(task.name, task.path);
      },
      task.intervalMinutes * 60 * 1000
    );

    intervals.push(interval);
  }

  console.log("\n✅ Cron watcher is running. Press CTRL+C to stop.\n");

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n🛑 Stopping cron watcher...");
    intervals.forEach((interval) => clearInterval(interval));
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n\n🛑 Stopping cron watcher...");
    intervals.forEach((interval) => clearInterval(interval));
    process.exit(0);
  });
}

main();
