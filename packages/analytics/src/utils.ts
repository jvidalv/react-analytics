import { AnalyticsEvent } from "./types";

export const getPathParams = (segments: string[], pathname: string) => {
  const pathParts = pathname.split("/").filter(Boolean);
  const params: Record<string, string> = {};

  segments.forEach((segment, index) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      const paramName = segment.slice(1, -1);
      params[paramName] = pathParts[index] || "";
    }
  });

  return params;
};

export const logEvent = (event: AnalyticsEvent) => {
  console.log(`[ReactAnalytics] ⚡`, `Event: ${event.type}`, event);
};

export const logError = (errorStep: string, error: unknown) => {
  console.log(`[ReactAnalytics] ❌`, `Error: ${errorStep}`, error);
};

export const getDateForApi = () => new Date().toISOString();
