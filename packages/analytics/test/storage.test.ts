import { describe, it, expect, beforeEach, vi } from "vitest";
import { createStorageAdapter } from "../src/storage";

describe("Storage Adapter", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Web Environment", () => {
    it("should create a web storage adapter when localStorage is available", () => {
      const storage = createStorageAdapter();
      expect(storage).toBeDefined();
    });

    it("should store and retrieve values from localStorage", async () => {
      const storage = createStorageAdapter();
      const key = "test-key";
      const value = "test-value";

      await storage.setItem(key, value);
      const retrieved = await storage.getItem(key);

      expect(retrieved).toBe(value);
      expect(localStorage.getItem(key)).toBe(value);
    });

    it("should return null for non-existent keys", async () => {
      const storage = createStorageAdapter();
      const retrieved = await storage.getItem("non-existent");

      expect(retrieved).toBeNull();
    });

    it("should handle storage errors gracefully", async () => {
      const storage = createStorageAdapter();
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage full");
      });

      await storage.setItem("test", "value");

      expect(consoleSpy).toHaveBeenCalled();

      // Restore
      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("React Native Environment Detection", () => {
    it("should detect web environment correctly", () => {
      // navigator.product is 'Gecko' by default in our setup
      expect(navigator.product).not.toBe("ReactNative");

      const storage = createStorageAdapter();
      expect(storage).toBeDefined();
    });
  });
});
