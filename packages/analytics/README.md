# React Analytics

A **universal analytics library** that works with **any React project** - Next.js (App/Pages Router), Expo, React Native, React Router, or plain React. Plug and play with automatic navigation tracking, built-in storage adapters, and zero configuration for most frameworks.

## Features

- 📱 **Universal Compatibility** - Works seamlessly with Next.js, Expo, React Native, React Router, or any React app
- 🚀 **Zero Config Setup** - Drop in `<AnalyticsProvider>` and start tracking immediately
- 🔄 **Auto Navigation Tracking** - Automatically detects and tracks route changes across all routers
- 🎯 **Smart Router Detection** - Auto-detects expo-router, react-router, Next.js App/Pages Router
- 💾 **Built-in Storage** - Uses localStorage for web, AsyncStorage for React Native (auto-detected)
- 📊 **Event Batching** - Queues and pushes events every 5 seconds with retry logic
- 💬 **Contact Form Messages** - Built-in message tracking with dashboard management
- 🛡️ **Error Boundary** - Automatic error reporting with React error boundaries
- 🔒 **Type-Safe** - Full TypeScript support with comprehensive types

## Installation

```bash
npm install @jvidalv/react-analytics
# or
yarn add @jvidalv/react-analytics
# or
pnpm add @jvidalv/react-analytics
```

### Platform-Specific Dependencies

**For React Native / Expo:**

```bash
npm install @react-native-async-storage/async-storage
```

**Optional (for enhanced device info in React Native):**

```bash
npx expo install expo-device expo-application expo-constants
```

## Quick Start

### Option 1: Provider Component (Recommended)

The **declarative approach** - perfect for most React applications. Just wrap your app with `<AnalyticsProvider>`:

```tsx
import { AnalyticsProvider, analytics } from "@jvidalv/react-analytics";

function App() {
  return (
    <AnalyticsProvider config={{ apiKey: "your-api-key" }}>
      <YourApp />
    </AnalyticsProvider>
  );
}

// Track events anywhere in your app
analytics.identify("user-123", { email: "user@example.com" });
analytics.action("button_click", { button: "login" });
analytics.error("Network error", { statusCode: 500 });
analytics.message("user@example.com", "I need help with...");
```

The provider automatically:

- ✅ Initializes analytics on mount
- ✅ Auto-detects your router and tracks navigation
- ✅ Handles cleanup on unmount
- ✅ Works with Next.js SSR/SSG (client-side only)

### Option 2: Manual Init (Advanced)

For edge cases where you need granular control over initialization:

```tsx
import { analytics } from "@jvidalv/react-analytics";

// Initialize manually at app startup
await analytics.init({
  apiKey: "your-api-key",
  debug: true, // Optional
});

// Track events and navigation manually
analytics.page("/dashboard");
analytics.action("button_click", { button: "login" });
```

> **Note:** With manual init, you'll need to track navigation yourself unless you use `<RouterTracker>`. See [Advanced Usage](#advanced-usage) for details.

## Platform Examples

### Next.js App Router

```tsx
// app/layout.tsx
import { AnalyticsProvider } from "@jvidalv/react-analytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider
          config={{ apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY! }}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

> **Note:** `AnalyticsProvider` is a client component and works seamlessly with Next.js App Router. Analytics only run client-side, making it safe for SSR.

### Next.js Pages Router (Legacy)

For projects still using Pages Router:

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { AnalyticsProvider } from "@jvidalv/react-analytics";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider
      config={{ apiKey: process.env.NEXT_PUBLIC_ANALYTICS_KEY! }}
    >
      <Component {...pageProps} />
    </AnalyticsProvider>
  );
}
```

### React Native with Expo Router

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { AnalyticsProvider } from "@jvidalv/react-analytics";

export default function RootLayout() {
  return (
    <AnalyticsProvider
      config={{ apiKey: process.env.EXPO_PUBLIC_ANALYTICS_KEY }}
    >
      <Stack />
    </AnalyticsProvider>
  );
}
```

### React SPA with React Router

```tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AnalyticsProvider } from "@jvidalv/react-analytics";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <AnalyticsProvider config={{ apiKey: process.env.REACT_APP_ANALYTICS_KEY }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AnalyticsProvider>,
);
```

### Plain React (Any Setup)

For vanilla React apps without a specific router, or when you need manual control:

```tsx
// App.tsx
import { useEffect } from "react";
import { analytics } from "@jvidalv/react-analytics";

