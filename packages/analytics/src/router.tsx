"use client";

/**
 * Router auto-detection and navigation tracking for multiple React routers
 *
 * Note: These are client components for Next.js App Router compatibility.
 */

import { useEffect } from "react";

export type NavigationCallback = (
  path: string,
  properties?: Record<string, unknown>,
) => void;

export type RouterType =
  | "expo-router"
  | "react-router"
  | "next-pages"
  | "next-app"
  | "none";

/**
 * Detects which router is available in the current environment
 */
export function detectRouter(): RouterType {
  // Try Expo Router
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("expo-router");
    return "expo-router";
  } catch {
    // Not available
  }

  // Try Next.js App Router (next/navigation)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("next/navigation");
    return "next-app";
  } catch {
    // Not available
  }

  // Try Next.js Pages Router (next/router)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("next/router");
    return "next-pages";
  } catch {
    // Not available
  }

  // Try React Router
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("react-router-dom");
    return "react-router";
  } catch {
    // Not available
  }

  return "none";
}

/**
 * Extract path parameters from expo-router segments and pathname
 */
function getPathParams(
  segments: string[],
  pathname: string,
): Record<string, string> {
  const params: Record<string, string> = {};
  const pathParts = pathname.split("/").filter(Boolean);

  segments.forEach((segment, index) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      const paramName = segment.slice(1, -1);
      params[paramName] = pathParts[index] || "";
    }
  });

  return params;
}

/**
 * Internal component that uses Expo Router hooks
 * This is separated to ensure hooks are called unconditionally
 */
function ExpoRouterTrackerInternal({
  onNavigate,
  useSegments,
  usePathname,
}: {
  onNavigate: NavigationCallback;
  useSegments: () => string[];
  usePathname: () => string;
}) {
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    const path = `/${segments.join("/")}`;
    const params = getPathParams(segments, pathname);

    onNavigate(path, Object.keys(params).length > 0 ? { params } : undefined);
  }, [segments, pathname, onNavigate]);

  return null;
}

/**
 * Component that handles Expo Router tracking
 * Note: This must be used inside an Expo Router context
 */
export function ExpoRouterTracker({
  onNavigate,
  disabled,
}: {
  onNavigate: NavigationCallback;
  disabled?: boolean;
}) {
  if (disabled) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useSegments, usePathname } = require("expo-router");
    return (
      <ExpoRouterTrackerInternal
        onNavigate={onNavigate}
        useSegments={useSegments}
        usePathname={usePathname}
      />
    );
  } catch (error) {
    console.error("[ReactAnalytics] Error in Expo Router tracking:", error);
    return null;
  }
}

/**
 * Internal component that uses React Router hooks
 */
function ReactRouterTrackerInternal({
  onNavigate,
  useLocation,
}: {
  onNavigate: NavigationCallback;
  useLocation: () => { pathname: string; search: string };
}) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const params = Object.fromEntries(new URLSearchParams(location.search));

    onNavigate(path, Object.keys(params).length > 0 ? { params } : undefined);
  }, [location, onNavigate]);

  return null;
}

/**
 * Component that handles React Router tracking
 */
export function ReactRouterTracker({
  onNavigate,
  disabled,
}: {
  onNavigate: NavigationCallback;
  disabled?: boolean;
}) {
  if (disabled) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useLocation } = require("react-router-dom");
    return (
      <ReactRouterTrackerInternal
        onNavigate={onNavigate}
        useLocation={useLocation}
      />
    );
  } catch (error) {
    console.error("[ReactAnalytics] Error in React Router tracking:", error);
    return null;
  }
}

/**
 * Internal component that uses Next.js App Router hooks
 */
function NextAppRouterTrackerInternal({
  onNavigate,
  usePathname,
  useSearchParams,
}: {
  onNavigate: NavigationCallback;
  usePathname: () => string;
  useSearchParams: () => URLSearchParams;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());

    onNavigate(
      pathname,
      Object.keys(params).length > 0 ? { params } : undefined,
    );
  }, [pathname, searchParams, onNavigate]);

  return null;
}

/**
 * Component that handles Next.js App Router tracking
 */
export function NextAppRouterTracker({
  onNavigate,
  disabled,
}: {
  onNavigate: NavigationCallback;
  disabled?: boolean;
}) {
  if (disabled) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { usePathname, useSearchParams } = require("next/navigation");
    return (
      <NextAppRouterTrackerInternal
        onNavigate={onNavigate}
        usePathname={usePathname}
        useSearchParams={useSearchParams}
      />
    );
  } catch (error) {
    console.error(
      "[ReactAnalytics] Error in Next.js App Router tracking:",
      error,
    );
    return null;
  }
}

/**
 * Internal component that uses Next.js Pages Router hooks
 */
function NextPagesRouterTrackerInternal({
  onNavigate,
  useRouter,
}: {
  onNavigate: NavigationCallback;
  useRouter: () => {
    pathname: string;
    query: Record<string, string | string[]>;
    events: {
      on: (event: string, handler: (url: string) => void) => void;
      off: (event: string, handler: (url: string) => void) => void;
    };
  };
}) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      onNavigate(url, router.query ? { params: router.query } : undefined);
    };

    // Track initial route
    handleRouteChange(router.pathname);

    // Subscribe to route changes
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router, onNavigate]);

  return null;
}

/**
 * Component that handles Next.js Pages Router tracking
 */
export function NextPagesRouterTracker({
  onNavigate,
  disabled,
}: {
  onNavigate: NavigationCallback;
  disabled?: boolean;
}) {
  if (disabled) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useRouter } = require("next/router");
    return (
      <NextPagesRouterTrackerInternal
        onNavigate={onNavigate}
        useRouter={useRouter}
      />
    );
  } catch (error) {
    console.error(
      "[ReactAnalytics] Error in Next.js Pages Router tracking:",
      error,
    );
    return null;
  }
}

/**
 * Universal router tracker component that auto-detects and tracks navigation
 */
export function RouterTracker({
  onNavigate,
  disabled,
}: {
  onNavigate: NavigationCallback;
  disabled?: boolean;
}) {
  const routerType = detectRouter();

  if (disabled) return null;

  switch (routerType) {
    case "expo-router":
      return <ExpoRouterTracker onNavigate={onNavigate} disabled={disabled} />;
    case "react-router":
      return <ReactRouterTracker onNavigate={onNavigate} disabled={disabled} />;
    case "next-app":
      return (
        <NextAppRouterTracker onNavigate={onNavigate} disabled={disabled} />
      );
    case "next-pages":
      return (
        <NextPagesRouterTracker onNavigate={onNavigate} disabled={disabled} />
      );
    case "none":
      console.warn(
        "[ReactAnalytics] No router detected. Use analytics.page(path) for manual navigation tracking.",
      );
      return null;
  }
}
