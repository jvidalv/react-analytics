import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export const getAnalyticsOverviewQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => ["analytics", appSlug, "stats", "overview", devModeEnabled] as const;

type OverviewData = Awaited<
  ReturnType<typeof fetcherProtected.app>["analytics"]["stats"]["overview"]["get"]
>["data"];

export const useAnalyticsOverview = (
  appSlug?: string,
  devModeEnabled?: boolean,
  options?: Partial<UseQueryOptions<OverviewData>>,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data: overview,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAnalyticsOverviewQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return null;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats.overview.get();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled,
    ...options,
  });

  return { overview, isLoading, refetch };
};

export const getAnalyticsOverviewCombinedQueryKey = (appSlug?: string) =>
  ["analytics", appSlug, "stats", "overview-combined"] as const;

type OverviewCombinedData = Awaited<
  ReturnType<
    typeof fetcherProtected.app
  >["analytics"]["stats"]["overview-combined"]["get"]
>["data"];

export const useAnalyticsOverviewCombined = (
  appSlug?: string,
  options?: Partial<UseQueryOptions<OverviewCombinedData>>,
) => {
  const enabled = !!appSlug;

  const {
    data: overviewCombined,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAnalyticsOverviewCombinedQueryKey(appSlug),
    queryFn: async () => {
      if (!appSlug) return null;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["overview-combined"].get();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled,
    ...options,
  });

  return { overviewCombined, isLoading, refetch };
};
