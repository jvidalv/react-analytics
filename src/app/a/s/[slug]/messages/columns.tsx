"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Message, MessageStatus } from "@/domains/app/messages/messages.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Check, Eye, Mail, Phone, Globe, StickyNote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: MessageStatus }) => {
  const variants: Record<MessageStatus, string> = {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    seen: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
  };

  return (
    <Badge variant="outline" className={cn("capitalize", variants[status])}>
      {status}
    </Badge>
  );
};

export const columns: ColumnDef<Message>[] = [
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const { contact, userName, userEmail, userAvatar } = row.original;
      const isIdentified = userName || userEmail;
      const isEmail = contact.includes("@");

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
              <span className="sensitive text-xs text-muted-foreground">
                {userEmail || contact}
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          {isEmail ? (
            <Mail className="size-4 text-muted-foreground" />
          ) : (
            <Phone className="size-4 text-muted-foreground" />
          )}
          <span className="sensitive font-medium">{contact}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "content",
    header: "Message",
    size: 300,
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewMessage?: (message: Message) => void;
      };
      return (
        <button
          className="max-w-[280px] truncate sensitive text-muted-foreground hover:text-foreground text-left transition-colors"
          onClick={() => meta.onViewMessage?.(row.original)}
        >
          {row.original.content}
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
    header: "Received",
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
      const message = row.original;
      const meta = table.options.meta as {
        onMarkSeen?: (id: string) => void;
        onMarkCompleted?: (id: string) => void;
        onEditNote?: (id: string, currentNotes: string | null) => void;
        onViewMessage?: (message: Message) => void;
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <TooltipWrapper content="View details" asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => meta.onViewMessage?.(message)}
            >
              <Eye className="size-4" />
              <span className="sr-only">View details</span>
            </Button>
          </TooltipWrapper>
          <TooltipWrapper
            content={message.notes ? "Edit note" : "Add note"}
            asChild
          >
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => meta.onEditNote?.(message.id, message.notes)}
            >
              <StickyNote className="size-4" />
              <span className="sr-only">Edit note</span>
            </Button>
          </TooltipWrapper>
          {message.status === "new" && (
            <TooltipWrapper content="Mark as seen" asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => meta.onMarkSeen?.(message.id)}
              >
                <Check className="size-4" />
                <span className="sr-only">Mark as seen</span>
              </Button>
            </TooltipWrapper>
          )}
          {message.status !== "completed" && (
            <TooltipWrapper content="Mark as completed" asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => meta.onMarkCompleted?.(message.id)}
              >
                <Check className="size-4 text-green-500" />
                <span className="sr-only">Mark as completed</span>
              </Button>
            </TooltipWrapper>
          )}
        </div>
      );
    },
  },
];
