import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";
import { PlanType } from "@/domains/plan/plan.utils";

export type UserPlans = PlanType;

export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  plan: string;
  devModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

// Query key function for cache invalidation
export const getUserQueryKey = () => ["user", "me"] as const;

export const useMe = () => {
  const {
    data: me,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getUserQueryKey(),
    queryFn: async () => {
      const { data, error } = await fetcherProtected.user.me.get();

      if (error) {
        throw error;
      }

      return data.message;
    },
  });

  return {
    me,
    isLoading,
    refetch,
  };
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedFields: { name?: string; image?: string }) => {
      const { data, error } =
        await fetcherProtected.user.me.post(updatedFields);

      if (error) {
        throw error;
      }

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: getUserQueryKey() });

      return data.message;
    },
  });

  return {
    updateUser,
    isUpdating,
  };
};

export const useToggleDevMode = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: toggleDevMode, isPending: isToggling } = useMutation({
    mutationFn: async (devModeEnabled: boolean) => {
      const { data, error } = await fetcherProtected.user.mode.post({
        devModeEnabled,
      });

      if (error) {
        throw error;
      }

      // Invalidate and refetch user data
      void queryClient.invalidateQueries({ queryKey: getUserQueryKey() });

      return data.message;
    },
  });

  return {
    toggleDevMode,
    isToggling,
  };
};
