/**
 * Type definitions for React Analytics
 */

export type ErrorEvent = {
  type: "error";
  message: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type NavigationEvent = {
  type: "navigation";
  path: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type ActionEvent = {
  type: "action";
  name: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type IdentifyEvent = {
  type: "identify";
  id: string;
  date: string;
  properties?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  } & Record<string, unknown>;
};

export type StateEvent = {
  type: "state";
  active: boolean;
  date: string;
  properties?: Record<string, unknown>;
};

export type AnalyticsEvent =
  | NavigationEvent
  | ActionEvent
  | IdentifyEvent
  | StateEvent
  | ErrorEvent;

export type AnalyticsConfig = {
  /**
   * API key for authentication with the analytics backend
   */
  apiKey: string;

  /**
   * Optional custom API URL (defaults to https://expofast.app/api/analytics/push)
   */
  url?: string;

  /**
   * Optional app version (auto-detected if not provided)
   */
  appVersion?: string;

  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Event tracking configuration
   */
  events?: {
    /**
     * Disable automatic navigation tracking
     */
    disableNavigationEvents?: boolean;

    /**
     * Disable app state tracking (React Native only)
     */
    disableStateEvents?: boolean;
  };
};
