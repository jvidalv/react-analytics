import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, ChartNoAxesCombined } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { ApiKeys } from "@/domains/analytics/analytics-api-keys.api";
import Link from "next/link";

export function UsersEmptyState({
  apiKeys,
  apiKey,
}: {
  apiKeys?: ApiKeys;
  apiKey?: string;
}) {
  const [copiedProdKey, copyProdKey] = useClipboard();
  const [copiedDevKey, copyDevKey] = useClipboard();

  return (
    <div className="flex flex-col items-center justify-center gap-6  border p-6 py-12">
      <div className="flex w-full max-w-2xl flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined className="mb-2 size-12 text-primary" />
          <h3 className="text-3xl font-bold">Track your first user</h3>
        </div>
        <Link
          href="https://www.npmjs.com/package/@jvidalv/react-analytics"
          target="_blank"
          className="flex items-center gap-1 text-muted-foreground hover:underline"
        >
          @jvidalv/react-analytics <ExternalLink className="size-3" />
        </Link>
      </div>
      <div className="grid w-full max-w-2xl gap-4">
        <div className="space-y-2 text-sm">
          <p>Install the package:</p>
          <pre className=" bg-muted px-3 py-2 text-xs">
            <code>npm install @jvidalv/react-analytics</code>
          </pre>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            Wrap your app with the analytics provider and configure the client:
          </p>
          <pre className=" bg-muted px-3 py-2 text-xs">
            {`import { useMemo } from "react";
import { createAnalyticsClient, ExpofastAnalyticsProvider } from "@jvidalv/react-analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const analyticsClient = useMemo(
    () =>
      createAnalyticsClient({
        apiKey: process.env.EXPO_PUBLIC_EXPOFAST_ANALYTICS_KEY as string,
        asyncStorageInstance: AsyncStorage,
      }),
    []
  );

  return (
    <ExpofastAnalyticsProvider client={analyticsClient}>
      <Content />
    </ExpofastAnalyticsProvider>
  );
}`}
          </pre>
        </div>

        <div className="space-y-2 text-sm">
          <p>Extend your .env file:</p>
          <pre className=" bg-muted px-3 py-2 text-xs">
            {`EXPO_PUBLIC_EXPOFAST_ANALYTICS_KEY=${apiKey}`}
          </pre>
        </div>
        <div className="mt-6 flex w-full flex-col items-stretch gap-4">
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>
                API key for <span className="font-semibold">production</span>
              </Label>
              <button
                onClick={() => copyProdKey(apiKeys?.apiKey || "")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copiedProdKey ? (
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
            <Input value={apiKeys?.apiKey} disabled />
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>
                API key for{" "}
                <span className="font-semibold text-orange-500">
                  development
                </span>
              </Label>
              <button
                onClick={() => copyDevKey(apiKeys?.apiKeyTest || "")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {copiedDevKey ? (
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
            <Input value={apiKeys?.apiKeyTest} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
