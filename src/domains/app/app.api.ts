import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { FeatureKey } from "@/lib/features";

export type App = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  primaryColor?: string;
  websiteUrl?: string;
  email?: string;
  features: FeatureKey[];
  createdAt: string;
  updatedAt: string;
};

export const useUserApps = () => {
  const { data, mutate, isLoading } = useSWR<App[]>("/api/app/all");

  return {
    apps: data,
    isLoading,
    refetch: mutate,
  };
};

export const useAppBySlug = (slug?: string) => {
  const { data, mutate, isLoading } = useSWR<App | null>(
    slug ? `/api/app/one?slug=${slug}` : null,
  );

  return {
    app: data,
    isLoading,
    refetch: mutate,
  };
};

const createAppFetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: Omit<App, "userId" | "slug" | "createdAt" | "updatedAt"> & {
      features: string[];
    };
  },
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to create app");
  }

  return (await response.json()) as App;
};

export const useCreateApp = () => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/app/one",
    createAppFetcher,
  );

  return { createApp: trigger, isCreating: isMutating };
};

const updateAppFetcher = async (
  url: string,
  { arg }: { arg: Partial<App> & { id: string } },
) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to update app");
  }

  const updatedApp = await response.json();
  await mutate("/api/app/all"); // Refetch all apps after update
  await mutate(`/api/app?slug=${arg.slug}`); // Refetch the specific app
  return updatedApp;
};

export const useUpdateApp = () => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/app/one",
    updateAppFetcher,
  );

  return { updateApp: trigger, isUpdating: isMutating };
};
