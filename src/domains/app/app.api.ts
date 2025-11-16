import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";
import { FeatureKey } from "@/lib/features";

export type App = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  primaryColor: string | null;
  websiteUrl: string | null;
  email: string | null;
  features: string[];
  createdAt: string;
  updatedAt: string;
};

// Query key functions for cache invalidation
export const getAppQueryKey = (slug?: string) => ["app", slug] as const;
export const getAllAppsQueryKey = () => ["apps", "all"] as const;

export const useUserApps = () => {
  const {
    data: apps,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAllAppsQueryKey(),
    queryFn: async () => {
      const { data, error } = await fetcherProtected.app.all.get();

      if (error) {
        throw error;
      }

      return data.message;
    },
  });

  return {
    apps,
    isLoading,
    refetch,
  };
};

export const useAppBySlug = (slug?: string) => {
  const enabled = !!slug;

  const {
    data: app,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getAppQueryKey(slug),
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await fetcherProtected.app({ slug }).get();

      if (error) {
        throw error;
      }

      return data.message;
    },
    enabled,
  });

  return {
    app,
    isLoading,
    refetch,
  };
};

export const useCreateApp = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: createApp, isPending: isCreating } = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      description?: string;
      primaryColor?: string;
      features?: string[];
    }) => {
      const { data, error } = await fetcherProtected.app.create.post(payload);

      if (error) {
        throw error;
      }

      return data.message;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getAllAppsQueryKey(),
      });
    },
  });

  return {
    createApp,
    isCreating,
  };
};

export const useUpdateApp = (slug?: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateApp, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: {
      name?: string;
      description?: string;
      primaryColor?: string;
      features?: string[];
      websiteUrl?: string;
      email?: string;
    }) => {
      if (!slug) throw new Error("No app slug provided");

      const { data, error } = await fetcherProtected
        .app({ slug })
        .put(payload);

      if (error) {
        throw error;
      }

      return data.message;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getAppQueryKey(slug),
      });
      void queryClient.invalidateQueries({
        queryKey: getAllAppsQueryKey(),
      });
    },
  });

  return {
    updateApp,
    isUpdating,
  };
};
