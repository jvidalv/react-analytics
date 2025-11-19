#!/usr/bin/env tsx

/**
 * Local Cron Task Runner
 *
 * This script simulates Vercel's cron behavior for local development.
 * It calls the cron API routes with proper authorization headers.
 *
 * Usage:
 *   npm run cron:refresh-views
 *   npm run cron <task-name>
 */

const CRON_TASKS = {
  "refresh-views": "/api/cron/refresh-views",
} as const;

type CronTask = keyof typeof CRON_TASKS;

async function runCronTask(taskName: string) {
  // Validate task name
  if (!(taskName in CRON_TASKS)) {
    console.error(`❌ Unknown cron task: ${taskName}`);
    console.log(`Available tasks: ${Object.keys(CRON_TASKS).join(", ")}`);
    process.exit(1);
  }

  const path = CRON_TASKS[taskName as CronTask];
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}${path}`;

  console.log(`\n🕐 Running cron task: ${taskName}`);
  console.log(`📍 URL: ${url}`);
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  try {
    const startTime = Date.now();

    // Make request with authorization header (simulating Vercel)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": process.env.CRON_SECRET
          ? `Bearer ${process.env.CRON_SECRET}`
          : "Bearer local-dev-token",
        "Content-Type": "application/json",
      },
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success (${response.status}) - ${duration}ms\n`);
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ Error (${response.status}) - ${duration}ms\n`);
      console.error("Response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Request failed:\n`);
    console.error(error);
    process.exit(1);
  }
}

// Get task name from command line arguments
const taskName = process.argv[2];

if (!taskName) {
  console.error("❌ Please provide a cron task name");
  console.log(`\nUsage: npm run cron <task-name>`);
  console.log(`Available tasks: ${Object.keys(CRON_TASKS).join(", ")}`);
  process.exit(1);
}

runCronTask(taskName);
