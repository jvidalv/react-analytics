import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type UsersFilters = {
  countries: string[];
  versions: string[];
};

export const getUsersFiltersQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean
) => ["analytics", appSlug, "users", "filters", devModeEnabled] as const;

export const useUsersFilters = (
  appSlug?: string,
  devModeEnabled?: boolean
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getUsersFiltersQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.users.filters.get();

      if (error) {
        throw error;
      }

      return data as UsersFilters;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    filters: data,
    isLoading,
    refetch,
  };
};
