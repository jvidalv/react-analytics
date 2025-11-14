import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useToast } from "@/hooks/use-toast";
import { Locale } from "@/lib/languages";

export type TranslationsData = {
  [key in Locale]?: Record<string, string>;
};

export const useTranslations = (slug?: string) => {
  const { data, mutate, isLoading } = useSWR<{ data: TranslationsData }>(
    slug ? `/api/app/translations?slug=${slug}` : null,
  );

  return {
    translations: data?.data,
    isLoading,
    refetch: mutate,
  };
};

const createOrUpdateTranslationsFetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: { slug: string; data: TranslationsData };
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
    const errorBody = await response.json();
    throw new Error(errorBody?.error || "Failed to update translations");
  }

  return (await response.json()) as TranslationsData;
};

export const useCreateOrUpdateTranslations = () => {
  const { toast } = useToast();

  const { trigger, isMutating } = useSWRMutation(
    "/api/app/translations",
    createOrUpdateTranslationsFetcher,
    {
      onError: (err: Error) => {
        toast({
          title: "Error saving translations",
          description: err.message,
          variant: "destructive",
        });
      },
    },
  );

  return { createOrUpdateTranslations: trigger, isMutating };
};

const translateKeysFetcher = async (
  url: string,
  {
    arg,
  }: {
    arg: { slug: string; language: Locale; entries: Record<string, string> };
  },
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMsg = errorBody?.error;

    if (errorMsg?.toLowerCase()?.includes("rate limit")) {
      throw new Error("You are using AI too often. Try again later.");
    }

    throw new Error(errorMsg || "Failed to translate keys");
  }

  return (await response.json()) as { translations: Record<string, string> };
};

export const useTranslateKeys = () => {
  const { toast } = useToast();

  const { trigger, isMutating } = useSWRMutation(
    "/api/app/translations/ai",
    translateKeysFetcher,
    {
      onError: (err: Error) => {
        toast({
          title: "AI Translation Error",
          description: err.message,
          variant: "destructive",
        });
      },
    },
  );

  return {
    translateKeys: trigger,
    isMutating,
  };
};
