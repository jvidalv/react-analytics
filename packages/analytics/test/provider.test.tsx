import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AnalyticsProvider } from "../src";
import { analytics } from "../src/core";

describe("AnalyticsProvider", () => {
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

  afterEach(() => {
    analytics.cleanup();
  });

  it("should render children", async () => {
    render(
      <AnalyticsProvider config={{ apiKey: "test-key" }}>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should initialize analytics on mount", async () => {
    const initSpy = vi.spyOn(analytics, "init");

    render(
      <AnalyticsProvider config={{ apiKey: "test-key" }}>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(initSpy).toHaveBeenCalledWith({ apiKey: "test-key" });
    });

    initSpy.mockRestore();
  });

  it("should cleanup analytics on unmount", async () => {
    const cleanupSpy = vi.spyOn(analytics, "cleanup");

    const { unmount } = render(
      <AnalyticsProvider config={{ apiKey: "test-key" }}>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    unmount();

    expect(cleanupSpy).toHaveBeenCalled();

    cleanupSpy.mockRestore();
  });

  it("should pass configuration options correctly", async () => {
    const initSpy = vi.spyOn(analytics, "init");

    render(
      <AnalyticsProvider
        config={{
          apiKey: "test-key",
          debug: true,
          appVersion: "1.0.0",
          events: {
            disableNavigationEvents: true,
            disableStateEvents: true,
          },
        }}
      >
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(initSpy).toHaveBeenCalledWith({
        apiKey: "test-key",
        debug: true,
        appVersion: "1.0.0",
        events: {
          disableNavigationEvents: true,
          disableStateEvents: true,
        },
      });
    });

    initSpy.mockRestore();
  });

  it("should handle initialization errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const initSpy = vi
      .spyOn(analytics, "init")
      .mockRejectedValue(new Error("Init failed"));

    render(
      <AnalyticsProvider config={{ apiKey: "test-key" }}>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    // Should still render children even if init fails
    expect(screen.getByText("Test Content")).toBeInTheDocument();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    initSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should render children immediately before initialization completes", () => {
    render(
      <AnalyticsProvider config={{ apiKey: "test-key" }}>
        <div>Test Content</div>
      </AnalyticsProvider>,
    );

    // Children should be visible immediately
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
