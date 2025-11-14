import { describe, it, expect, beforeEach, vi } from "vitest";
import { getDeviceInfo, getAppVersion } from "../src/device";

describe("Device Info Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Web Environment", () => {
    it("should detect web platform", () => {
      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBe("web");
    });

    it("should extract browser information", () => {
      const deviceInfo = getDeviceInfo();

      expect(deviceInfo.brand).toBeDefined();
      expect(deviceInfo.modelName).toBeDefined();
      expect(typeof deviceInfo.brand).toBe("string");
    });

    it("should handle missing navigator gracefully", () => {
      // This tests SSR environments
      const originalNavigator = global.navigator;
      (global as any).navigator = undefined;

      const deviceInfo = getDeviceInfo();

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBe("web");
      expect(deviceInfo.brand).toBe("Server");
      expect(deviceInfo.modelName).toBe("SSR");

      // Restore
      (global as any).navigator = originalNavigator;
    });
  });

  describe("App Version Detection", () => {
    it("should return default version when not available", () => {
      const version = getAppVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
      // In test environment, should default to '0.0.0'
      expect(version).toBe("0.0.0");
    });

    it("should use window.__APP_VERSION__ if available", () => {
      const testVersion = "1.2.3";
      (window as any).__APP_VERSION__ = testVersion;

      const version = getAppVersion();

      expect(version).toBe(testVersion);

      // Cleanup
      delete (window as any).__APP_VERSION__;
    });
  });

  describe("React Native Detection", () => {
    it("should detect React Native environment", () => {
      // Change navigator.product to ReactNative
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      const deviceInfo = getDeviceInfo();

      // Should try to detect RN but fail gracefully in test environment
      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.platform).toBeDefined();

      // Restore
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "Gecko",
      });
    });
  });
});
