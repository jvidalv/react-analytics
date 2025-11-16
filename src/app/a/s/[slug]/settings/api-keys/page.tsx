"use client";

import { useAppSlugFromParams, useAppBySlug } from "@/domains/app/app.api";
import { useAnalyticsApiKeys } from "@/domains/analytics/analytics-api-keys.api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClipboard } from "@/hooks/use-clipboard";
import { Copy, Check } from "lucide-react";
import { useMe } from "@/domains/user/me.api";
import { useToggleDevMode } from "@/domains/user/me.api";

function ApiKeyDisplay({
  apiKey,
  label,
}: {
  apiKey?: string;
  label: string;
}) {
  const [copied, copy] = useClipboard();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          onClick={() => copy(apiKey || "")}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          disabled={!apiKey}
        >
          {copied ? (
            <>
              <Check className="size-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>
      <Input value={apiKey || ""} disabled className="font-mono text-sm" />
    </div>
  );
}

export default function ApiKeysPage() {
  const appSlug = useAppSlugFromParams();
  const { app, isLoading: isLoadingApp } = useAppBySlug(appSlug);
  const { me } = useMe();
  const { toggleDevMode } = useToggleDevMode();
  const { apiKeys, isLoading } = useAnalyticsApiKeys(appSlug);

  if (isLoadingApp || isLoading || !app) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }

  const handleToggle = async (checked: boolean) => {
    await toggleDevMode(checked);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Use these keys to authenticate your app with the analytics API. Keep
            them secure and never commit them to version control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiKeyDisplay
            apiKey={apiKeys?.apiKey}
            label="Production API Key"
          />
          <ApiKeyDisplay
            apiKey={apiKeys?.apiKeyTest}
            label="Development API Key"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Mode</CardTitle>
          <CardDescription>
            When enabled, your app will use the development API key and query
            test data. This allows you to test analytics without affecting
            production data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="development-mode" className="font-medium">
                Enable Development Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Currently using:{" "}
                {me?.devModeEnabled ? (
                  <span className="font-medium text-orange-600">
                    Development Key
                  </span>
                ) : (
                  <span className="font-medium text-green-600">
                    Production Key
                  </span>
                )}
              </p>
            </div>
            <Switch
              id="development-mode"
              className="data-[state=checked]:bg-orange-500"
              onCheckedChange={handleToggle}
              checked={me?.devModeEnabled || false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
