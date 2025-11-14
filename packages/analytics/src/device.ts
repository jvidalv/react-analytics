/**
 * Universal device information detection for web and React Native platforms
 */

export interface DeviceInfo {
  platform: "ios" | "android" | "web" | "unknown";
  osVersion?: string;
  brand?: string;
  modelName?: string;
  isSimulator?: boolean;
  androidPlatformApiLevel?: number;
}

/**
 * Detects if we're running in a React Native environment
 */
function isReactNative(): boolean {
  return (
    typeof navigator !== "undefined" && navigator.product === "ReactNative"
  );
}

/**
 * Parse User-Agent to extract browser and OS information (web platform)
 */
function parseUserAgent(): { browser: string; os: string; osVersion: string } {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";
  let osVersion = "";

  // Detect browser
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";

  // Detect OS
  if (ua.includes("Windows NT")) {
    os = "Windows";
    const match = ua.match(/Windows NT ([0-9.]+)/);
    osVersion = match ? match[1] : "";
  } else if (ua.includes("Mac OS X")) {
    os = "macOS";
    const match = ua.match(/Mac OS X ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, ".") : "";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    os = "Android";
    const match = ua.match(/Android ([0-9.]+)/);
    osVersion = match ? match[1] : "";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    const match = ua.match(/OS ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, ".") : "";
  }

  return { browser, os, osVersion };
}

/**
 * Get device information for web platform
 */
function getWebDeviceInfo(): DeviceInfo {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return {
      platform: "web",
      brand: "Server",
      modelName: "SSR",
    };
  }

  const { browser, os, osVersion } = parseUserAgent();

  return {
    platform: "web",
    osVersion: osVersion || os,
    brand: browser,
    modelName: `${os} ${osVersion || ""}`.trim(),
    isSimulator: false,
  };
}

/**
 * Get device information for React Native platform using Expo packages
 */
function getReactNativeDeviceInfo(): DeviceInfo {
  try {
    // Try to dynamically import Platform from react-native
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require("react-native");

    let Device: {
      osVersion?: string;
      brand?: string;
      modelName?: string;
      isDevice?: boolean;
      platformApiLevel?: number | null;
    } | null = null;
    let deviceInfo: Partial<DeviceInfo> = {
      platform: Platform.OS || "unknown",
    };

    // Try to import expo-device if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Device = require("expo-device");
      if (Device) {
        deviceInfo = {
          ...deviceInfo,
          osVersion: Device.osVersion,
          brand: Device.brand,
          modelName: Device.modelName,
          isSimulator: !Device.isDevice,
          androidPlatformApiLevel:
            Device.platformApiLevel ?? undefined,
        };
      }
    } catch {
      // expo-device not available, use basic Platform info
      console.warn(
        "[ReactAnalytics] expo-device not found. Install it for detailed device information in React Native.",
      );

      deviceInfo = {
        ...deviceInfo,
        brand: "Unknown",
        modelName: Platform.OS === "ios" ? "iOS Device" : "Android Device",
      };
    }

    return deviceInfo as DeviceInfo;
  } catch (error) {
    console.error(
      "[ReactAnalytics] Error detecting React Native device info:",
      error,
    );
    return {
      platform: "unknown",
      brand: "Unknown",
      modelName: "Unknown Device",
    };
  }
}

/**
 * Get app version from various sources
 */
export function getAppVersion(): string {
  try {
    // Try React Native first
    if (isReactNative()) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Platform } = require("react-native");

        // For web platform in React Native
        if (Platform.OS === "web") {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const Constants = require("expo-constants").default;
            return Constants.expoConfig?.version || "0.0.0";
          } catch {
            return "0.0.0";
          }
        }

        // For native platforms, try expo-application
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const Application = require("expo-application");
          return Application.nativeApplicationVersion || "0.0.0";
        } catch {
          console.warn(
            "[ReactAnalytics] expo-application not found. Install it to auto-detect app version in React Native.",
          );
          return "0.0.0";
        }
      } catch {
        return "0.0.0";
      }
    }

    // For regular web apps, try to get version from package.json if exposed
    if (
      typeof window !== "undefined" &&
      "__APP_VERSION__" in window &&
      typeof (window as { __APP_VERSION__?: string }).__APP_VERSION__ ===
        "string"
    ) {
      return (window as { __APP_VERSION__: string }).__APP_VERSION__;
    }

    return "0.0.0";
  } catch (error) {
    console.error("[ReactAnalytics] Error detecting app version:", error);
    return "0.0.0";
  }
}

/**
 * Main function to get device information based on the current platform
 */
export function getDeviceInfo(): DeviceInfo {
  if (isReactNative()) {
    return getReactNativeDeviceInfo();
  }

  return getWebDeviceInfo();
}
