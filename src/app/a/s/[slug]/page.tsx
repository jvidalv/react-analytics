"use client";

import { UsersOnboarding } from "./users/users.onboarding";

import { useTitle } from "@/hooks/use-title";
import { useAppSlugFromParams, useAppBySlug } from "@/domains/app/app.api";
import { useAnalyticsApiKeys } from "@/domains/analytics/analytics-api-keys.api";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { useQueryStates, parseAsInteger } from "nuqs";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import {
  useAnalyticsUserStats,
  usePlatformAggregates,
  useIdentificationAggregates,
  useCountryAggregates,
  useErrorRateAggregates,
} from "@/domains/app/users/stats/users-stats.api";
import { useMe } from "@/domains/user/me.api";
import { useAnalyticsOverview } from "@/domains/analytics/analytics.api";
import { useNewJoiners } from "@/domains/app/users/new-joiners.api";
import { TrendingUp, TrendingDown, Globe } from "lucide-react";
import { getUuidLastDigits } from "@/lib/avatar-utils";
import IosIcon from "@/components/custom/ios-icon";
import AndroidIcon from "@/components/custom/android-icon";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import { countryCodeToFlag, getCountryName } from "@/lib/country-utils";

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

const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 transition-all">
      {children}
    </div>
  );
};

// Helper function to get initials from name or email
const getInitials = (name?: string | null, email?: string | null): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
};

// New Joiner Row Component
const NewJoinerRow = ({ user }: { user: any }) => {
  const displayName = user.name || user.email || user.identifyId;
  const lastDigits = getUuidLastDigits(user.identifyId);
  const firstSeenDate = new Date(user.firstSeen);
  const initials = getInitials(user.name, user.email);

  return (
    <div
      key={user.identifyId}
      className="flex items-center justify-between p-2 gap-4"
    >
      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="size-10 shrink-0">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">
            {user.name || user.email || `User ${lastDigits}`}
          </span>
          {user.email && user.name && (
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          )}
          {!user.name && !user.email && (
            <span className="text-xs font-mono text-muted-foreground truncate">
              {user.identifyId}
            </span>
          )}
        </div>
      </div>

      {/* Platform */}
      <div className="flex items-center gap-1.5 w-20 shrink-0">
        {user.platform === "iOS" && (
          <TooltipWrapper content="iOS">
            <IosIcon className="size-4" />
          </TooltipWrapper>
        )}
        {user.platform === "Android" && (
          <TooltipWrapper content="Android">
            <AndroidIcon className="size-4" />
          </TooltipWrapper>
        )}
        {user.platform === "Web" && (
          <TooltipWrapper content="Web">
            <Globe className="size-4 text-muted-foreground" />
          </TooltipWrapper>
        )}
        <span className="text-sm">{user.platform}</span>
      </div>

      {/* Country */}
      <div className="w-16 shrink-0 text-center">
        {user.country ? (
          <TooltipWrapper content={getCountryName(user.country)}>
            <span className="text-lg">{countryCodeToFlag(user.country)}</span>
          </TooltipWrapper>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Version */}
      <div className="w-20 shrink-0">
        <span className="text-xs px-2 py-1 bg-muted rounded">
          {user.appVersion || "—"}
        </span>
      </div>

      {/* Joined Time */}
      <div className="w-32 text-right shrink-0">
        <TooltipWrapper content={format(firstSeenDate, "PPpp")}>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(firstSeenDate, { addSuffix: true })}
          </span>
        </TooltipWrapper>
      </div>
    </div>
  );
};

