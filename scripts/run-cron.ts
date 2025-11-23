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

import {
  CRON_TASKS_CONFIG,
  CronTaskName,
  runCronTaskRequest,
} from "./cron-shared";

async function runCronTask(taskName: string) {
  // Validate task name
  if (!(taskName in CRON_TASKS_CONFIG)) {
    console.error(`❌ Unknown cron task: ${taskName}`);
    console.log(
      `Available tasks: ${Object.keys(CRON_TASKS_CONFIG).join(", ")}`,
    );
    process.exit(1);
  }

  const config = CRON_TASKS_CONFIG[taskName as CronTaskName];
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const url = `${baseUrl}${config.path}`;

  console.log(`\n🕐 Running cron task: ${taskName}`);
  console.log(`📍 URL: ${url}`);
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  const result = await runCronTaskRequest(taskName, config.path);

  if (result.success) {
    console.log(`✅ Success - ${result.duration}ms\n`);
    console.log("Response:", JSON.stringify(result.data, null, 2));
  } else {
    console.error(`❌ Error - ${result.duration}ms\n`);
    console.error("Response:", JSON.stringify(result.error, null, 2));
    process.exit(1);
  }
}

// Get task name from command line arguments
const taskName = process.argv[2];

if (!taskName) {
  console.error("❌ Please provide a cron task name");
  console.log(`\nUsage: npm run cron <task-name>`);
  console.log(`Available tasks: ${Object.keys(CRON_TASKS_CONFIG).join(", ")}`);
  process.exit(1);
}

runCronTask(taskName);
