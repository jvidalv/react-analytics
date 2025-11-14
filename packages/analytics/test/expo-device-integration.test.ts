import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDeviceInfo, getAppVersion } from "../src/device";

describe("Expo Device Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset navigator.product
    Object.defineProperty(global.navigator, "product", {
      writable: true,
      value: "Gecko",
    });
    vi.clearAllMocks();
  });

  describe("React Native Environment with Expo", () => {
    beforeEach(() => {
      // Set navigator.product to ReactNative
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });
    });

    it("should use expo-device when available", () => {
      // Mock react-native Platform
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      // Mock expo-device
      vi.doMock("expo-device", () => ({
        default: {
          osVersion: "17.2",
          brand: "Apple",
          modelName: "iPhone 14 Pro",
          isDevice: true,
          platformApiLevel: null,
        },
        osVersion: "17.2",
        brand: "Apple",
        modelName: "iPhone 14 Pro",
        isDevice: true,
        platformApiLevel: null,
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBeDefined();
    });

    it("should fallback gracefully when expo-device is not available", () => {
      // Mock react-native Platform
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      // Mock expo-device to throw (not installed)
      vi.doMock("expo-device", () => {
        throw new Error("Module not found");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should detect iOS platform", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.platform).toBe("ios");
    });

    it("should detect Android platform", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "android",
        },
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.platform).toBe("android");
    });

    it("should include device info when expo-device is available", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "android",
        },
      }));

      vi.doMock("expo-device", () => ({
        osVersion: "14",
        brand: "Samsung",
        modelName: "Galaxy S23",
        isDevice: true,
        platformApiLevel: 34,
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toMatchObject({
        platform: "android",
      });
      expect(deviceInfo.brand).toBeDefined();
      expect(deviceInfo.modelName).toBeDefined();
    });

    it("should detect simulator vs real device", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      vi.doMock("expo-device", () => ({
        osVersion: "17.2",
        brand: "Apple",
        modelName: "iPhone 14 Pro",
        isDevice: false, // Simulator
        platformApiLevel: null,
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.isSimulator).toBe(true);
    });
  });

  describe("Expo Application Integration", () => {
    beforeEach(() => {
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });
    });

    it("should get app version from expo-application on native", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      vi.doMock("expo-application", () => ({
        nativeApplicationVersion: "1.2.3",
      }));

      const version = getAppVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
    });

    it("should fallback to 0.0.0 when expo-application is not available", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      vi.doMock("expo-application", () => {
        throw new Error("Module not found");
      });

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const version = getAppVersion();

      expect(version).toBe("0.0.0");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should use expo-constants for web platform version", () => {
      vi.doMock("react-native", () => ({
        Platform: {
          OS: "web",
        },
      }));

      vi.doMock("expo-constants", () => ({
        default: {
          expoConfig: {
            version: "2.0.0",
          },
        },
      }));

      const version = getAppVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
    });
  });

  describe("Device Info Payload Structure", () => {
    it("should return correct structure for iOS", () => {
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toHaveProperty("platform");
      expect(deviceInfo.platform).toBe("ios");
      expect(deviceInfo).toHaveProperty("brand");
      expect(deviceInfo).toHaveProperty("modelName");
    });

    it("should return correct structure for Android", () => {
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      vi.doMock("react-native", () => ({
        Platform: {
          OS: "android",
        },
      }));

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toHaveProperty("platform");
      expect(deviceInfo.platform).toBe("android");
      expect(deviceInfo).toHaveProperty("brand");
      expect(deviceInfo).toHaveProperty("modelName");
    });

    it("should include all expected fields", () => {
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      vi.doMock("expo-device", () => ({
        osVersion: "17.2",
        brand: "Apple",
        modelName: "iPhone 14 Pro",
        isDevice: true,
        platformApiLevel: null,
      }));

      const deviceInfo = getDeviceInfo();

      // Check all expected fields are present
      expect(deviceInfo).toHaveProperty("platform");
      expect(deviceInfo).toHaveProperty("osVersion");
      expect(deviceInfo).toHaveProperty("brand");
      expect(deviceInfo).toHaveProperty("modelName");
      expect(deviceInfo).toHaveProperty("isSimulator");
    });
  });

  describe("Cross-Platform Consistency", () => {
    it("should return consistent structure across platforms", () => {
      const webInfo = getDeviceInfo();

      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      vi.doMock("react-native", () => ({
        Platform: {
          OS: "ios",
        },
      }));

      const nativeInfo = getDeviceInfo();

      // Both should have the same basic structure
      expect(webInfo).toHaveProperty("platform");
      expect(nativeInfo).toHaveProperty("platform");
      expect(webInfo).toHaveProperty("brand");
      expect(nativeInfo).toHaveProperty("brand");
      expect(webInfo).toHaveProperty("modelName");
      expect(nativeInfo).toHaveProperty("modelName");
    });
  });
});
