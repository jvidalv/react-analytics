import { useParams } from "next/navigation";
import { useUserApps } from "@/domains/app/app.api";
import { create } from "zustand";

export const useGetAppFromSlug = () => {
  const params = useParams();
  const { apps, isLoading } = useUserApps();
  const slug = params.slug as string;
  const app = apps?.find((app) => app.slug === params.slug);

  return { appSlug: slug, hasApp: !!slug, app, isLoadingApp: isLoading };
};

export const useGetAppFromLocalStorageSlug = () => {
  const { apps, isLoading } = useUserApps();
  const { appSlug } = useAppSlugFromLocalStorage();
  const app = apps?.find((app) => app.slug === appSlug);

  return { appSlug, hasApp: !!app, app, isLoadingApp: isLoading };
};

interface UseAppSlugFromLocalStorage {
  appSlug: string | null;
  setAppSlug: (slug: string) => void;
  removeAppSlug: () => void;
}

export const useAppSlugFromLocalStorage = create<UseAppSlugFromLocalStorage>(
  (set) => ({
    appSlug:
      typeof window !== "undefined"
        ? localStorage.getItem("last-app-slug")
        : null,
    setAppSlug: (slug: string) => {
      localStorage.setItem("last-app-slug", slug);
      set({ appSlug: slug });
    },
    removeAppSlug: () => {
      localStorage.removeItem("last-app-slug");
      set({ appSlug: null });
    },
  }),
);
