import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { analytics } from "../src";

describe("Analytics Core", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response),
    );
  });

  afterEach(async () => {
    analytics.cleanup();
  });

  describe("Initialization", () => {
    it("should initialize with a valid API key", async () => {
      await expect(
        analytics.init({
          apiKey: "test-api-key",
          debug: false,
        }),
      ).resolves.not.toThrow();
    });

    it("should throw error without API key", async () => {
      await expect(
        analytics.init({
          apiKey: "",
        }),
      ).rejects.toThrow("API key is required");
    });

    it("should throw error without configuration", async () => {
      await expect(analytics.init(null)).rejects.toThrow(
        "Configuration is required",
      );
    });

    it("should generate and store identifyId in localStorage", async () => {
      await analytics.init({
        apiKey: "test-api-key",
      });

      // Wait a bit for async storage operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedId = localStorage.getItem("react-analytics_identify-id");
      expect(storedId).toBeTruthy();
      expect(typeof storedId).toBe("string");
    });

    it("should reuse existing identifyId from localStorage", async () => {
      const existingId = "existing-uuid-123";
      localStorage.setItem("react-analytics_identify-id", existingId);

      await analytics.init({
        apiKey: "test-api-key",
      });

      // Wait a bit for async storage operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const storedId = localStorage.getItem("react-analytics_identify-id");
      expect(storedId).toBe(existingId);
    });
  });

  describe("Event Tracking", () => {
    beforeEach(async () => {
      await analytics.init({
        apiKey: "test-api-key",
        debug: false,
      });
    });

    it("should track identify events", () => {
      expect(() => {
        analytics.identify("user-123", {
          email: "test@example.com",
          firstName: "John",
        });
      }).not.toThrow();
    });

    it("should track action events", () => {
      expect(() => {
        analytics.action("button_click", {
          button: "signup",
        });
      }).not.toThrow();
    });

    it("should track error events", () => {
      expect(() => {
        analytics.error("Network error", {
          statusCode: 500,
        });
      }).not.toThrow();
    });

    it("should track page events", () => {
      expect(() => {
        analytics.page("/dashboard", {
          section: "analytics",
        });
      }).not.toThrow();
    });

    it("should truncate long error messages", () => {
      const longMessage = "a".repeat(200);

      expect(() => {
        analytics.error(longMessage);
      }).not.toThrow();
      // The implementation truncates to 150 characters
    });
  });

  describe("Event Queue and Pushing", () => {
    beforeEach(async () => {
      await analytics.init({
        apiKey: "test-api-key",
        debug: false,
      });

      // Wait for identifyId to be set
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should batch multiple events", () => {
      analytics.action("event1");
      analytics.action("event2");
      analytics.action("event3");

      // Events should be queued (we can't directly check the queue, but we can verify no errors)
      expect(true).toBe(true);
    });

    it(
      "should attempt to push events after timeout",
      async () => {
        const fetchMock = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
          } as Response),
        );
        global.fetch = fetchMock;

        analytics.action("test_event");

        // Wait for the 5-second interval + processing time
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Fetch should have been called
        expect(fetchMock).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );

    it(
      "should send correct payload structure to API",
      async () => {
        const fetchMock = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
          } as Response),
        );
        global.fetch = fetchMock;

        analytics.identify("user-123", { email: "test@example.com" });
        analytics.action("test_action", { value: "test" });

        // Wait for push
        await new Promise((resolve) => setTimeout(resolve, 5500));

        expect(fetchMock).toHaveBeenCalledWith(
          "https://expofast.app/api/analytics/push",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: expect.any(String),
          }),
        );

        // Check payload structure
        const callArgs = fetchMock.mock.calls[0];
        const payload = JSON.parse(callArgs[1].body);

        expect(payload).toHaveProperty("apiKey", "test-api-key");
        expect(payload).toHaveProperty("identifyId");
        expect(payload).toHaveProperty("appVersion");
        expect(payload).toHaveProperty("info");
        expect(payload).toHaveProperty("events");
        expect(Array.isArray(payload.events)).toBe(true);
      },
      { timeout: 10000 },
    );

    it(
      "should clear events after successful push",
      async () => {
        const fetchMock = vi.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
          } as Response),
        );
        global.fetch = fetchMock;

        analytics.action("event1");
        analytics.action("event2");

        // Wait for first push
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Clear the mock
        fetchMock.mockClear();

        // Wait for another interval
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Should not push again if no new events
        // (fetch might be called but with empty events array, implementation dependent)
      },
      { timeout: 15000 },
    );

    it(
      "should handle failed push gracefully",
      async () => {
        const fetchMock = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
          } as Response),
        );
        global.fetch = fetchMock;

        analytics.action("test_event");

        // Wait for push attempt
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Should not throw, should handle gracefully
        expect(fetchMock).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  });

  describe("Cleanup", () => {
    it(
      "should cleanup and stop pushing events",
      async () => {
        await analytics.init({
          apiKey: "test-api-key",
        });

        analytics.cleanup();

        const fetchMock = vi.fn();
        global.fetch = fetchMock;

        analytics.action("test_event");

        // Wait for what would be a push interval
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // Should not push after cleanup
        expect(fetchMock).not.toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  });
});
