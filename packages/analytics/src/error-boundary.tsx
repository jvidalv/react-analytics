"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { analytics } from "./core";
import { getDeviceInfo } from "./device";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  disabled?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that automatically reports errors to analytics.
 *
 * Catches React rendering errors and sends detailed error information
 * including stack trace, component stack, route, and device info.
 *
 * @example
 * ```tsx
 * <AnalyticsErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Something went wrong</h1>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyApp />
 * </AnalyticsErrorBoundary>
 * ```
 */
class AnalyticsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Call optional user callback
    this.props.onError?.(error, errorInfo);

    // Report to analytics unless disabled
    if (!this.props.disabled) {
      this.reportError(error, errorInfo);
    }
  }

  reportError(error: Error, errorInfo: ErrorInfo): void {
    const deviceInfo = getDeviceInfo();

    // Get current route (works on web, returns "unknown" on React Native)
    let route = "unknown";
    if (typeof window !== "undefined" && window.location?.pathname) {
      route = window.location.pathname;
    }

    analytics.error(error.message, {
      name: error.name,
      stack: error.stack?.slice(0, 2000), // Limit stack trace size
      componentStack: errorInfo.componentStack?.slice(0, 2000),
      route,
      platform: deviceInfo.platform,
      osVersion: deviceInfo.osVersion,
      browser: deviceInfo.brand,
      source: "ErrorBoundary",
    });
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback is null for universal compatibility (web + React Native)
      return null;
    }

    return this.props.children;
  }
}

export default AnalyticsErrorBoundary;
