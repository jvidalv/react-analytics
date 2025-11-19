"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/domains/app/users/users-list.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Eye, Globe, Info, Maximize2 } from "lucide-react";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import { getAvatarFromUuid, getUuidLastDigits } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    // No size specified - will take remaining space with table-fixed layout
    cell: ({ row }) => {
      const user = row.original;
      const isAnonymous = !user.name && !user.email;

      // For anonymous users: use last 8 digits of UUID as name
      const displayName = user.name || user.email || getUuidLastDigits(user.identifyId);

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
              <span className="sensitive text-sm text-muted-foreground">
                {user.email}
              </span>
            )}
            {isAnonymous && (
              <span className="text-xs text-muted-foreground">
                {user.identifyId}
              </span>
            )}
          </div>
        </div>
      );
    },
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
    header: () => <div className="text-right">Actions</div>,
    size: 230,
    cell: ({ row }) => {
      const lastSeen = row.getValue("lastSeen") as string;
      return (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground mr-1">
            {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
          </span>
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
