import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AnalyticsSession,
  useAnalyticsUserInfo,
  useAnalyticsUserSessions,
  AnalyticsUser,
  AnalyticsUserDeviceInformation,
  AnalyticsEvent,
} from "@/domains/app/users/users.api";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useKey } from "@/hooks/use-key";
import {
  Ban,
  LogIn,
  LogOut,
  MousePointerClick,
  Navigation,
  UserSearch,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserName } from "@/domains/app/users/users.utils";
import { cn } from "@/lib/utils";
import { getColor } from "@/lib/colors";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, EllipsisIcon } from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { JsonDisplay } from "@/components/ui/json-display";
import AndroidIcon from "@/components/ui/android-icon";
import IosIcon from "@/components/ui/ios-icon";
import countries from "@/lib/countries";
import { formatDistanceToNow } from "date-fns";
import { differenceInSeconds, format } from "date-fns";
import { Clock } from "lucide-react";
import { ALL_LANGUAGES } from "@/lib/languages";

function UsersSessionEvent({ event }: { event: AnalyticsEvent }) {
  const { type, properties } = event;

  if (type === "error") {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded border border-red-500 p-1 text-red-500">
          <Ban className="size-3 stroke-2" />
        </div>
        <div className="line-clamp-1 text-left text-sm text-red-500">
          {typeof properties.message === "string"
            ? properties.message
            : "Error"}
        </div>
      </div>
    );
  }

  if (type === "action") {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded border border-purple-500 p-1 text-purple-500">
          <MousePointerClick className="size-3 stroke-2" />
        </div>
        <div className="text-sm text-purple-500">
          {properties.name as string}
        </div>
      </div>
    );
  }

  if (type === "identify") {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded border border-green-500 p-1">
          <UserSearch className="size-3 stroke-2 text-green-500" />
        </div>
        <div className="text-sm text-green-500">User identified</div>
      </div>
    );
  }

  if (type === "state") {
    const isActive = properties.active;
    const Icon = isActive ? LogIn : LogOut;
    const label = isActive ? "User focused the app" : "User unfocused the app";

    return (
      <div className="flex items-center gap-2">
        <div className="rounded border p-1">
          <Icon className="size-3 stroke-1 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    );
  }

  if (type === "navigation") {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded border p-1">
          <Navigation className="size-3 stroke-1 text-muted-foreground" />
        </div>
        <div className="text-sm">{properties.path as string}</div>
      </div>
    );
  }

  return <div>{type}</div>;
}

