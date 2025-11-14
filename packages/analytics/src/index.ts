/**
 * React Analytics - Universal analytics library for React applications
 */

// Main analytics API
export { analytics } from "./core";

// Provider component
export { default as AnalyticsProvider } from "./analytics-provider";

// Router tracking components
export {
  RouterTracker,
  ExpoRouterTracker,
  ReactRouterTracker,
  NextAppRouterTracker,
  NextPagesRouterTracker,
  detectRouter,
  type RouterType,
  type NavigationCallback,
} from "./router";

// Type exports
export * from "./types";
