"use client";

import { FC, ReactNode } from "react";
import {
  AnalyticsProvider,
  AnalyticsErrorBoundary,
} from "@jvidalv/react-analytics";

interface AnalyticsWrapperProps {
  children: ReactNode;
}

/**
 * Analytics wrapper using @jvidalv/react-analytics library
 * Handles initialization, automatic router tracking, and error boundary
 */
export const AnalyticsWrapper: FC<AnalyticsWrapperProps> = ({ children }) => {
  const apiKey = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY;

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <AnalyticsProvider
      config={{
        apiKey,
        url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/analytics/push`,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <AnalyticsErrorBoundary>{children}</AnalyticsErrorBoundary>
    </AnalyticsProvider>
  );
};
