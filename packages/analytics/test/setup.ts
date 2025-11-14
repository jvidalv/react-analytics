import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock react-native globally to prevent module loading errors
vi.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    Version: 17,
  },
  AppState: {
    addEventListener: vi.fn(() => ({
      remove: vi.fn(),
    })),
    currentState: "active",
  },
}));

// Mock navigator.product for React Native detection
Object.defineProperty(global.navigator, "product", {
  writable: true,
  value: "Gecko", // Default to web
});

// Setup localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});
