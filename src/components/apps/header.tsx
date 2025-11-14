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
import {
  ChevronsUpDown,
  LogOut,
  MoveUpRight,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ThunderIcon from "@/components/ui/thunder-icon";
import { useUserApps } from "@/domains/app/app.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getColor } from "@/lib/colors";
import { useMe } from "@/domains/user/me.api";
import {
  getUserPlanEmoji,
  shouldOfferUpgrade,
} from "@/domains/user/user.utils";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import {
  useAppSlugFromLocalStorage,
  useGetAppFromLocalStorageSlug,
  useGetAppFromSlug,
} from "@/domains/app/app.utils";
import { useIsDocs } from "@/hooks/use-is-docs";
import { useIsMounted } from "@/hooks/use-is-mounted";

const Plan = () => {
  const { me } = useMe();
  if (!me) {
    return <Skeleton />;
  }

  return (
    <div
      className={cn(
        "flex h-8 items-center rounded-lg border px-2 text-sm capitalize",
        me.plan === "wood" &&
          "bg-orange-900/30 border-orange-500/50 text-orange-500/70",
        me.plan === "straw" && "bg-neutral-900/80 text-neutral-400",
        me.plan === "metal" &&
          "bg-indigo-900/50 border-indigo-400/30  text-indigo-400 ",
      )}
    >
      <span className="mr-2 font-medium">{me.plan}</span>
      {getUserPlanEmoji(me.plan)}
    </div>
  );
};

const UserDropdown = ({ onLogout }: { onLogout: () => void }) => {
  const { me } = useMe();

  if (!me) {
    return <Skeleton className="size-10 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:scale-105">
          <Avatar className="size-8">
            {!!me.image && (
              <AvatarImage src={me.image} alt={me.name || "avatar"} />
            )}
            <AvatarFallback>{(me.name || me.email || "?")?.[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              {!!me.image && (
                <AvatarImage src={me.image} alt={me.name || "avatar"} />
              )}
              <AvatarFallback className="rounded-lg">
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
        {shouldOfferUpgrade(me.plan) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <a
                href={`${process.env.NEXT_PUBLIC_METAL_PLAN}&prefilled_email=${me.email}`}
                target="_blank"
              >
                <DropdownMenuItem className="cursor-pointer font-medium text-violet-500">
                  <Sparkles />
                  Upgrade to Metal
                  <span>🪙</span>
                </DropdownMenuItem>
              </a>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/app/account">
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
  const { app: appFromSlug, isLoadingApp } = useGetAppFromSlug();
  const { app: appFromLocalStorage } = useGetAppFromLocalStorageSlug();
  const { setAppSlug } = useAppSlugFromLocalStorage();
  const isDocs = useIsDocs();

  const app = isDocs ? appFromLocalStorage : appFromSlug;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group h-9 w-full border-0 px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="-ml-1 flex aspect-square size-8 items-center justify-center rounded">
            {isLoadingApp ? (
              <Skeleton className="size-5 rounded" />
            ) : app ? (
              <Avatar className="size-5 rounded">
                {!!app?.logoUrl && (
                  <AvatarImage src={app.logoUrl} className="rounded" />
                )}
                <AvatarFallback
                  className={cn("rounded capitalize", getColor(app.id))}
                  style={{ background: app?.primaryColor || undefined }}
                >
                  {app?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-5 rounded bg-neutral-700" />
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
          <ChevronsUpDown className="group:text-foreground ml-auto text-muted-foreground transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Apps
        </DropdownMenuLabel>
        {isLoadingApp && (
          <DropdownMenuItem className="gap-2 p-2">
            <Skeleton className="size-6 rounded-sm" />
            ...
          </DropdownMenuItem>
        )}
        {apps?.map((app) => {
          const Content = () => (
            <DropdownMenuItem className="gap-2 p-2">
              <Avatar className="size-6 rounded">
                {!!app?.logoUrl && (
                  <AvatarImage src={app.logoUrl} className="size-6" />
                )}
                <AvatarFallback
                  className={cn("size-6 rounded capitalize", getColor(app.id))}
                  style={{ background: app?.primaryColor || undefined }}
                >
                  {app?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              {app.name}
              <DropdownMenuShortcut>→</DropdownMenuShortcut>
            </DropdownMenuItem>
          );

          if (isDocs) {
            return (
              <button onClick={() => setAppSlug(app.slug)} key={app.slug}>
                <Content />
              </button>
            );
          }

          return (
            <Link href={`/app/s/${app.slug}`} key={app.slug}>
              <Content />
            </Link>
          );
        })}
        <DropdownMenuSeparator />
        <Link href="/app/dashboard?create=true">
          <DropdownMenuItem className="gap-2 p-2">
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
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

  if (!hasSelectedApp) {
    return null;
  }

  const links = [
    {
      name: "Overview",
      href: `/app/s/${params.slug}`,
      get current() {
        return pathname === this.href;
      },
    },
    {
      name: "Users",
      href: `/app/s/${params.slug}/users`,
      get current() {
        return pathname === this.href;
      },
    },
    {
      name: "Translations",
      href: `/app/s/${params.slug}/translations`,
      get current() {
        return pathname === this.href;
      },
    },
    {
      name: "Stores",
      href: `/app/s/${params.slug}/stores`,
      get current() {
        return pathname.startsWith(this.href);
      },
    },
    {
      name: "Settings",
      href: `/app/s/${params.slug}/settings`,
      get current() {
        return pathname === this.href;
      },
    },
  ];

  return (
    <nav className="pb-4">
      {links.map((link) => (
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
  const isMounted = useIsMounted();
  const params = useParams();
  const hasSelectedApp = !!params.slug;
  const scrollY = useScrollPosition();
  const shouldMinifyHeader = scrollY > 20 && hasSelectedApp;
  const isDocs = useIsDocs();
  const { appSlug } = useAppSlugFromLocalStorage();

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
            href="/app/dashboard"
            className="transition-all hover:scale-125 hover:text-primary"
          >
            <ThunderIcon className="size-6" />
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
          {isDocs && isMounted ? (
            <Link
              href={
                appSlug ? { pathname: `/app/s/${appSlug}` } : "/apps/dashboard"
              }
              className="flex items-center gap-1 text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              Go to app <MoveUpRight className="size-4 stroke-2" />
            </Link>
          ) : (
            <Link
              href="/app/docs"
              className="flex items-center gap-1 text-sm text-muted-foreground transition-all hover:text-foreground"
            >
              Docs <MoveUpRight className="size-4 stroke-2" />
            </Link>
          )}
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
