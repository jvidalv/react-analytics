"use client";

import { FC, ReactNode, useEffect, useRef } from "react";
import {
  AnalyticsProvider,
  AnalyticsErrorBoundary,
  analytics,
} from "@jvidalv/react-analytics";
import { useMe } from "@/domains/user/me.api";

interface AnalyticsWrapperProps {
  children: ReactNode;
}

/**
 * Component that identifies the current user to analytics.
 * Must be used inside QueryClientProvider (e.g., in authenticated routes).
 */
export const AnalyticsIdentify: FC = () => {
  const { me } = useMe();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only identify if we have a user and haven't identified this user yet
    if (me && me.id !== identifiedUserIdRef.current) {
      analytics.identify(me.id, {
        name: me.name,
        email: me.email,
        avatar: me.image,
        plan: me.plan,
      });
      identifiedUserIdRef.current = me.id;
    }
  }, [me]);

  return null;
};

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
