import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";
import type {
  AnalyticsError,
  ErrorStatus,
  ErrorsListResponse,
} from "@/api/schemas/error.schema";

// Re-export types for convenience
export type { AnalyticsError, ErrorStatus };
export type ErrorsList = ErrorsListResponse;

export const getErrorsListQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page?: number,
  status?: string,
) =>
  [
    "analytics",
    appSlug,
    "errors",
    "list",
    devModeEnabled,
    page,
    status,
  ] as const;

export const useErrorsList = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page: number = 1,
  status: string = "",
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getErrorsListQueryKey(appSlug, devModeEnabled, page, status),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      if (status) {
        params.append("status", status);
      }

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.errors.list.get({
          query: Object.fromEntries(params),
        });

      if (error) {
        throw error;
      }

      return data as ErrorsList;
    },
    enabled,
  });

  return {
    errorsList: data,
    isLoading,
    refetch,
  };
};

export const getErrorByIdQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  errorId?: string | null,
) => ["analytics", appSlug, "errors", "one", devModeEnabled, errorId] as const;

export const useErrorById = (
  appSlug?: string,
  devModeEnabled?: boolean,
  errorId?: string | null,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined && !!errorId;

  const {
    data,
    isPending: isLoading,
    error: queryError,
  } = useQuery({
    queryKey: getErrorByIdQueryKey(appSlug, devModeEnabled, errorId),
    queryFn: async () => {
      if (!appSlug || !errorId) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.errors({ errorId })
        .get();

      if (error) {
        throw error;
      }

      return data.error as AnalyticsError;
    },
    enabled,
  });

  return {
    error: data,
    isLoading,
    queryError,
  };
};

export const getNewErrorsCountQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => ["analytics", appSlug, "errors", "count", "new", devModeEnabled] as const;

export const useNewErrorsCount = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const { data, isPending: isLoading } = useQuery({
    queryKey: getNewErrorsCountQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return 0;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.errors.list.get({
          query: { page: "1", limit: "1", status: "new" },
        });

      if (error) {
        throw error;
      }

      return (data as ErrorsList)?.pagination?.total ?? 0;
    },
    enabled,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    count: data ?? 0,
    isLoading,
  };
};

export const useUpdateError = (appSlug?: string, _devModeEnabled?: boolean) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      errorId,
      status,
      notes,
    }: {
      errorId: string;
      status?: ErrorStatus;
      notes?: string | null;
    }) => {
      if (!appSlug) throw new Error("App slug required");

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.errors({ errorId })
        .put({
          status,
          notes,
        });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate errors list queries to refetch
      void queryClient.invalidateQueries({
        queryKey: ["analytics", appSlug, "errors"],
      });
    },
  });
};
