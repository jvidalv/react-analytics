import useSWR from "swr";

export type AnalyticsUserDeviceInformation = {
  platform: string;
  osVersion: string;
  brand: string;
  modelName: string;
  isSimulator: boolean;
  androidPlatformApiLevel: number | null;
  requestMetadata: {
    country: string | null;
    userAgent: string;
  };
};

export type AnalyticsUser = {
  identifyId: string;
  appVersion: string;
  userId: string;
  lastUpdate: string;
  deviceInformation: AnalyticsUserDeviceInformation;
  active: boolean;
  userInformation?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    locale?: string;
  } & Record<string, unknown>;
};

export type PaginationMeta = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type AnalyticsUsersResponse = {
  data: AnalyticsUser[];
  pagination: PaginationMeta;
};

type Filters = {
  platform?: "ios" | "android";
  country?: string;
  appVersion?: string;
  query?: string;
};

export const useAnalyticsUsers = (
  apiKey?: string,
  page: number = 1,
  pageSize: number = 10,
  filters: Filters = {},
) => {
  const params = new URLSearchParams();

  if (apiKey) params.set("apiKey", apiKey);
  if (page) params.set("page", page.toString());
  if (pageSize) params.set("pageSize", pageSize.toString());
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.country) params.set("country", filters.country);
  if (filters.appVersion) params.set("appVersion", filters.appVersion);
  if (filters.query) params.set("query", filters.query);

  const url = apiKey ? `/api/analytics/users/all?${params.toString()}` : null;

  const { data, mutate, isLoading } = useSWR<AnalyticsUsersResponse>(url);

  return {
    data: data?.data || [],
    totalCount: data?.pagination.total,
    page: data?.pagination.page || 1,
    pageSize: data?.data?.length,
    isLoading,
    refetch: mutate,
  };
};

export type AnalyticsEvent = {
  id: string;
  identifyId: string;
  appVersion: string;
  userId: string | null;
  type: "navigation" | "identify" | "action" | "state" | "error";
  properties: Record<string, unknown>;
  date: string;
  info: Record<string, unknown>;
};

export type AnalyticsSession = AnalyticsEvent[];

export type AnalyticsSessionsResponse = {
  data: AnalyticsSession[];
};

export const useAnalyticsUserSessions = (
  identifyId?: string | null,
  apiKey?: string | undefined,
) => {
  const { data, mutate, isLoading } = useSWR<AnalyticsSessionsResponse>(
    identifyId && apiKey
      ? `/api/analytics/users/one/sessions?identifyId=${identifyId}&apiKey=${apiKey}`
      : null,
  );

  return {
    sessions: data?.data ?? [],
    isLoading,
    refetch: mutate,
  };
};

export const useAnalyticsUserInfo = (
  identifyId?: string | null,
  apiKey?: string,
) => {
  const { data, mutate, isLoading } = useSWR<{
    data: AnalyticsUser;
  }>(
    identifyId && apiKey
      ? `/api/analytics/users/one?identifyId=${identifyId}&apiKey=${apiKey}`
      : null,
  );

  return {
    user: data?.data,
    isLoading,
    refetch: mutate,
  };
};
