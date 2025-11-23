"use client";

/**
 * Simplified Analytics Provider component that handles initialization and router tracking
 *
 * Note: This is a client component for Next.js App Router compatibility.
 * Analytics operations only run on the client side.
 */

import { FC, PropsWithChildren, useEffect, useState } from "react";
import { analytics } from "./core";
import { RouterTracker } from "./router";
import { navigation } from "./core";
import type { AnalyticsConfig } from "./types";

export interface AnalyticsProviderProps extends PropsWithChildren {
  /**
   * Analytics configuration
   */
  config: AnalyticsConfig;
}

/**
 * AnalyticsProvider - Simplified provider that handles initialization and router tracking
 *
 * @example
 * ```tsx
 * import { AnalyticsProvider } from 'react-analytics';
 *
 * function App() {
 *   return (
 *     <AnalyticsProvider config={{ apiKey: 'your-api-key' }}>
 *       <YourApp />
 *     </AnalyticsProvider>
 *   );
 * }
 * ```
 */
const AnalyticsProvider: FC<AnalyticsProviderProps> = ({
  config,
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize analytics
    analytics
      .init(config)
      .then(() => {
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("[ReactAnalytics] Initialization error:", error);
      });

    // Cleanup on unmount
    return () => {
      analytics.cleanup();
    };
  }, [config.apiKey]); // Re-initialize only if API key changes

  // Don't render router tracker until analytics is initialized
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <>
      <RouterTracker
        onNavigate={navigation}
        disabled={config.events?.disableNavigationEvents}
      />
      {children}
    </>
  );
};

export default AnalyticsProvider;
