import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type AnalyticsOverview = {
  totalUsers: number;
  mau: number;
  dau: number;
  mauChange: number;
  dauChange: number;
};

export const getAnalyticsOverviewQueryKey = (apiKey?: string) =>
  ["analytics", apiKey, "stats", "overview"] as const;

export const useAnalyticsOverview = (apiKey?: string) => {
  const enabled = !!apiKey;

  const {
    data: overview,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAnalyticsOverviewQueryKey(apiKey),
    queryFn: async () => {
      if (!apiKey) return null;

      const { data, error } = await fetcherProtected
        .analytics({ apiKey })
        .stats.overview.get();

      if (error) {
        throw error;
      }

      return data as AnalyticsOverview;
    },
    enabled,
  });

  return { overview, isLoading, refetch };
};