export default function App() {
  useEffect(() => {
    analytics.init({
      apiKey: "your-api-key",
    });
  }, []);

  return <YourApp />;
}
```

## Configuration

```typescript
type AnalyticsConfig = {
  apiKey: string; // Required: Your analytics API key
  url?: string; // Optional: Custom API endpoint
  appVersion?: string; // Optional: App version (auto-detected)
  debug?: boolean; // Optional: Enable console logging
  events?: {
    disableNavigationEvents?: boolean; // Disable auto navigation tracking
    disableStateEvents?: boolean; // Disable app state tracking (RN only)
  };
};
```

## API Methods

### `analytics.init(config)`

Initialize the analytics library. Must be called before tracking events.

```typescript
await analytics.init({
  apiKey: "your-api-key",
  debug: true,
});
```

### `analytics.identify(userId, properties?)`

Identify a user and optionally set user properties.

```typescript
analytics.identify("user-123", {
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  avatarUrl: "https://example.com/avatar.jpg",
  plan: "premium",
});
```

### `analytics.action(name, properties?)`

Track a custom action/event.

```typescript
analytics.action("button_click", {
  button: "signup",
  location: "header",
});

analytics.action("purchase", {
  productId: "prod-123",
  amount: 29.99,
  currency: "USD",
});
```

### `analytics.error(message, properties?)`

Track an error.

```typescript
analytics.error("Payment failed", {
  errorCode: "CARD_DECLINED",
  amount: 99.99,
});
```

### `analytics.page(path, properties?)`

Manually track a page view. Useful when automatic tracking is disabled or for custom navigation.

```typescript
analytics.page("/dashboard", {
  section: "analytics",
});
```

### `analytics.message(contact, content)`

Track a contact form message. Messages appear in your dashboard's Messages section where you can view, respond, and manage them.

```typescript
analytics.message("user@example.com", "I need help with my account settings.");

analytics.message("+1234567890", "Please call me back regarding my order.");
```

**Dashboard Features:**

- View all messages with contact info, platform, and country
- Mark messages as "seen" or "completed"
- Add private notes to messages
- Filter by status (new, seen, completed)
- Deep-link to specific messages via URL

### `analytics.cleanup()`

Stop tracking and cleanup resources. Usually not needed unless you want to manually disable analytics.

```typescript
analytics.cleanup();
```

## Event Types

The library automatically tracks and sends these event types:

### Navigation Event

```typescript
{
  type: 'navigation',
  path: '/dashboard',
  date: '2025-01-04T12:00:00.000Z',
  properties?: {
    params?: { id: '123' }
  }
}
```

### Action Event

```typescript
{
  type: 'action',
  name: 'button_click',
  date: '2025-01-04T12:00:00.000Z',
  properties?: { button: 'signup' }
}
```

### Identify Event

```typescript
{
  type: 'identify',
  id: 'user-123',
  date: '2025-01-04T12:00:00.000Z',
  properties?: {
    email: 'user@example.com',
    firstName: 'John'
  }
}
```

### Error Event

```typescript
{
  type: 'error',
  message: 'Payment failed',
  date: '2025-01-04T12:00:00.000Z',
  properties?: {
    message: 'Full error message',
    errorCode: 'CARD_DECLINED'
  }
}
```

### Message Event

```typescript
{
  type: 'message',
  date: '2025-01-04T12:00:00.000Z',
  properties: {
    contact: 'user@example.com',
    content: 'I need help with my account'
  }
}
```

### State Event (React Native only)

```typescript
{
  type: 'state',
  active: true, // or false
  date: '2025-01-04T12:00:00.000Z'
}
```

## Error Boundary

The `AnalyticsErrorBoundary` component automatically catches React rendering errors and reports them to analytics with rich context including stack traces, component stack, route, and device info.

### Basic Usage

```tsx
import {
  AnalyticsProvider,
  AnalyticsErrorBoundary,
} from "@jvidalv/react-analytics";

