import { format } from "date-fns/format";
import { eachDayOfInterval } from "date-fns/eachDayOfInterval";
import useSWR from "swr";
import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

interface AnalyticsUserStatsResponse {
  total: number;
  identifiedCount: number;
  anonymousCount: number;
  iosCount: number;
  androidCount: number;
}

export const useAnalyticsUserStats = (apiKey?: string) => {
  const { data, mutate, isLoading } = useSWR<AnalyticsUserStatsResponse>(
    apiKey ? `/api/analytics/users/stats?apiKey=${apiKey}` : null,
  );

  return {
    stats: data,
    isLoading,
    refetch: mutate,
  };
};

export type AnalyticsMonthlyActiveUsers = {
  identified: number;
  nonIdentified: number;
  total: number;
  growth: number;
};

export const useAnalyticsMonthlyActiveUsers = (apiKey?: string) => {
  const { data, mutate, isLoading } = useSWR<AnalyticsMonthlyActiveUsers>(
    apiKey ? `/api/analytics/users/stats/mau?apiKey=${apiKey}` : null,
  );

  return {
    stats: data,
    isLoading,
    refetch: mutate,
  };
};

export type AggregateRecord = {
  value: string | null;
  count: number;
};

export type AggregateType = "navigation" | "action" | "error" | "country";

export const useAnalyticsAggregates = (
  apiKey?: string,
  type?: AggregateType,
) => {
  const shouldFetch = apiKey && type;
  const { data, isLoading, mutate } = useSWR<{
    data: AggregateRecord[];
  }>(
    shouldFetch
      ? `/api/analytics/users/stats/aggregate?apiKey=${apiKey}&type=${type}`
      : null,
  );

  return {
    aggregates: data?.data ?? [],
    isLoading,
    refetch: mutate,
  };
};

export interface DailyErrorRecord {
  day: string; // yyyy-MM-dd
  message: string;
  count: number;
}

export interface DailyErrorDataPoint {
  day: string;
  [message: string]: string | number; // "day" is string, messages are numbers
}

export function useDailyErrors(apiKey?: string) {
  const { data, error } = useSWR<DailyErrorRecord[]>(
    apiKey ? `/api/analytics/users/all/errors?apiKey=${apiKey}` : null,
  );

  const days = eachDayOfInterval({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    end: new Date(),
  }).map((d) => format(d, "yyyy-MM-dd"));

  const uniqueMessages = Array.from(
    new Set(data?.map((entry) => entry.message) ?? []),
  );

  const grouped: Record<string, Record<string, number>> = {};

  for (const day of days) {
    grouped[day] = {};
    for (const msg of uniqueMessages) {
      grouped[day][msg] = 0;
    }
  }

  for (const entry of data ?? []) {
    if (!grouped[entry.day]) {
      grouped[entry.day] = {};
      for (const msg of uniqueMessages) {
        grouped[entry.day][msg] = 0;
      }
    }
    grouped[entry.day][entry.message] = entry.count;
  }

  const chartData: DailyErrorDataPoint[] = days.map((day) => ({
    day,
    ...grouped[day],
  }));

  return {
    data: chartData,
    messages: uniqueMessages,
    isLoading: !error && !data,
    isError: !!error,
  };
}

// React Query hook for country aggregates (following new Eden Treaty pattern)
export const getCountryAggregatesQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) =>
  [
    "analytics",
    appSlug,
    "stats",
    "country-aggregates",
    devModeEnabled,
  ] as const;

export const useCountryAggregates = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getCountryAggregatesQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["country-aggregates"].get();

      if (error) {
        throw error;
      }

      return data.data as AggregateRecord[];
    },
    enabled,
  });

  return {
    aggregates: data ?? [],
    isLoading,
    refetch,
  };
};

// React Query hook for platform aggregates (following new Eden Treaty pattern)
export type PlatformAggregates = {
  ios: number;
  android: number;
  web: number;
};

export const getPlatformAggregatesQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) =>
  [
    "analytics",
    appSlug,
    "stats",
    "platform-aggregates",
    devModeEnabled,
  ] as const;

export const usePlatformAggregates = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getPlatformAggregatesQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["platform-aggregates"].get();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled,
  });

  return {
    platforms: data,
    isLoading,
    refetch,
  };
};

// React Query hook for identification aggregates (following new Eden Treaty pattern)
export type IdentificationAggregates = {
  identified: number;
  anonymous: number;
  total: number;
  identificationRate: number;
  platforms: {
    ios: {
      total: number;
      identified: number;
      anonymous: number;
    };
    android: {
      total: number;
      identified: number;
      anonymous: number;
    };
    web: {
      total: number;
      identified: number;
      anonymous: number;
    };
  };
  growth: {
    current: number;
    previous: number;
    change: number;
  };
};

export const getIdentificationAggregatesQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) =>
  [
    "analytics",
    appSlug,
    "stats",
    "identification-aggregates",
    devModeEnabled,
  ] as const;

export const useIdentificationAggregates = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getIdentificationAggregatesQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["identification-aggregates"].get();

      if (error) {
        throw error;
      }

      return data as IdentificationAggregates;
    },
    enabled,
  });

  return {
    identification: data,
    isLoading,
    refetch,
  };
};

// React Query hook for error rate aggregates (following new Eden Treaty pattern)
export type ErrorRateAggregates = {
  totalErrors: number;
  totalEvents: number;
  errorRate: number;
  growth: {
    current: number;
    previous: number;
    change: number;
  };
};

export const getErrorRateAggregatesQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) =>
  [
    "analytics",
    appSlug,
    "stats",
    "error-rate-aggregates",
    devModeEnabled,
  ] as const;

export const useErrorRateAggregates = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getErrorRateAggregatesQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.stats["error-rate-aggregates"].get();

      if (error) {
        throw error;
      }

      return data as ErrorRateAggregates;
    },
    enabled,
  });

  return {
    errorRate: data,
    isLoading,
    refetch,
  };
};
