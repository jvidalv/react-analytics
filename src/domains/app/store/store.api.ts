import { Locale } from "@/lib/languages";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { ToneStyle } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

export type AppStoreImage = {
  id: string;
  text: string;
  textPadding: number;
  fontSize: number;
  color: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  imageWidth: number;
  imageTop: number;
  textAlign: "left" | "right" | "center";
  gradientOne: string;
  gradientTwo: string;
  imageUrl?: string;
};

export type AppStoreData = {
  [key in Locale]?: {
    android: {
      shortDescription: string;
      description: string;
      images?: AppStoreImage[];
    };
    ios: {
      shortDescription?: string;
      description: string;
      images?: AppStoreImage[];
    };
  };
};

// Hook to fetch app store data
export const useAppStore = (slug?: string) => {
  const { data, mutate, isLoading } = useSWR<AppStoreData | null>(
    slug ? `/api/app/stores?slug=${slug}` : null,
  );

  return {
    appStoreData: data,
    isLoading,
    refetch: mutate,
  };
};

const createOrUpdateAppStoreFetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: { slug: string; storeData: AppStoreData };
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
    throw new Error("Failed to create or update app store data");
  }

  return (await response.json()) as AppStoreData;
};

export const useCreateOrUpdateAppStore = () => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/app/stores",
    createOrUpdateAppStoreFetcher,
  );

  return { createOrUpdateAppStore: trigger, isMutating };
};

const generateAppStoreTextFetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: {
      slug: string;
      language: Locale;
      tone: ToneStyle;
      fieldName: "shortDescription" | "description";
      platform: "ios" | "android";
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
    throw new Error("Failed to generate app store text");
  }

  return (await response.json()) as { text: string };
};

export const useGenerateAppStoreText = () => {
  const { toast } = useToast();
  const { trigger, isMutating } = useSWRMutation(
    "/api/app/stores/ai",
    generateAppStoreTextFetcher,
    {
      onError: () =>
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "You seem to be using our AI features extensively, let them rest for a while!",
        }),
    },
  );

  return { generateAppStoreText: trigger, isMutating };
};
