"use client";

import { UsersEmptyState } from "./users/users.empty-state";
import { UsersUsersTable } from "./users/users.users-table";
import { UsersSidebarDetails } from "./users/users.sidebar-details";
import { UsersAggregates } from "./users/users.aggregates";
import { UsersPageDropdown } from "./users/users.page-dropdown";

import { useTitle } from "@/hooks/use-title";
import { useGetAppFromSlug } from "@/domains/app/app.utils";
import { useAnalyticsUsers } from "@/domains/app/users/users.api";
import { useAnalyticsApiKeys } from "@/domains/analytics/analytics-api-keys.api";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { PropsWithChildren, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsUserStats } from "@/domains/app/users/stats/users-stats.api";
import { UsersErrorChart } from "@/app/a/s/[slug]/users/users.error-chart";
import { useMe } from "@/domains/user/me.api";
import { useAnalyticsOverview } from "@/domains/analytics/analytics.api";
import { TrendingUp, TrendingDown } from "lucide-react";

const TableSkeleton = () => (
  <div className="divide-y  border">
    <div className="flex h-12 items-center justify-end p-4">
      <Skeleton className="h-4 w-12" />
    </div>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 " />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    ))}
  </div>
);

const HeaderWrapper = ({
  children,
  rightHeader,
}: PropsWithChildren<{ rightHeader?: ReactNode }>) => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 transition-all">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Understand how your users use your app.
          </p>
        </div>
        {rightHeader}
      </div>
      {children}
    </div>
  );
};

export default function AnalyticsPage() {
  useTitle("Users");
  const { me } = useMe();
  const { app, isLoadingApp } = useGetAppFromSlug();
  const { apiKeys, isLoading: isLoadingApiKeys } = useAnalyticsApiKeys(app?.slug);
  const searchParams = useSearchParams();
  const identifyId = searchParams.get("identifyId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const apiKey = me?.devModeEnabled ? apiKeys?.apiKeyTest : apiKeys?.apiKey;
  const analyticsUsers = useAnalyticsUsers(apiKey, page);
  useAnalyticsUserStats(apiKey);
  const { overview, isLoading: isLoadingOverview } = useAnalyticsOverview(
    app?.slug
  );

  const scrollY = useScrollPosition();
  const shouldMinifyHeader = scrollY > 20;
  const barWidth = 500;

  if (isLoadingApp || isLoadingApiKeys) {
    return (
      <HeaderWrapper>
        <div className="grid h-[1000px] grid-cols-6 gap-8">
          <Skeleton className="col-span-2 h-[196px] w-full" />
          <div className="col-span-4">
            <TableSkeleton />
          </div>
        </div>
      </HeaderWrapper>
    );
  }

  return (
    <>
      <HeaderWrapper rightHeader={<UsersPageDropdown />}>
        {/* Analytics Overview */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="border p-6">
            {isLoadingOverview ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Total Users
                </p>
                <p className="text-3xl font-bold">
                  {overview?.totalUsers.toLocaleString() ?? "—"}
                </p>
              </>
            )}
          </div>

          {/* MAU */}
          <div className="border p-6">
            {isLoadingOverview ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-16" />
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Monthly Active Users
                </p>
                <p className="text-3xl font-bold">
                  {overview?.mau.toLocaleString() ?? "—"}
                </p>
                {overview && overview.mauChange !== 0 && (
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-1 text-sm",
                      overview.mauChange > 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {overview.mauChange > 0 ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                    <span>{Math.abs(overview.mauChange).toFixed(1)}%</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* DAU */}
          <div className="border p-6">
            {isLoadingOverview ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-16" />
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Daily Active Users
                </p>
                <p className="text-3xl font-bold">
                  {overview?.dau.toLocaleString() ?? "—"}
                </p>
                {overview && overview.dauChange !== 0 && (
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-1 text-sm",
                      overview.dauChange > 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {overview.dauChange > 0 ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <TrendingDown className="size-4" />
                    )}
                    <span>{Math.abs(overview.dauChange).toFixed(1)}%</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-8">
          <div className="col-span-2 flex flex-col gap-4">
            <UsersAggregates apiKey={apiKey} />
            <UsersErrorChart apiKey={apiKey} />
          </div>
          <div className="col-span-4">
            {analyticsUsers.totalCount === 0 && (
              <UsersEmptyState apiKeys={apiKeys} apiKey={apiKey} />
            )}
            {analyticsUsers.isLoading && <TableSkeleton />}
            {!!analyticsUsers.totalCount && <UsersUsersTable apiKey={apiKey} />}
          </div>
        </div>
      </HeaderWrapper>
      <div
        className={cn(
          "fixed min-h-screen right-0 top-0 border-l opacity-0 bg-background translate-x-36 transition-all",
          identifyId && "translate-x-0 opacity-100 pointer-events-auto",
          !identifyId && "pointer-events-none [&>*]:opacity-0",
        )}
        style={{ width: barWidth }}
      >
        <div
          className={cn("transition-all pt-24", shouldMinifyHeader && "pt-14")}
        >
          <UsersSidebarDetails apiKey={apiKey} />
        </div>
      </div>
    </>
  );
}
