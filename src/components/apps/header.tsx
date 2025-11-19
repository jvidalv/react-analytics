import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, LogOut, Plus, Sparkles, User } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUserApps } from "@/domains/app/app.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getColor } from "@/lib/colors";
import { useMe, useToggleDevMode } from "@/domains/user/me.api";
import {
  getPlanDisplayName,
  getPlanEmoji,
  shouldOfferUpgrade,
  PlanType,
} from "@/domains/plan/plan.utils";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { useAppSlugFromParams, useAppBySlug } from "@/domains/app/app.api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAnalyticsOverview } from "@/domains/analytics/analytics.api";

const DevelopmentModeToggle = () => {
  const { me } = useMe();
  const { toggleDevMode } = useToggleDevMode();

  if (!me) {
    return null;
  }

  const handleToggle = async (checked: boolean) => {
    await toggleDevMode(checked);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="development-mode" className="text-sm">
        DEV
      </Label>
      <Switch
        id="development-mode"
        className="data-[state=checked]:bg-orange-500"
        onCheckedChange={handleToggle}
        checked={me.devModeEnabled}
      />
    </div>
  );
};

const Plan = () => {
  const { me } = useMe();
  if (!me) {
    return <Skeleton />;
  }

  return (
    <div
      className={cn(
        "flex h-8 items-center  border px-2 text-sm capitalize",
        me.plan === "starter" &&
          "bg-orange-900/30 border-orange-500/50 text-orange-500/70",
        me.plan === "free" && "bg-neutral-900/80 text-neutral-400",
        me.plan === "pro" &&
          "bg-indigo-900/50 border-indigo-400/30  text-indigo-400 ",
      )}
    >
      <span className="mr-2 font-medium">{getPlanDisplayName(me.plan as PlanType)}</span>
      {getPlanEmoji(me.plan as PlanType)}
    </div>
  );
};

const UserDropdown = ({ onLogout }: { onLogout: () => void }) => {
  const { me } = useMe();

  if (!me) {
    return <Skeleton className="size-10 " />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2  transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:scale-105">
          <Avatar className="size-8">
            {!!me.image && (
              <AvatarImage src={me.image} alt={me.name || "avatar"} />
            )}
            <AvatarFallback>{(me.name || me.email || "?")?.[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 "
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 ">
              {!!me.image && (
                <AvatarImage src={me.image} alt={me.name || "avatar"} />
              )}
              <AvatarFallback className="">
                {(me.name || me.email || "?")?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {me.name || me.email}
              </span>
              {!!me.name && (
                <span className="truncate text-xs text-muted-foreground">
                  {me.email}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        {shouldOfferUpgrade(me.plan as PlanType) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <a
                href={`${process.env.NEXT_PUBLIC_PRO_PLAN}&prefilled_email=${me.email}`}
                target="_blank"
              >
                <DropdownMenuItem className="cursor-pointer font-medium text-violet-500">
                  <Sparkles />
                  Upgrade to Pro
                  <span>⚡</span>
                </DropdownMenuItem>
              </a>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/a/account">
            <DropdownMenuItem>
              <User />
              Account
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Apps = () => {
  const { apps } = useUserApps();
  const appSlug = useAppSlugFromParams(true);
  const { app, isLoading: isLoadingApp } = useAppBySlug(appSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex gap-2 items-center transition-all bg-transparent hover:bg-sidebar-accent group h-9 w-full border-0 px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="-ml-1 flex aspect-square size-8 items-center justify-center ">
            {isLoadingApp ? (
              <Skeleton className="size-5 " />
            ) : app ? (
              <Avatar className="size-5 ">
                <AvatarFallback
                  className="capitalize"
                  style={{ background: app?.primaryColor || undefined }}
                >
                  {app?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-5  bg-neutral-700" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {app ? (
                app?.name || "..."
              ) : (
                <span className="text-muted-foreground">Select an app</span>
              )}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 "
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Apps
        </DropdownMenuLabel>
        {isLoadingApp && (
          <DropdownMenuItem className="gap-2 p-2">
            <Skeleton className="size-6 " />
            ...
          </DropdownMenuItem>
        )}
        {apps?.map((app) => {
          const Content = () => (
            <DropdownMenuItem className="gap-2 p-2">
              <Avatar className="size-6 ">
                <AvatarFallback
                  className="size-6 capitalize"
                  style={{ background: app?.primaryColor || undefined }}
                >
                  {app?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              {app.name}
              <DropdownMenuShortcut>→</DropdownMenuShortcut>
            </DropdownMenuItem>
          );

          return (
            <Link href={`/a/s/${app.slug}`} key={app.slug}>
              <Content />
            </Link>
          );
        })}
        <DropdownMenuSeparator />
        <Link href="/a?create=true">
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center  border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add app</div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function AppHeader() {
  const pathname = usePathname();
  const params = useParams();
  const hasSelectedApp = !!params.slug;
  const { me } = useMe();
  const appSlug = typeof params.slug === "string" ? params.slug : undefined;
  const { overview } = useAnalyticsOverview(appSlug, me?.devModeEnabled);

  if (!hasSelectedApp) {
    return null;
  }

  const links = [
    {
      name: "Overview",
      href: `/a/s/${params.slug}`,
      get current() {
        return pathname === this.href;
      },
    },
    {
      name: "Users",
      href: `/a/s/${params.slug}/users`,
      get current() {
        return pathname === this.href;
      },
    },
    {
      name: "Settings",
      href: `/a/s/${params.slug}/settings`,
      get current() {
        return pathname === this.href;
      },
    },
  ];

  // Only show Overview when there are no users (onboarding state)
  const visibleLinks = overview?.totalUsers === 0
    ? links.filter(link => link.name === "Overview")
    : links;

  return (
    <nav className="pb-4">
      {visibleLinks.map((link) => (
        <Link
          href={link.href}
          key={link.name}
          className={cn(
            "font-medium text-sm pb-4 px-4 duration-500 text-muted-foreground border-b-0 border-transparent transition-all hover:text-foreground",
            link.current && "text-foreground border-foreground border-b-2",
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}

export function AppsHeader({ onLogout }: { onLogout: () => void }) {
  const params = useParams();
  const hasSelectedApp = !!params.slug;
  const scrollY = useScrollPosition();
  const shouldMinifyHeader = scrollY > 20 && hasSelectedApp;

  return (
    <header
      className={cn(
        "fixed w-full top-0 z-20 border-b px-4 backdrop-blur-lg h-fit transition-all",
        shouldMinifyHeader && "h-[60px]",
      )}
    >
      <div className="flex h-16 items-center justify-between">
        <nav className="flex items-center gap-4 ">
          <Link
            href="/a"
            className="transition-all hover:scale-125 hover:text-primary"
          >
            <img src="/assets/images/icon.png" className="size-6" />
          </Link>
          <span className="font-medium text-muted-foreground/50">/</span>
          <div
            className={cn(
              "flex items-center gap-4 transition-all",
              shouldMinifyHeader && "-translate-y-12",
            )}
          >
            <Apps />
          </div>
        </nav>
        <div className="flex items-center gap-4">
          <DevelopmentModeToggle />
          <Plan />
          <UserDropdown onLogout={onLogout} />
        </div>
      </div>
      <div
        className={cn(
          "transition-all",
          shouldMinifyHeader && "-translate-y-11 ml-12",
        )}
      >
        <AppHeader />
      </div>
    </header>
  );
}
