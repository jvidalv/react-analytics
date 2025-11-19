"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToggleDevMode } from "@/domains/user/me.api";

type Framework = "nextjs" | "expo" | "react-router" | "react";
type PackageManager = "npm" | "yarn" | "pnpm" | "bun" | "expo";

interface OnboardingProps {
  apiKey?: string;
  apiKeyTest?: string;
  devModeEnabled?: boolean;
}

export function UsersOnboarding({
  apiKey,
  apiKeyTest,
  devModeEnabled,
}: OnboardingProps) {
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [selectedPM, setSelectedPM] = useState<PackageManager>("npm");

  const [copiedProdKey, copyProdKey] = useClipboard();
  const [copiedTestKey, copyTestKey] = useClipboard();
  const [copiedInstall, copyInstall] = useClipboard();
  const [copiedCode, copyCode] = useClipboard();

  const { toggleDevMode } = useToggleDevMode();

  const handleToggleDevMode = async (checked: boolean) => {
    await toggleDevMode(checked);
  };

  const frameworks = [
    { id: "nextjs" as Framework, name: "Next.js", icon: "▲" },
    { id: "expo" as Framework, name: "Expo Router", icon: "◆" },
    { id: "react-router" as Framework, name: "React Router", icon: "◉" },
    { id: "react" as Framework, name: "React (Other)", icon: "⚛" },
  ];

  const packageManagers = selectedFramework === "expo"
    ? [{ id: "expo" as PackageManager, name: "Expo CLI" }]
    : [
        { id: "npm" as PackageManager, name: "npm" },
        { id: "yarn" as PackageManager, name: "yarn" },
        { id: "pnpm" as PackageManager, name: "pnpm" },
        { id: "bun" as PackageManager, name: "bun" },
      ];

  const getInstallCommand = () => {
    const pkg = "@jvidalv/react-analytics";
    switch (selectedPM) {
      case "npm": return `npm install ${pkg}`;
      case "yarn": return `yarn add ${pkg}`;
      case "pnpm": return `pnpm add ${pkg}`;
      case "bun": return `bun add ${pkg}`;
      case "expo": return `npx expo install ${pkg} @react-native-async-storage/async-storage`;
      default: return `npm install ${pkg}`;
    }
  };

  const getCodeSnippet = () => {
    const key = apiKeyTest || "your-api-key-here";

    switch (selectedFramework) {
      case "nextjs":
        return `// app/layout.tsx
import { AnalyticsProvider, createAnalyticsClient } from '@jvidalv/react-analytics'

const analyticsClient = createAnalyticsClient({
  apiKey: "${key}",
  endpoint: "${window.location.origin}/api/analytics/push"
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider client={analyticsClient}>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
}`;

      case "expo":
        return `// app/_layout.tsx
import { AnalyticsProvider, createAnalyticsClient } from '@jvidalv/react-analytics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Stack } from 'expo-router'

const analyticsClient = createAnalyticsClient({
  apiKey: "${key}",
  endpoint: "${window.location.origin}/api/analytics/push",
  asyncStorageInstance: AsyncStorage
})

export default function Layout() {
  return (
    <AnalyticsProvider client={analyticsClient}>
      <Stack />
    </AnalyticsProvider>
  )
}`;

      case "react-router":
        return `// App.tsx
import { AnalyticsProvider, createAnalyticsClient } from '@jvidalv/react-analytics'
import { RouterProvider } from 'react-router-dom'

const analyticsClient = createAnalyticsClient({
  apiKey: "${key}",
  endpoint: "${window.location.origin}/api/analytics/push"
})

function App() {
  return (
    <AnalyticsProvider client={analyticsClient}>
      <RouterProvider router={router} />
    </AnalyticsProvider>
  )
}`;

      case "react":
        return `// App.tsx
import { AnalyticsProvider, createAnalyticsClient } from '@jvidalv/react-analytics'

const analyticsClient = createAnalyticsClient({
  apiKey: "${key}",
  endpoint: "${window.location.origin}/api/analytics/push"
})

function App() {
  return (
    <AnalyticsProvider client={analyticsClient}>
      {/* Your app components */}
    </AnalyticsProvider>
  )
}`;

      default:
        return "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="mb-3 text-4xl font-bold">Welcome to React Analytics! 👋</h1>
        <p className="text-lg text-muted-foreground">
          Get started in minutes with our universal analytics library
        </p>
      </div>

      {/* Step 1: Choose Framework */}
      <div className="space-y-4">
        <div>
          <h2 className="mb-1 text-xl font-semibold">Step 1: Choose Your Framework</h2>
          <p className="text-sm text-muted-foreground">Select your router to see tailored setup instructions</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              onClick={() => {
                setSelectedFramework(framework.id);
                setSelectedPM(framework.id === "expo" ? "expo" : "npm");
              }}
              className={cn(
                "flex flex-col items-center gap-3 border-2 p-6 transition-all hover:border-primary",
                selectedFramework === framework.id && "border-primary bg-primary/5"
              )}
            >
              <span className="text-4xl">{framework.icon}</span>
              <span className="font-medium">{framework.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedFramework && (
        <>
          {/* Step 2: Install Package */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Step 2: Install Package</h2>
              <p className="text-sm text-muted-foreground">Add the analytics library to your project</p>
            </div>

            {/* Package Manager Tabs */}
            <div className="flex gap-2 border-b">
              {packageManagers.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPM(pm.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    selectedPM === pm.id
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {pm.name}
                </button>
              ))}
            </div>

            {/* Install Command */}
            <div className="relative">
              <pre className="overflow-x-auto border bg-muted/30 p-4 pr-14 font-mono text-sm">
                {getInstallCommand()}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-2 border"
                onClick={() => copyInstall(getInstallCommand())}
              >
                {copiedInstall ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Step 3: API Keys */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Step 3: Get Your API Keys</h2>
              <p className="text-sm text-muted-foreground">
                Use test key for development, production key for live apps
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Test Key */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Test Key</span>
                  <span className="bg-orange-500/20 px-2 py-0.5 text-xs text-orange-600">DEV</span>
                </div>
                <div className="relative">
                  <pre className="overflow-x-auto border bg-muted/30 p-3 pr-12 font-mono text-xs">
                    {apiKeyTest || "Loading..."}
                  </pre>
                  {apiKeyTest && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-1 top-1 h-7 border"
                      onClick={() => copyTestKey(apiKeyTest)}
                    >
                      {copiedTestKey ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* Production Key */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Production Key</span>
                  <span className="bg-green-500/20 px-2 py-0.5 text-xs text-green-600">PROD</span>
                </div>
                <div className="relative">
                  <pre className="overflow-x-auto border bg-muted/30 p-3 pr-12 font-mono text-xs">
                    {apiKey || "Loading..."}
                  </pre>
                  {apiKey && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-1 top-1 h-7 border"
                      onClick={() => copyProdKey(apiKey)}
                    >
                      {copiedProdKey ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Add to App */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Step 4: Add to Your App</h2>
              <p className="text-sm text-muted-foreground">
                Wrap your app with the AnalyticsProvider
              </p>
            </div>

            <div className="relative">
              <pre className="overflow-x-auto border bg-muted/30 p-4 pr-14 font-mono text-xs leading-relaxed">
                {getCodeSnippet()}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-2 border"
                onClick={() => copyCode(getCodeSnippet())}
              >
                {copiedCode ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Step 5: Verify */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Step 5: Start Your App</h2>
              <p className="text-sm text-muted-foreground">
                Launch your app and navigate around - analytics will start flowing automatically!
              </p>
            </div>

            <div className="border p-6 text-left">
              <p className="mb-2 text-sm font-medium">⏳ Waiting for first event...</p>
              <p className="text-xs text-muted-foreground">
                Refresh this page once you've started your app
              </p>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="border-t pt-6 text-left">
            <p className="mb-3 text-sm text-muted-foreground">
              Need help? Check out the full documentation
            </p>
            <div className="flex justify-start gap-4">
              <a
                href="https://github.com/jvidalv/react-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                GitHub Repository →
              </a>
              <a
                href="https://www.npmjs.com/package/@jvidalv/react-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                NPM Package →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