function App() {
  return (
    <AnalyticsProvider config={{ apiKey: "your-api-key" }}>
      <AnalyticsErrorBoundary>
        <MyApp />
      </AnalyticsErrorBoundary>
    </AnalyticsProvider>
  );
}
```

### Custom Fallback UI

```tsx
<AnalyticsErrorBoundary
  fallback={(error, reset) => (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <MyApp />
</AnalyticsErrorBoundary>
```

### With Error Callback

```tsx
<AnalyticsErrorBoundary
  onError={(error, errorInfo) => {
    // Custom logging, Sentry integration, etc.
    console.error("Caught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }}
>
  <MyApp />
</AnalyticsErrorBoundary>
```

### Props

| Prop       | Type                                                            | Description                                                                                                                                                                |
| ---------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `ReactNode`                                                     | The components to wrap                                                                                                                                                     |
| `fallback` | `ReactNode \| ((error: Error, reset: () => void) => ReactNode)` | UI to show when an error occurs. Can be a static element or a render function with access to the error and reset function. Defaults to `null` for universal compatibility. |
| `onError`  | `(error: Error, errorInfo: ErrorInfo) => void`                  | Optional callback when an error is caught                                                                                                                                  |
| `disabled` | `boolean`                                                       | Set to `true` to disable analytics reporting (still catches errors)                                                                                                        |

### Error Data Captured

When an error is caught, the following data is automatically sent to analytics:

```typescript
{
  type: 'error',
  message: 'Error message here',
  properties: {
    name: 'TypeError',           // Error name
    stack: '...',                // Stack trace (limited to 2000 chars)
    componentStack: '...',       // React component stack (limited to 2000 chars)
    route: '/current/path',      // Current route (web only)
    platform: 'web',             // Platform (web/ios/android)
    osVersion: '14.0',           // OS version
    browser: 'Chrome',           // Browser (web only)
    source: 'ErrorBoundary'      // Identifies the error source
  }
}
```

## Advanced Usage

### Manual Initialization (Without Provider)

For apps that need fine-grained control over initialization timing or lifecycle:

```tsx
import { analytics } from "@jvidalv/react-analytics";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Initialize manually
    analytics.init({
      apiKey: "your-api-key",
      debug: true,
      appVersion: "1.2.3",
      events: {
        disableNavigationEvents: false,
        disableStateEvents: false,
      },
    });

    // Cleanup when component unmounts
    return () => {
      analytics.cleanup();
    };
  }, []);

  return <YourApp />;
}
```

**When to use manual init:**

- You need to initialize analytics conditionally (e.g., based on user consent)
- You're using a custom router not supported by auto-detection
- You want to control exactly when tracking starts
- Your app architecture doesn't support provider patterns

**When to use AnalyticsProvider instead:**

- Most standard React apps (Next.js, Expo, React Router, etc.)
- You want automatic router tracking
- You prefer declarative React patterns

### Manual Router Tracking

If you've manually initialized and want to add router tracking:

```tsx
import { RouterTracker, navigation } from "@jvidalv/react-analytics";

function App() {
  useEffect(() => {
    analytics.init({ apiKey: "your-api-key" });
  }, []);

  return (
    <>
      <RouterTracker onNavigate={navigation} />
      <YourApp />
    </>
  );
}
```

### Disable Automatic Tracking

```tsx
// Disable navigation tracking
<AnalyticsProvider
  config={{
    apiKey: "your-api-key",
    events: {
      disableNavigationEvents: true, // No auto navigation tracking
      disableStateEvents: true, // No app state tracking (RN only)
    },
  }}
>
  <App />
</AnalyticsProvider>
```

### Custom Router Trackers

Use specific router trackers if needed:

```tsx
import {
  ExpoRouterTracker,
  ReactRouterTracker,
  NextAppRouterTracker,
  NextPagesRouterTracker,
} from "@jvidalv/react-analytics";

// Use a specific tracker
<ExpoRouterTracker onNavigate={navigation} />;
```

## How It Works

1. **Initialization**: When you call `analytics.init()` or use `<AnalyticsProvider>`, the library:
   - Detects the platform (web or React Native)
   - Sets up appropriate storage (localStorage or AsyncStorage)
   - Generates or retrieves a persistent anonymous user ID
   - Collects device information
   - Starts the event push queue

2. **Event Queue**: Events are stored in memory and automatically pushed to the API every 5 seconds. If the push fails, the library retries with exponential backoff.

3. **Router Detection**: The library automatically detects which router you're using and tracks navigation changes. Supported routers:
   - expo-router (Expo apps)
   - react-router-dom v6+ (React SPAs)
   - next/router (Next.js Pages Router)
   - next/navigation (Next.js App Router)

4. **Storage**:
   - Web: Uses `localStorage` (no installation needed)
   - React Native: Uses `@react-native-async-storage/async-storage` (must be installed)
   - Fallback: In-memory storage if neither is available

## Troubleshooting

### "AsyncStorage not found" warning (React Native)

Install the peer dependency:

```bash
npm install @react-native-async-storage/async-storage
```

### Navigation not tracking automatically

1. Make sure you're using a supported router
2. Check that `disableNavigationEvents` is not set to `true`
3. Try manual tracking with `analytics.page(path)`

### Events not appearing in dashboard

1. Check your API key is correct
2. Enable `debug: true` in config to see console logs
3. Check network requests in dev tools
4. Ensure you're calling `analytics.init()` before tracking events

## License

ISC

## Support

For issues and feature requests, please visit: https://github.com/jvidalv/react-analytics
