import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  EllipsisVertical,
  KeySquare,
  Check,
  Copy,
  EyeOff,
  BookText,
} from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { useAppSlugFromParams, useAppBySlug } from "@/domains/app/app.api";
import { useAnalyticsApiKeys } from "@/domains/analytics/analytics-api-keys.api";
import { useSensitive } from "@/hooks/use-sensitive";

export function UsersPageDropdown() {
  const appSlug = useAppSlugFromParams();
  const { app } = useAppBySlug(appSlug);
  const { apiKeys } = useAnalyticsApiKeys(appSlug);
  const [copiedProdKey, copyProdKey] = useClipboard();
  const [copiedDevKey, copyDevKey] = useClipboard();
  const { enabled: sensitiveEnabled, toggle: toggleSensitive } = useSensitive();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <KeySquare className="mr-2 size-4" /> API Keys
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => copyDevKey(apiKeys?.apiKeyTest || "")}
                >
                  Development{" "}
                  {copiedDevKey ? (
                    <Check className="ml-auto text-green-500" />
                  ) : (
                    <Copy className="ml-auto text-muted-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyProdKey(apiKeys?.apiKey || "")}
                >
                  Production{" "}
                  {copiedProdKey ? (
                    <Check className="ml-auto text-green-500" />
                  ) : (
                    <Copy className="ml-auto text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={toggleSensitive}>
            <EyeOff className="mr-2 size-4" />
            {sensitiveEnabled
              ? "Turn off sensitive mode"
              : "Turn on sensitive mode"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              window.open(
                "https://www.npmjs.com/package/@jvidalv/react-analytics",
              )
            }
          >
            <BookText className="mr-2 size-4" />
            @jvidalv/react-analytics
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
