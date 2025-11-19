import { NextRequest, NextResponse } from "next/server";
import { refreshIdentifiedUsersMaterializedViews } from "@/api/utils/analytics";

/**
 * Vercel Cron Job to refresh materialized views
 * Runs every minute to keep the identified users views up-to-date
 *
 * This endpoint is called by Vercel Cron and should only be accessible
 * when called with the proper authorization header from Vercel.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");

    // In production, Vercel Cron sends: "Bearer <CRON_SECRET>"
    // Check if CRON_SECRET is set and matches
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("[Cron] Unauthorized request to refresh-views");
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      // If no CRON_SECRET is set, check if it's from Vercel
      const isFromVercel = authHeader?.startsWith("Bearer ");
      if (!isFromVercel) {
        console.error("[Cron] Missing authorization header");
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("[Cron] Starting materialized views refresh...");

    // Refresh the materialized views
    await refreshIdentifiedUsersMaterializedViews();

    return NextResponse.json({
      success: true,
      message: "Materialized views refreshed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error refreshing materialized views:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST method for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
