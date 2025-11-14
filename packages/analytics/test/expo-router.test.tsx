import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ExpoRouterTracker } from "../src";

// Mock expo-router hooks
const mockUseSegments = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("expo-router", () => ({
  useSegments: () => mockUseSegments(),
  usePathname: () => mockUsePathname(),
}));

describe("Expo Router Integration", () => {
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("ExpoRouterTracker", () => {
    it("should track initial route on mount", async () => {
      mockUseSegments.mockReturnValue(["home"]);
      mockUsePathname.mockReturnValue("/home");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith("/home", expect.anything());
    });

    it("should track navigation when segments change", async () => {
      const { rerender } = render(
        <ExpoRouterTracker onNavigate={mockOnNavigate} />,
      );

      // Initial route
      mockUseSegments.mockReturnValue(["home"]);
      mockUsePathname.mockReturnValue("/home");
      rerender(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith("/home", expect.anything());
      });

      mockOnNavigate.mockClear();

      // Navigate to different route
      mockUseSegments.mockReturnValue(["profile"]);
      mockUsePathname.mockReturnValue("/profile");
      rerender(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledWith(
          "/profile",
          expect.anything(),
        );
      });
    });

    it("should extract dynamic route parameters", async () => {
      // Dynamic route like /user/[id]
      mockUseSegments.mockReturnValue(["user", "[id]"]);
      mockUsePathname.mockReturnValue("/user/123");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/user/[id]",
        expect.objectContaining({
          params: expect.objectContaining({
            id: "123",
          }),
        }),
      );
    });

    it("should handle nested routes with multiple dynamic params", async () => {
      // Route like /shop/[category]/[productId]
      mockUseSegments.mockReturnValue(["shop", "[category]", "[productId]"]);
      mockUsePathname.mockReturnValue("/shop/electronics/456");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/shop/[category]/[productId]",
        expect.objectContaining({
          params: expect.objectContaining({
            category: "electronics",
            productId: "456",
          }),
        }),
      );
    });

    it("should handle routes without parameters", async () => {
      mockUseSegments.mockReturnValue(["about", "team"]);
      mockUsePathname.mockReturnValue("/about/team");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/about/team",
        undefined, // No params
      );
    });

    it("should handle root route", async () => {
      mockUseSegments.mockReturnValue([]);
      mockUsePathname.mockReturnValue("/");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith("/", undefined);
    });

    it("should not track navigation when disabled", async () => {
      mockUseSegments.mockReturnValue(["home"]);
      mockUsePathname.mockReturnValue("/home");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} disabled={true} />);

      // Wait a bit to ensure no calls were made
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnNavigate).not.toHaveBeenCalled();
    });

    it("should handle complex nested route structures", async () => {
      // Route like /dashboard/settings/[tab]
      mockUseSegments.mockReturnValue(["dashboard", "settings", "[tab]"]);
      mockUsePathname.mockReturnValue("/dashboard/settings/profile");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/dashboard/settings/[tab]",
        expect.objectContaining({
          params: expect.objectContaining({
            tab: "profile",
          }),
        }),
      );
    });

    it("should track navigation multiple times for different routes", async () => {
      const { rerender } = render(
        <ExpoRouterTracker onNavigate={mockOnNavigate} />,
      );

      // Route 1
      mockUseSegments.mockReturnValue(["home"]);
      mockUsePathname.mockReturnValue("/home");
      rerender(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledTimes(1);
      });

      // Route 2
      mockUseSegments.mockReturnValue(["about"]);
      mockUsePathname.mockReturnValue("/about");
      rerender(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledTimes(2);
      });

      // Route 3
      mockUseSegments.mockReturnValue(["contact"]);
      mockUsePathname.mockReturnValue("/contact");
      rerender(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalledTimes(3);
      });
    });

    it("should handle error gracefully if expo-router hooks throw", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockUseSegments.mockImplementation(() => {
        throw new Error("Expo Router error");
      });

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      // Should not crash
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Path Parameter Extraction", () => {
    it("should handle optional catch-all routes [...slug]", async () => {
      mockUseSegments.mockReturnValue(["docs", "[...slug]"]);
      mockUsePathname.mockReturnValue("/docs/getting-started/installation");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      // The path should be constructed from segments
      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/docs/[...slug]",
        expect.anything(),
      );
    });

    it("should handle mixed static and dynamic segments", async () => {
      mockUseSegments.mockReturnValue(["api", "v1", "[resource]", "[id]"]);
      mockUsePathname.mockReturnValue("/api/v1/users/789");

      render(<ExpoRouterTracker onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled();
      });

      expect(mockOnNavigate).toHaveBeenCalledWith(
        "/api/v1/[resource]/[id]",
        expect.objectContaining({
          params: expect.objectContaining({
            resource: "users",
            id: "789",
          }),
        }),
      );
    });
  });
});
