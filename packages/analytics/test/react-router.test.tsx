import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { AnalyticsProvider } from "../src";
import { analytics } from "../src/core";

// Mock the navigation function to track calls
const mockNavigation = vi.fn();

// Mock the core module to spy on navigation calls
vi.mock("../src/core", async () => {
  const actual = await vi.importActual("../src/core");
  return {
    ...actual,
    navigation: (...args: any[]) => {
      mockNavigation(...args);
      // Call the actual implementation
      return (actual as any).navigation(...args);
    },
  };
});

describe("React Router Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockNavigation.mockClear();
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

  function TestApp() {
    const navigate = useNavigate();

    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </nav>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/contact" element={<div>Contact Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </div>
    );
  }

  it("should track initial route on mount", async () => {
    render(
      <BrowserRouter>
        <AnalyticsProvider config={{ apiKey: "test-key" }}>
          <TestApp />
        </AnalyticsProvider>
      </BrowserRouter>,
    );

    // Wait for initialization and first navigation event
    await waitFor(
      () => {
        expect(mockNavigation).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );

    // Should track the initial route
    expect(mockNavigation).toHaveBeenCalledWith("/", expect.anything());
  });

  it("should track navigation when clicking links", async () => {
    render(
      <BrowserRouter>
        <AnalyticsProvider config={{ apiKey: "test-key" }}>
          <TestApp />
        </AnalyticsProvider>
      </BrowserRouter>,
    );

    // Wait for initialization
    await waitFor(
      () => {
        expect(mockNavigation).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );

    // Clear previous calls
    mockNavigation.mockClear();

    // Click the About link
    const aboutLink = screen.getByText("About");
    aboutLink.click();

    // Wait for navigation event
    await waitFor(
      () => {
        expect(mockNavigation).toHaveBeenCalledWith(
          "/about",
          expect.anything(),
        );
      },
      { timeout: 2000 },
    );
  });

  it("should track programmatic navigation", async () => {
    render(
      <BrowserRouter>
        <AnalyticsProvider config={{ apiKey: "test-key" }}>
          <TestApp />
        </AnalyticsProvider>
      </BrowserRouter>,
    );

    // Wait for initialization
    await waitFor(
      () => {
        expect(mockNavigation).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );

    mockNavigation.mockClear();

    // Click the button that triggers programmatic navigation
    const dashboardButton = screen.getByText("Go to Dashboard");
    dashboardButton.click();

    // Wait for navigation event
    await waitFor(
      () => {
        expect(mockNavigation).toHaveBeenCalledWith(
          "/dashboard",
          expect.anything(),
        );
      },
      { timeout: 2000 },
    );
  });

  it("should not track navigation when disabled", async () => {
    render(
      <BrowserRouter>
        <AnalyticsProvider
          config={{
            apiKey: "test-key",
            events: {
              disableNavigationEvents: true,
            },
          }}
        >
          <TestApp />
        </AnalyticsProvider>
      </BrowserRouter>,
    );

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Should not have tracked any navigation
    expect(mockNavigation).not.toHaveBeenCalled();
  });
});
