import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type ApiKeys = {
  id: string;
  userId: string;
  appId: string;
  apiKey: string;
  apiKeyTest: string;
  createdAt: Date;
  updatedAt: Date;
};

export const getAnalyticsApiKeysQueryKey = (appSlug?: string) =>
  ["analytics", appSlug, "api-keys"] as const;

export const useAnalyticsApiKeys = (appSlug?: string) => {
  const enabled = !!appSlug;

  const {
    data: apiKeys,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAnalyticsApiKeysQueryKey(appSlug),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics["api-keys"].get();

      if (error) {
        throw error;
      }

      return data.message as ApiKeys;
    },
    enabled,
  });

  return {
    apiKeys,
    isLoading,
    refetch,
  };
};
