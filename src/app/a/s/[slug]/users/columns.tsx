"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/domains/app/users/users-list.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Globe } from "lucide-react";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { countryCodeToFlag } from "@/lib/country-utils";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      const displayName = user.name || user.email || "Anonymous User";
      const hasNameOrEmail = user.name || user.email;
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            {user.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {displayName}
            </span>
            {hasNameOrEmail && user.email && user.name && (
              <span className="text-sm text-muted-foreground">{user.email}</span>
            )}
            {!hasNameOrEmail && (
              <span className="text-xs text-muted-foreground">
                {user.identifyId.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: () => <div className="text-right">Info</div>,
    cell: ({ row }) => {
      const user = row.original;
      const lastSeen = row.getValue("lastSeen") as string;

      const platformIcon = {
        iOS: <IosIcon className="size-4" />,
        Android: <AndroidIcon className="size-4" />,
        Web: <Globe className="size-4 text-muted-foreground" />,
      }[user.platform];

      return (
        <div className="flex flex-col items-end gap-0.5 text-right">
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {platformIcon}
            {user.country && (
              <span className="text-base">{countryCodeToFlag(user.country)}</span>
            )}
            <span>{user.appVersion}</span>
          </div>
        </div>
      );
    },
  },
];
