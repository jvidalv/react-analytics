/**
 * Core analytics functionality with simple init() API
 */

import { uuidv7 } from "uuidv7";
import { createStorageAdapter, type StorageAdapter } from "./storage";
import { getDeviceInfo, getAppVersion, type DeviceInfo } from "./device";
import { getDateForApi, logError, logEvent } from "./utils";
import { setupAppStateTracking } from "./app-state";
import type {
  ActionEvent,
  ErrorEvent,
  AnalyticsEvent,
  AnalyticsConfig,
  IdentifyEvent,
  NavigationEvent,
  StateEvent,
} from "./types";

const DEFAULT_API_URL = "https://expofast.app/api/analytics/push";
const STORAGE_KEY = "react-analytics_identify-id";

// Module-level state
let events: AnalyticsEvent[] = [];
let config: AnalyticsConfig | null = null;
let identifyId: string | null = null;
let userId: string | null = null;
let storage: StorageAdapter | null = null;
let deviceInfo: DeviceInfo | null = null;
let pushInterval: ReturnType<typeof setInterval> | null = null;
let appStateCleanup: (() => void) | null = null;

// Push management
let isPushingEvents = false;
let consecutiveFailures = 0;
let backoffUntil = 0;

/**
 * Initialize the identifyId from storage or create a new one
 */
async function initializeIdentifyId(): Promise<void> {
  if (!storage) return;

  try {
    const storedId = await storage.getItem(STORAGE_KEY);

    if (storedId) {
      identifyId = storedId;
    } else {
      identifyId = uuidv7();
      await storage.setItem(STORAGE_KEY, identifyId);
    }
  } catch (error) {
    console.error("[ReactAnalytics] Error initializing identifyId:", error);
    // Fallback to in-memory ID
    identifyId = uuidv7();
  }
}

/**
 * Push events to the analytics API
 */
async function pushEvents(): Promise<boolean> {
  try {
    if (Date.now() < backoffUntil) {
      return false;
    }

    if (!config || !identifyId || !deviceInfo) {
      return false;
    }

    const body = JSON.stringify({
      apiKey: config.apiKey,
      appVersion: config.appVersion || getAppVersion(),
      identifyId,
      userId,
      info: deviceInfo,
      events: events,
    });

    const response = await fetch(config.url || DEFAULT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Could not push events. API status: ${response.status}`);
    }

    consecutiveFailures = 0;
    return true;
  } catch (error) {
    consecutiveFailures++;

    if (config?.debug) {
      logError("On push event", error);
    }

    // Backoff after 5 consecutive failures
    if (consecutiveFailures >= 5) {
      backoffUntil = Date.now() + 60 * 1000; // 60 seconds
    }

    return false;
  }
}

/**
 * Try to push events to the API
 */
export async function tryToPushEvents(): Promise<void> {
  if (!config || isPushingEvents || !events.length || !identifyId) {
    return;
  }

  isPushingEvents = true;

  if (await pushEvents()) {
    events = [];
  }

  isPushingEvents = false;
}

/**
 * Start the automatic push queue
 */
function startPushQueue(): void {
  if (pushInterval) {
    clearInterval(pushInterval);
  }

  pushInterval = setInterval(tryToPushEvents, 5000);
}

/**
 * Stop the automatic push queue
 */
function stopPushQueue(): void {
  if (pushInterval) {
    clearInterval(pushInterval);
    pushInterval = null;
  }
}

/**
 * Setup app state tracking using platform-agnostic abstraction
 */
function initAppStateTracking(): void {
  if (config?.events?.disableStateEvents) {
    return;
  }

  const cleanup = setupAppStateTracking((active) => {
    state(active);
    void tryToPushEvents();
  });

  if (cleanup) {
    appStateCleanup = cleanup;
  }
}

/**
 * Cleanup app state tracking
 */
function cleanupAppStateTracking(): void {
  if (appStateCleanup) {
    appStateCleanup();
    appStateCleanup = null;
  }
}

/**
 * Setup page unload handler for web
 */
function setupPageUnloadHandler(): void {
  if (
    typeof window !== "undefined" &&
    typeof window.addEventListener === "function"
  ) {
    window.addEventListener("beforeunload", () => {
      void tryToPushEvents();
    });
  }
}

/**
 * Initialize the analytics library
 */
export async function init(configuration: AnalyticsConfig): Promise<void> {
  if (!configuration) {
    throw new Error("[ReactAnalytics] Configuration is required");
  }

  if (!configuration.apiKey) {
    throw new Error("[ReactAnalytics] API key is required");
  }

  // Set configuration
  config = {
    url: DEFAULT_API_URL,
    debug: false,
    ...configuration,
  };

  // Initialize storage
  storage = createStorageAdapter();

  // Initialize device info
  deviceInfo = getDeviceInfo();

  // Initialize identifyId
  await initializeIdentifyId();

  // Setup tracking
  initAppStateTracking();
  setupPageUnloadHandler();

  // Start push queue
  startPushQueue();

  if (config.debug) {
    console.log("[ReactAnalytics] Initialized successfully", {
      identifyId,
      deviceInfo,
    });
  }
}

/**
 * Cleanup and stop analytics tracking
 */
export function cleanup(): void {
  stopPushQueue();
  cleanupAppStateTracking();
  events = [];
  config = null;
  identifyId = null;
  userId = null;
}

/**
 * Track a user identity
 */
function identify(id: string, properties?: Record<string, unknown>): void {
  userId = id;

  const event: IdentifyEvent = {
    type: "identify",
    id,
    date: getDateForApi(),
    properties,
  };

  if (config?.debug) logEvent(event);
  events.push(event);
}

/**
 * Track app state changes
 */
export function state(active: boolean): void {
  const event: StateEvent = {
    type: "state",
    active,
    date: getDateForApi(),
  };

  if (config?.debug) logEvent(event);
  events.push(event);
}

/**
 * Track navigation/page changes
 */
export function navigation(
  path: string,
  properties?: Record<string, unknown>,
): void {
  const event: NavigationEvent = {
    type: "navigation",
    path,
    date: getDateForApi(),
    properties,
  };

  if (config?.debug) logEvent(event);
  events.push(event);
}

/**
 * Track a custom action
 */
function action(name: string, properties?: Record<string, unknown>): void {
  const event: ActionEvent = {
    type: "action",
    name,
    date: getDateForApi(),
    properties,
  };

  if (config?.debug) logEvent(event);

  const lastEvent = events[events?.length - 1];

  // Merge with last identify event properties if present
  if (lastEvent?.type === "identify") {
    events[events?.length - 1] = {
      ...event,
      properties: { ...lastEvent?.properties, ...event?.properties },
    };
  } else {
    events.push(event);
  }
}

/**
 * Track an error
 */
function error(message: string, properties?: Record<string, unknown>): void {
  const safeMessage =
    typeof message === "string" ? message : JSON.stringify(message);
  const cutMessage =
    safeMessage.length > 150 ? safeMessage.slice(0, 150) : message;

  const event: ErrorEvent = {
    type: "error",
    message: cutMessage,
    date: getDateForApi(),
    properties: {
      message,
      ...properties,
    },
  };

  if (config?.debug) logEvent(event);
  events.push(event);
}

/**
 * Track a page view (alias for navigation for manual tracking)
 */
function page(path: string, properties?: Record<string, unknown>): void {
  navigation(path, properties);
}

/**
 * Get current configuration
 */
export function getConfig(): AnalyticsConfig | null {
  return config;
}

/**
 * Global analytics object with all tracking methods
 */
export const analytics = {
  init,
  identify,
  action,
  error,
  page,
  cleanup,
};
