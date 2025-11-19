"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import AndroidIcon from "@/components/custom/android-icon";
import IosIcon from "@/components/custom/ios-icon";
import { Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { getColor } from "@/lib/colors";

type NewJoinerUser = {
  identifyId: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  isIdentified: boolean;
  firstSeen: string;
  platform: string;
};

type NewJoinersTableProps = {
  today?: NewJoinerUser[];
  lastWeek?: NewJoinerUser[];
  lastMonth?: NewJoinerUser[];
  isLoading?: boolean;
};

function UserRow({ user }: { user: NewJoinerUser }) {
  const name = user.name || user.userId || user.identifyId.slice(0, 8);
  const firstSeen = formatDistanceToNow(new Date(user.firstSeen), {
    addSuffix: true,
  });
  const backgroundColor = getColor(user.identifyId);

  const isApple = user.platform === "iOS";
  const isAndroid = user.platform === "Android";

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-10">
          {user.avatar && <AvatarImage src={user.avatar} alt={name} />}
          <AvatarFallback style={{ background: backgroundColor }}>
            {name[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{name}</div>
          {user.email && user.email !== name && (
            <div className="text-xs text-muted-foreground">{user.email}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <TooltipWrapper content={user.platform}>
          <div className="flex size-8 items-center justify-center">
            {isApple ? (
              <IosIcon className="size-5" />
            ) : isAndroid ? (
              <AndroidIcon className="size-5" />
            ) : (
              <Globe className="size-5 text-muted-foreground" />
            )}
          </div>
        </TooltipWrapper>
        <div className="min-w-24 text-right text-sm text-muted-foreground">
          {firstSeen}
        </div>
      </div>
    </div>
  );
}

function TimeSection({
  title,
  users,
}: {
  title: string;
  users?: NewJoinerUser[];
}) {
  if (!users?.length) {
    return (
      <div className="p-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <div className="text-sm text-muted-foreground">No new joiners</div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="divide-y">
        {users.map((user) => (
          <UserRow key={user.identifyId} user={user} />
        ))}
      </div>
    </div>
  );
}

export function NewJoinersTable({
  today,
  lastWeek,
  lastMonth,
  isLoading,
}: NewJoinersTableProps) {
  if (isLoading) {
    return (
      <div className="border p-8 text-center text-muted-foreground">
        Loading new joiners...
      </div>
    );
  }

  return (
    <div className="divide-y border">
      <TimeSection title="Today" users={today} />
      <TimeSection title="Last Week" users={lastWeek} />
      <TimeSection title="Last Month" users={lastMonth} />
    </div>
  );
}
