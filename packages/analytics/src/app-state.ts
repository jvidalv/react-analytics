/**
 * Platform-agnostic app state tracking abstraction
 * Handles active/inactive state changes across web and React Native
 */

export type StateChangeCallback = (active: boolean) => void;

/**
 * Detects if we're running in a React Native environment
 */
function isReactNative(): boolean {
  return (
    typeof navigator !== "undefined" && navigator.product === "ReactNative"
  );
}

/**
 * Setup app state tracking for React Native
 * Uses AppState API to track when app goes to background/foreground
 */
function setupReactNativeAppState(
  onStateChange: StateChangeCallback,
): (() => void) | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AppState } = require("react-native");

    let lastActiveMovementDate: Date | null = null;
    let lastInactiveMovementDate: Date | null = null;

    const shouldFireActiveStateEvent = () => {
      if (!lastActiveMovementDate) return true;
      return lastActiveMovementDate.getTime() + 1500 < Date.now();
    };

    const shouldFireInactiveStateEvent = () => {
      if (!lastInactiveMovementDate) return true;
      return lastInactiveMovementDate.getTime() + 1500 < Date.now();
    };

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: string) => {
        if (nextAppState === "active") {
          if (!shouldFireActiveStateEvent()) return;
          lastActiveMovementDate = new Date();
          onStateChange(true);
        }

        if (nextAppState === "inactive") {
          if (!shouldFireInactiveStateEvent()) return;
          lastInactiveMovementDate = new Date();
          onStateChange(false);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  } catch (error) {
    console.warn(
      "[ReactAnalytics] React Native AppState not available:",
      error,
    );
    return null;
  }
}

/**
 * Setup app state tracking for web
 * Uses Page Visibility API to track when user switches tabs/minimizes
 */
function setupWebAppState(
  onStateChange: StateChangeCallback,
): (() => void) | null {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof window.addEventListener !== "function"
  ) {
    return null;
  }

  try {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      onStateChange(isVisible);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also track page focus/blur
    const handleFocus = () => onStateChange(true);
    const handleBlur = () => onStateChange(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  } catch (error) {
    console.warn(
      "[ReactAnalytics] Web app state tracking not available:",
      error,
    );
    return null;
  }
}

/**
 * Setup app state tracking for the current platform
 * Automatically detects platform and sets up appropriate listeners
 *
 * @param onStateChange - Callback invoked when app state changes (true = active, false = inactive)
 * @returns Cleanup function to remove listeners, or null if setup failed
 */
export function setupAppStateTracking(
  onStateChange: StateChangeCallback,
): (() => void) | null {
  if (isReactNative()) {
    return setupReactNativeAppState(onStateChange);
  }

  return setupWebAppState(onStateChange);
}
