"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AnalyticsError, ErrorStatus } from "@/domains/app/errors/errors.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Check, Eye, Globe, StickyNote, Bug } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: ErrorStatus }) => {
  const variants: Record<ErrorStatus, string> = {
    new: "bg-red-500/20 text-red-400 border-red-500/50",
    seen: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    fixed: "bg-green-500/20 text-green-400 border-green-500/50",
  };

  return (
    <Badge variant="outline" className={cn("capitalize", variants[status])}>
      {status}
    </Badge>
  );
};

export const columns: ColumnDef<AnalyticsError>[] = [
  {
    accessorKey: "message",
    header: "Error",
    cell: ({ row, table }) => {
      const { message, route, name } = row.original;
      const meta = table.options.meta as {
        onViewError?: (error: AnalyticsError) => void;
      };
      return (
        <button
          className="flex flex-col items-start text-left max-w-[350px]"
          onClick={() => meta.onViewError?.(row.original)}
        >
          <span className="truncate w-full font-medium hover:text-primary transition-colors">
            {message}
          </span>
          {(route || name) && (
            <span className="text-xs text-muted-foreground truncate w-full">
              {name && <span className="font-mono">{name}</span>}
              {name && route && " • "}
              {route}
            </span>
          )}
        </button>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    size: 70,
    cell: ({ row }) => {
      const notes = row.original.notes;
      if (!notes) {
        return <StickyNote className="size-4 text-muted-foreground/30" />;
      }
      return (
        <TooltipWrapper content={notes}>
          <StickyNote className="size-4 text-primary cursor-help" />
        </TooltipWrapper>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    size: 150,
    cell: ({ row }) => {
      const { userName, userEmail, userAvatar, identifyId } = row.original;
      const isIdentified = userName || userEmail;

      if (isIdentified) {
        const initials = userName
          ? userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : userEmail?.[0]?.toUpperCase() || "?";

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={userAvatar || undefined} alt={userName || ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              {userName && (
                <span className="sensitive font-medium text-sm">
                  {userName}
                </span>
              )}
              <span className="sensitive text-xs text-muted-foreground truncate max-w-[100px]">
                {userEmail || identifyId.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      }

      return (
        <span className="text-xs text-muted-foreground font-mono">
          {identifyId.slice(0, 8)}...
        </span>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    size: 100,
    cell: ({ row }) => {
      const platform = row.original.platform;
      const platformIcon = {
        iOS: <IosIcon className="size-4" />,
        Android: <AndroidIcon className="size-4" />,
        Web: <Globe className="size-4 text-muted-foreground" />,
      }[platform || "Web"];

      return (
        <div className="flex items-center gap-1">
          {platformIcon}
          <span className="text-sm">{platform || "Web"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    size: 120,
    cell: ({ row }) => {
      const country = row.original.country;
      return country ? (
        <div className="flex items-center gap-1">
          <span>{countryCodeToFlag(country)}</span>
          <span className="text-sm">{getCountryName(country)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Occurred",
    size: 130,
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return (
        <TooltipWrapper content={format(date, "d MMM yyyy 'at' HH:mm")}>
          <time dateTime={date.toISOString()} className="text-sm cursor-help">
            {formatDistanceToNow(date, { addSuffix: true })}
          </time>
        </TooltipWrapper>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-right">Actions</div>,
    size: 180,
    cell: ({ row, table }) => {
      const error = row.original;
      const meta = table.options.meta as {
        onMarkSeen?: (id: string) => void;
        onMarkFixed?: (id: string) => void;
        onEditNote?: (id: string, currentNotes: string | null) => void;
        onViewError?: (error: AnalyticsError) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <TooltipWrapper content="View details" asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => meta.onViewError?.(error)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View details</span>
            </Button>
          </TooltipWrapper>
          <TooltipWrapper
            content={error.notes ? "Edit note" : "Add note"}
            asChild
          >
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => meta.onEditNote?.(error.id, error.notes)}
            >
              <StickyNote className="size-4" />
              <span className="sr-only">Edit note</span>
            </Button>
          </TooltipWrapper>
          {error.status === "new" && (
            <TooltipWrapper content="Mark as seen" asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => meta.onMarkSeen?.(error.id)}
              >
                <Check className="size-4" />
                <span className="sr-only">Mark as seen</span>
              </Button>
            </TooltipWrapper>
          )}
          {error.status !== "fixed" && (
            <TooltipWrapper content="Mark as fixed" asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => meta.onMarkFixed?.(error.id)}
              >
                <Bug className="size-4 text-green-500" />
                <span className="sr-only">Mark as fixed</span>
              </Button>
            </TooltipWrapper>
          )}
        </div>
      );
    },
  },
];
