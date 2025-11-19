import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export const getNewJoinersQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => ["analytics", appSlug, "stats", "new-joiners", devModeEnabled] as const;

type NewJoinersData = Awaited<
  ReturnType<
    typeof fetcherProtected.app
  >["analytics"]["stats"]["new-joiners"]["get"]
>["data"];

export const useNewJoiners = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data: newJoiners,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getNewJoinersQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return null;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["new-joiners"].get();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled,
  });

  return { newJoiners, isLoading, refetch };
};
