"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/domains/app/users/users-list.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Eye, Globe, Info, Maximize2, Copy, Check } from "lucide-react";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import { getAvatarFromUuid, getUuidLastDigits } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";
import { useClipboard } from "@/hooks/use-clipboard";
import { toast } from "sonner";

// Copyable text component with hover button
function CopyableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, copyToClipboard] = useClipboard();

  const handleCopy = () => {
    copyToClipboard(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="group relative inline-flex items-center gap-1.5">
      <span className={cn("cursor-pointer", className)} onClick={handleCopy}>
        {text}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="size-3 text-green-600" />
        ) : (
          <Copy className="size-3 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

// Name cell component
function NameCell({ user }: { user: User }) {
  const isAnonymous = !user.name && !user.email;

  // For anonymous users: use last 8 digits of UUID as name
  const displayName =
    user.name || user.email || getUuidLastDigits(user.identifyId);

  const initials = isAnonymous
    ? getUuidLastDigits(user.identifyId, 2).toUpperCase()
    : displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

  // For anonymous users: use deterministic avatar from UUID
  const avatarSrc = isAnonymous
    ? getAvatarFromUuid(user.identifyId)
    : user.avatar;

  return (
    <div className="flex items-center gap-3">
      <Avatar className={cn("size-10", isAnonymous && "bg-muted/20")}>
        {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="sensitive font-medium">{displayName}</span>
        {!isAnonymous && user.email && user.name && (
          <CopyableText
            text={user.email}
            className="sensitive text-sm text-muted-foreground"
          />
        )}
        {isAnonymous && (
          <CopyableText
            text={user.identifyId}
            className="text-xs text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    // No size specified - will take remaining space with table-fixed layout
    cell: ({ row }) => <NameCell user={row.original} />,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    size: 110,
    cell: ({ row }) => {
      const user = row.original;
      const platformIcon = {
        iOS: <IosIcon className="size-4" />,
        Android: <AndroidIcon className="size-4" />,
        Web: <Globe className="size-4 text-muted-foreground" />,
      }[user.platform];

      return (
        <div className="flex items-center gap-1">
          {platformIcon}
          <span className="text-sm">{user.platform}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    size: 130,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-1">
          {user.country ? (
            <>
              <span className="text-base">
                {countryCodeToFlag(user.country)}
              </span>
              <span className="text-sm">{getCountryName(user.country)}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "appVersion",
    header: "Version",
    size: 90,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="font-mono text-sm text-foreground">
          {user.appVersion}
        </span>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: "Last Seen",
    size: 120,
    cell: ({ row }) => {
      const lastSeen = row.getValue("lastSeen") as string;
      const lastSeenDate = new Date(lastSeen);
      return (
        <TooltipWrapper content={format(lastSeenDate, "d MMM yyyy 'at' HH:mm")}>
          <time
            dateTime={lastSeenDate.toISOString()}
            className="text-sm text-foreground cursor-help"
          >
            {formatDistanceToNow(lastSeenDate, { addSuffix: true })}
          </time>
        </TooltipWrapper>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-right">Actions</div>,
    size: 100,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              // TODO: Handle info action
              console.log("Info clicked for user:", row.original);
            }}
          >
            <Eye className="size-4" />
            <span className="sr-only">View user information</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              // TODO: Handle expand action
              console.log("Expand clicked for user:", row.original);
            }}
          >
            <Maximize2 className="size-4" />
            <span className="sr-only">Expand user details</span>
          </Button>
        </div>
      );
    },
  },
];
