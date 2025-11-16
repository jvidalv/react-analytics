"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/domains/app/users/users-list.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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
    header: "Last Seen",
    cell: ({ row }) => {
      const lastSeen = row.getValue("lastSeen") as string;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
        </span>
      );
    },
  },
];
