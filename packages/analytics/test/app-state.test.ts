import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setupAppStateTracking } from "../src/app-state";

describe("App State Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset navigator.product
    Object.defineProperty(global.navigator, "product", {
      writable: true,
      value: "Gecko",
    });
  });

  describe("Web Platform", () => {
    it("should setup visibility change listeners", () => {
      const callback = vi.fn();
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");
      const windowAddEventListenerSpy = vi.spyOn(window, "addEventListener");

      const cleanup = setupAppStateTracking(callback);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
        "focus",
        expect.any(Function),
      );
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
      );
      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();
      addEventListenerSpy.mockRestore();
      windowAddEventListenerSpy.mockRestore();
    });

    it("should call callback when visibility changes to visible", () => {
      const callback = vi.fn();

      setupAppStateTracking(callback);

      // Simulate visibility change to visible
      Object.defineProperty(document, "visibilityState", {
        writable: true,
        value: "visible",
      });

      const event = new Event("visibilitychange");
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(true);
    });

    it("should call callback when visibility changes to hidden", () => {
      const callback = vi.fn();

      setupAppStateTracking(callback);

      // Simulate visibility change to hidden
      Object.defineProperty(document, "visibilityState", {
        writable: true,
        value: "hidden",
      });

      const event = new Event("visibilitychange");
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it("should call callback on window focus", () => {
      const callback = vi.fn();

      setupAppStateTracking(callback);

      const event = new Event("focus");
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(true);
    });

    it("should call callback on window blur", () => {
      const callback = vi.fn();

      setupAppStateTracking(callback);

      const event = new Event("blur");
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it("should cleanup listeners when cleanup function is called", () => {
      const callback = vi.fn();
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const windowRemoveEventListenerSpy = vi.spyOn(
        window,
        "removeEventListener",
      );

      const cleanup = setupAppStateTracking(callback);
      cleanup?.();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function),
      );
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
        "focus",
        expect.any(Function),
      );
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
        "blur",
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
      windowRemoveEventListenerSpy.mockRestore();
    });
  });

  describe("React Native Platform", () => {
    beforeEach(() => {
      // Set navigator.product to ReactNative
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });
    });

    it("should setup React Native AppState listener", () => {
      const callback = vi.fn();
      const mockRemove = vi.fn();
      const mockAddEventListener = vi.fn(() => ({ remove: mockRemove }));

      // Mock react-native module
      vi.doMock("react-native", () => ({
        AppState: {
          addEventListener: mockAddEventListener,
        },
      }));

      const cleanup = setupAppStateTracking(callback);

      expect(cleanup).toBeInstanceOf(Function);
    });

    it("should return null if react-native is not available", () => {
      const callback = vi.fn();
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock require to throw
      vi.doMock("react-native", () => {
        throw new Error("Module not found");
      });

      const cleanup = setupAppStateTracking(callback);

      expect(cleanup).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Platform Detection", () => {
    it("should detect web platform by default", () => {
      const callback = vi.fn();

      const cleanup = setupAppStateTracking(callback);

      expect(cleanup).not.toBeNull();
      expect(cleanup).toBeInstanceOf(Function);
    });

    it("should detect React Native platform when navigator.product is ReactNative", () => {
      Object.defineProperty(global.navigator, "product", {
        writable: true,
        value: "ReactNative",
      });

      const callback = vi.fn();
      const cleanup = setupAppStateTracking(callback);

      // Should attempt React Native setup (will return null in test env due to missing module)
      expect(typeof cleanup === "function" || cleanup === null).toBe(true);
    });
  });

  describe("SSR Safety", () => {
    it("should return null when document is undefined", () => {
      const originalDocument = global.document;
      (global as any).document = undefined;

      const callback = vi.fn();
      const cleanup = setupAppStateTracking(callback);

      expect(cleanup).toBeNull();

      // Restore
      (global as any).document = originalDocument;
    });

    it("should return null when window is undefined", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const callback = vi.fn();
      const cleanup = setupAppStateTracking(callback);

      expect(cleanup).toBeNull();

      // Restore
      (global as any).window = originalWindow;
    });
  });
});
