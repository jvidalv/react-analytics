import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type User = {
  identifyId: string;
  userId: string | null;
  name: string | null;
  email: string | null;
  avatar: string | null;
  isIdentified: boolean;
  lastSeen: string;
  country: string | null;
  platform: 'iOS' | 'Android' | 'Web';
  appVersion: string;
};

export type UsersList = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const getUsersListQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page?: number,
  search?: string,
  platform?: string,
  country?: string,
  version?: string,
  identified?: boolean
) =>
  [
    "analytics",
    appSlug,
    "users",
    "list",
    devModeEnabled,
    page,
    search,
    platform,
    country,
    version,
    identified,
  ] as const;

export const useUsersList = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page: number = 1,
  search: string = "",
  platform: string = "",
  country: string = "",
  version: string = "",
  identified?: boolean
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getUsersListQueryKey(appSlug, devModeEnabled, page, search, platform, country, version, identified),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      if (search) {
        params.append("search", search);
      }

      if (platform) {
        params.append("platform", platform);
      }

      if (country) {
        params.append("country", country);
      }

      if (version) {
        params.append("version", version);
      }

      if (identified !== undefined) {
        params.append("identified", identified.toString());
      }

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.users.list.get({
          query: Object.fromEntries(params),
        });

      if (error) {
        throw error;
      }

      return data as UsersList;
    },
    enabled,
  });

  return {
    usersList: data,
    isLoading,
    refetch,
  };
};
