import { useQuery } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";

export type AggregateRecord = {
  value: string | null;
  count: number;
};

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

      return data.data as unknown as AggregateRecord[];
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