function UsersSessionGroup({ session }: { session: AnalyticsSession }) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes > 0 ? `${minutes} min ` : ""}${remainingSeconds} sec`;
  };

  const lastSeen = formatDistanceToNow(new Date(session[0].date), {
    addSuffix: true,
  });

  const sessionDuration = differenceInSeconds(
    session[session.length - 1].date,
    session[0].date,
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-mono">{session[0]?.appVersion}</span>
          <span className="ml-1 text-muted-foreground">version</span>
        </div>

        <TooltipWrapper content={lastSeen} asChild>
          <div className="flex items-center gap-1">
            <span className="text-sm">
              {format(session[0].date, "d MMM yyyy, HH:mm")}
            </span>
            <Clock className="size-3 stroke-1 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              For {formatDuration(sessionDuration)}
            </div>
          </div>
        </TooltipWrapper>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        {session.map((event, index) => {
          const prevEvent = index > 0 ? session[index - 1] : null;
          const timeSinceLastEvent =
            prevEvent !== null
              ? differenceInSeconds(
                  new Date(event.date),
                  new Date(prevEvent.date),
                )
              : null;

          const Title = () => {
            const type = event.type;
            const colorMap = {
              navigation: "",
              identify: "text-green-500",
              state: "text-muted-foreground",
              action: "text-purple-500",
              error: "text-red-500",
            };

            return (
              <div className="mb-3 flex items-start justify-between gap-8">
                <div>
                  <h2 className={cn("font-bold", colorMap[type])}>{type}</h2>
                  {timeSinceLastEvent !== null && (
                    <div className="text-sm">
                      {formatDuration(timeSinceLastEvent)} later,{" "}
                      <span className="text-muted-foreground">
                        {format(event.date, "d 'of' MMM yyyy 'at' HH:mm:ss")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          };

          return (
            <TooltipWrapper
              key={event.id}
              content={
                <JsonDisplay
                  title={<Title />}
                  data={event.properties.data as Record<string, unknown>}
                />
              }
            >
              <UsersSessionEvent event={event} />
            </TooltipWrapper>
          );
        })}
      </div>
    </div>
  );
}

function UsersInformation({
  user,
  deviceInformation,
}: {
  user?: AnalyticsUser;
  deviceInformation?: AnalyticsUserDeviceInformation;
}) {
  const [copiedId, copyId] = useClipboard();

  if (!deviceInformation || !user)
    return <Skeleton className="h-[140.5px] w-full" />;

  const isApple = deviceInformation.platform === "ios";
  const isAndroid = deviceInformation.platform === "android";
  const country = countries.find(
    (c) => c.code === deviceInformation.requestMetadata?.country,
  );

  const locale = ALL_LANGUAGES.find(
    ({ locale }) => locale === user.userInformation?.locale,
  );

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div>
        <div className="text-sm">User ID</div>
        {user.userId ? (
          <button
            onClick={() => copyId(user.userId)}
            className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground"
          >
            {user.userId}
            {copiedId ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        ) : (
          <div className="text-sm text-muted-foreground/70">Anonymous user</div>
        )}
      </div>
      <div>
        <div className="flex flex-wrap gap-2">
          {isAndroid && (
            <Badge variant="outline">
              <AndroidIcon className="mr-1" /> Android
            </Badge>
          )}
          {isApple && (
            <Badge variant="outline">
              <IosIcon className="mr-1" /> iOS
            </Badge>
          )}
          {country && (
            <Badge variant="outline">
              <span className="mr-2">{country.emoji}</span> {country.name}
            </Badge>
          )}
          {locale && (
            <Badge variant="outline">
              <span className="mr-2">{locale.emoji}</span>
              {locale.name}
            </Badge>
          )}
          <TooltipWrapper
            content={
              <JsonDisplay title="Information" data={deviceInformation} />
            }
          >
            <Badge variant="outline" className="cursor-pointer">
              <EllipsisIcon className="mr-1" /> More information
            </Badge>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  );
}

function UserDetailsHeader({ user }: { user: AnalyticsUser }) {
  const [copiedEmail, copyEmail] = useClipboard();
  const name = getUserName(user);
  const email = user?.userInformation?.email;
  const emailEqualsName = email === name;
  const hasUserId = !!user.userId;
  const hasUserData = !!Object.keys(user?.userInformation || {})?.length;

  return (
    <div className="flex items-center gap-4">
      <Avatar
        className={cn("size-14", user?.active && "border-4 border-green-500")}
      >
        <AvatarImage src={user?.userInformation?.avatarUrl} />
        <AvatarFallback className={getColor(user.identifyId)}>
          {hasUserId ? (hasUserData ? name[0] : "🧑‍🦲") : "🥷"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="sensitive font-medium">{name}</div>
        {email && !emailEqualsName && (
          <button
            onClick={() => copyEmail(email)}
            className="sensitive flex items-center gap-2 text-sm text-muted-foreground"
          >
            {email}
            {copiedEmail ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function UsersSidebarDetails({ apiKey }: { apiKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const identifyId = searchParams.get("identifyId");

  const { user } = useAnalyticsUserInfo(identifyId, apiKey);
  const { sessions } = useAnalyticsUserSessions(identifyId, apiKey);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("identifyId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useKey("Escape", handleClose);

  return (
    <div className="relative h-screen overflow-y-auto pb-6">
      <div className="sticky top-0 px-4 pb-4 backdrop-blur-lg">
        <div className="-mt-4 flex items-start justify-between pt-6">
          {user ? (
            <UserDetailsHeader user={user} />
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <div>
                <Skeleton className="mb-1 h-6 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          )}
          <Button onClick={handleClose} variant="ghost" size="sm">
            <X />
          </Button>
        </div>
      </div>
      <div className="my-4 flex flex-col gap-2 px-4">
        <h4 className="text-lg font-bold">Information</h4>
        <UsersInformation
          user={user}
          deviceInformation={user?.deviceInformation}
        />
      </div>
      <div className="mb-16 flex flex-col gap-2 px-4">
        <h4 className="mt-4 text-lg font-bold">Last sessions</h4>
        <div className="grid gap-4">
          {!sessions?.length && (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="mb-2 flex justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-56 w-full" />
                </div>
              ))}
            </>
          )}
          {sessions?.map((session) => (
            <UsersSessionGroup key={session[0].id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
