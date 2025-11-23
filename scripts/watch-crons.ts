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

import {
  CRON_TASKS_CONFIG,
  CronTaskName,
  runCronTaskRequest,
} from "./cron-shared";

async function runCronTask(taskName: string, path: string) {
  const result = await runCronTaskRequest(taskName, path);

  if (result.success) {
    console.log(
      `✅ [${new Date().toLocaleTimeString()}] ${taskName} completed in ${result.duration}ms`,
    );
  } else {
    console.error(
      `❌ [${new Date().toLocaleTimeString()}] ${taskName} failed - ${result.duration}ms`,
    );
    console.error(
      "   Error:",
      result.error?.error || result.error?.message || result.error,
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

  // Convert config object to array for iteration
  for (const [taskName, config] of Object.entries(CRON_TASKS_CONFIG)) {
    console.log(
      `📅 Scheduling ${taskName} to run every ${config.intervalMinutes} minute(s)`,
    );

    // Run immediately on start
    await runCronTask(taskName, config.path);

    // Then schedule to run at intervals
    const interval = setInterval(
      async () => {
        await runCronTask(taskName, config.path);
      },
      config.intervalMinutes * 60 * 1000,
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
