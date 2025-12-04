import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type NewJoiner = {
  identifyId: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  isIdentified: boolean;
  firstSeen: string;
  lastSeen: string;
  country: string | null;
  platform: "iOS" | "Android" | "Web";
  appVersion: string;
};

export type NewJoinersList = {
  users: NewJoiner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getNewJoinersQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page?: number,
) =>
  ["analytics", appSlug, "users", "new-joiners", devModeEnabled, page] as const;

export const useNewJoiners = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page: number = 1,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getNewJoinersQueryKey(appSlug, devModeEnabled, page),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.users["new-joiners"].get({
          query: Object.fromEntries(params),
        });

      if (error) {
        throw error;
      }

      return data as NewJoinersList;
    },
    enabled,
  });

  return {
    newJoinersList: data,
    isLoading,
    refetch,
  };
};
