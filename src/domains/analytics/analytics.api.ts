import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type AnalyticsOverview = {
  totalUsers: number;
  mau: number;
  dau: number;
  mauChange: number;
  dauChange: number;
};

export const getAnalyticsOverviewQueryKey = (appSlug?: string) =>
  ["analytics", appSlug, "stats", "overview"] as const;

export const useAnalyticsOverview = (appSlug?: string) => {
  const enabled = !!appSlug;

  const {
    data: overview,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAnalyticsOverviewQueryKey(appSlug),
    queryFn: async () => {
      if (!appSlug) return null;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats.overview.get();

      if (error) {
        throw error;
      }

      return data as AnalyticsOverview;
    },
    enabled,
  });

  return { overview, isLoading, refetch };
};
