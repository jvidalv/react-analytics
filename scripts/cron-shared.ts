/**
 * Shared cron task configuration and utilities
 */

export const CRON_TASKS_CONFIG = {
  "refresh-views": {
    path: "/api/cron/refresh-views",
    intervalMinutes: 1, // Run every minute (like production)
  },
} as const;

export type CronTaskName = keyof typeof CRON_TASKS_CONFIG;

export async function runCronTaskRequest(
  taskName: string,
  path: string,
): Promise<{ success: boolean; duration: number; data?: any; error?: any }> {
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

    return {
      success: response.ok,
      duration,
      data,
      error: response.ok ? undefined : data,
    };
  } catch (error) {
    return {
      success: false,
      duration: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