export default function OverviewPage() {
  useTitle("Overview");
  const { me } = useMe();
  const appSlug = useAppSlugFromParams();
  const { app, isLoading: isLoadingApp } = useAppBySlug(appSlug);
  const { apiKeys, isLoading: isLoadingApiKeys } = useAnalyticsApiKeys(appSlug);
  const apiKey = me?.devModeEnabled ? apiKeys?.apiKeyTest : apiKeys?.apiKey;

  useAnalyticsUserStats(apiKey);

  const { overview, isLoading: isLoadingOverview } = useAnalyticsOverview(
    app?.slug,
    me?.devModeEnabled,
  );
  const { platforms, isLoading: isLoadingPlatforms } = usePlatformAggregates(
    app?.slug,
    me?.devModeEnabled,
  );
  const { identification, isLoading: isLoadingIdentification } =
    useIdentificationAggregates(app?.slug, me?.devModeEnabled);
  const { aggregates: countries, isLoading: isLoadingCountries } =
    useCountryAggregates(app?.slug, me?.devModeEnabled);
  const { errorRate, isLoading: isLoadingErrorRate } = useErrorRateAggregates(
    app?.slug,
    me?.devModeEnabled,
  );

  // New Joiners state and data
  const [newJoinersFilters, setNewJoinersFilters] = useQueryStates(
    {
      njPage: parseAsInteger.withDefault(1),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const { newJoinersList, isLoading: isLoadingNewJoiners } = useNewJoiners(
    app?.slug,
    me?.devModeEnabled,
    newJoinersFilters.njPage,
  );

  if (isLoadingApp || isLoadingApiKeys) {
    return (
      <PageWrapper>
        {/* Overview Cards Skeleton - 3x3 grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-[145.5px] w-full" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  // Show onboarding when there are no users in current mode
  if (!isLoadingOverview && overview?.totalUsers === 0) {
    return (
      <PageWrapper>
        <UsersOnboarding
          apiKey={apiKeys?.apiKey}
          apiKeyTest={apiKeys?.apiKeyTest}
          devModeEnabled={me?.devModeEnabled}
        />
      </PageWrapper>
    );
  }

  return (
    <>
      <PageWrapper>
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="border p-6">
            {isLoadingOverview || isLoadingPlatforms ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-32" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-xs text-muted-foreground">TU</p>
                </div>
                <p className="text-3xl font-bold">
                  {overview?.totalUsers.toLocaleString() ?? "—"}
                </p>
                {/* Platform Breakdown */}
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <TooltipWrapper content="Web Users">
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {platforms?.web.toLocaleString() ?? "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="iOS Users">
                    <div className="flex items-center gap-1.5">
                      <IosIcon className="size-4" />
                      <span className="font-medium">
                        {platforms?.ios.toLocaleString() ?? "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="Android Users">
                    <div className="flex items-center gap-1.5">
                      <AndroidIcon className="size-4" />
                      <span className="font-medium">
                        {platforms?.android.toLocaleString() ?? "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                </div>
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
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Monthly Active Users
                  </p>
                  <p className="text-xs text-muted-foreground">MAU</p>
                </div>
                <p className="text-3xl font-bold">
                  {overview?.mau.toLocaleString() ?? "—"}
                </p>
                {overview && overview.mauChange !== 0 && (
                  <TooltipWrapper content="Change vs. previous 30 days">
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-1 text-sm",
                        overview.mauChange > 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {overview.mauChange > 0 ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                      <span>{Math.abs(overview.mauChange).toFixed(1)}%</span>
                    </div>
                  </TooltipWrapper>
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
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Daily Active Users
                  </p>
                  <p className="text-xs text-muted-foreground">DAU</p>
                </div>
                <p className="text-3xl font-bold">
                  {overview?.dau.toLocaleString() ?? "—"}
                </p>
                {overview && overview.dauChange !== 0 && (
                  <TooltipWrapper content="Change vs. previous 24 hours">
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-1 text-sm",
                        overview.dauChange > 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {overview.dauChange > 0 ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                      <span>{Math.abs(overview.dauChange).toFixed(1)}%</span>
                    </div>
                  </TooltipWrapper>
                )}
              </>
            )}
          </div>
        </div>

        {/* Identification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identified Users */}
          <div className="border p-6">
            {isLoadingIdentification ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-32" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Identified Users
                  </p>
                  <p className="text-xs text-muted-foreground">IU</p>
                </div>
                <p className="text-3xl font-bold">
                  {identification?.identified.toLocaleString() ?? "—"}
                </p>
                {/* Platform Breakdown */}
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <TooltipWrapper content="Web Users">
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {identification?.platforms.web.identified.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="iOS Users">
                    <div className="flex items-center gap-1.5">
                      <IosIcon className="size-4" />
                      <span className="font-medium">
                        {identification?.platforms.ios.identified.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="Android Users">
                    <div className="flex items-center gap-1.5">
                      <AndroidIcon className="size-4" />
                      <span className="font-medium">
                        {identification?.platforms.android.identified.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                </div>
              </>
            )}
          </div>

          {/* Anonymous Users */}
          <div className="border p-6">
            {isLoadingIdentification ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-32" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Anonymous Users
                  </p>
                  <p className="text-xs text-muted-foreground">AU</p>
                </div>
                <p className="text-3xl font-bold">
                  {identification?.anonymous.toLocaleString() ?? "—"}
                </p>
                {/* Platform Breakdown */}
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <TooltipWrapper content="Web Users">
                    <div className="flex items-center gap-1.5">
                      <Globe className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {identification?.platforms.web.anonymous.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="iOS Users">
                    <div className="flex items-center gap-1.5">
                      <IosIcon className="size-4" />
                      <span className="font-medium">
                        {identification?.platforms.ios.anonymous.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                  <TooltipWrapper content="Android Users">
                    <div className="flex items-center gap-1.5">
                      <AndroidIcon className="size-4" />
                      <span className="font-medium">
                        {identification?.platforms.android.anonymous.toLocaleString() ??
                          "—"}
                      </span>
                    </div>
                  </TooltipWrapper>
                </div>
              </>
            )}
          </div>

          {/* User Conversion */}
          <div className="border p-6">
            {isLoadingIdentification ? (
              <>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="mt-2 h-4 w-16" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    User Conversion
                  </p>
                  <p className="text-xs text-muted-foreground">UC</p>
                </div>
                <p className="text-3xl font-bold">
                  {identification?.identificationRate.toFixed(1)}%
                </p>
                {identification && identification.growth.change !== 0 && (
                  <TooltipWrapper content="Change vs. previous 30 days">
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-1 text-sm",
                        identification.growth.change > 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {identification.growth.change > 0 ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                      <span>
                        {Math.abs(identification.growth.change).toFixed(1)}%
                      </span>
                    </div>
                  </TooltipWrapper>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Countries */}
          <div className="border p-6">
            {isLoadingCountries ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-32" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Top Countries</p>
                  <p className="text-xs text-muted-foreground">TC</p>
                </div>
                {countries && countries.length > 0 ? (
                  <>
                    {/* Top Country */}
                    <TooltipWrapper
                      content={getCountryName(countries[0].value)}
                    >
                      <p className="text-3xl font-bold">
                        {countryCodeToFlag(countries[0].value)}{" "}
                        {countries[0].count.toLocaleString()}
                      </p>
                    </TooltipWrapper>
                    {/* Countries 2-4 */}
                    {countries.length > 1 && (
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        {countries.slice(1, 4).map((country, idx) => (
                          <TooltipWrapper
                            key={idx}
                            content={getCountryName(country.value)}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">
                                {countryCodeToFlag(country.value)}
                              </span>
                              <span className="font-medium">
                                {country.count.toLocaleString()}
                              </span>
                            </div>
                          </TooltipWrapper>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-3xl font-bold">—</p>
                )}
              </>
            )}
          </div>

          {/* Error Rate */}
          <div className="border p-6">
            {isLoadingErrorRate ? (
              <>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="mt-2 h-4 w-16" />
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-xs text-muted-foreground">ER</p>
                </div>
                <p className="text-3xl font-bold">
                  {errorRate?.errorRate.toFixed(2)}%
                </p>
                {errorRate && errorRate.growth.change !== 0 && (
                  <TooltipWrapper content="Change vs. previous 30 days">
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-1 text-sm",
                        errorRate.growth.change < 0
                          ? "text-green-600"
                          : "text-red-600",
                      )}
                    >
                      {errorRate.growth.change < 0 ? (
                        <TrendingDown className="size-4" />
                      ) : (
                        <TrendingUp className="size-4" />
                      )}
                      <span>
                        {Math.abs(errorRate.growth.change).toFixed(2)}%
                      </span>
                    </div>
                  </TooltipWrapper>
                )}
              </>
            )}
          </div>

          {/* Placeholder Card */}
          <div className="border bg-muted/20 p-6 flex items-center justify-center text-5xl">
            🕺🏽
          </div>
        </div>

        {/* New Joiners Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isLoadingNewJoiners ? (
                "New Joiners"
              ) : newJoinersList?.pagination.total === 0 ? (
                "No new joiners this week"
              ) : newJoinersList?.pagination.total === 1 ? (
                "1 new joiner this week"
              ) : (
                `${newJoinersList?.pagination.total} new joiners this week`
              )}
            </h2>
            <Link
              href={`/a/s/${appSlug}/users`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all users →
            </Link>
          </div>

          {isLoadingNewJoiners ? (
            <TableSkeleton />
          ) : (
            <>
              <div className="border">
                <div className="divide-y">
                  {newJoinersList?.users && newJoinersList.users.length > 0 ? (
                    newJoinersList.users.map((user) => (
                      <NewJoinerRow key={user.identifyId} user={user} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No new users found in this period.
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination - only show if more than 25 users */}
              {newJoinersList?.pagination && newJoinersList.pagination.total > 25 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {newJoinersList.pagination.page} of {newJoinersList.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewJoinersFilters({ njPage: Math.max(1, newJoinersFilters.njPage - 1) })
                      }
                      disabled={newJoinersFilters.njPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewJoinersFilters({
                          njPage: Math.min(newJoinersList.pagination.totalPages, newJoinersFilters.njPage + 1),
                        })
                      }
                      disabled={newJoinersFilters.njPage === newJoinersList.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
}
