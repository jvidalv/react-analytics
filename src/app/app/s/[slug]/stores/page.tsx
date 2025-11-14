"use client";

import * as React from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAppFromSlug } from "@/domains/app/app.utils";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ALL_PLATFORMS, Platform } from "@/lib/platforms";
import {
  AppStoreData,
  useAppStore,
  useCreateOrUpdateAppStore,
  useGenerateAppStoreText,
} from "@/domains/app/store/store.api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, MessageSquare, Save } from "lucide-react";
import { mutate } from "swr";
import { Textarea } from "@/components/ui/textarea";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { useClipboard } from "@/hooks/use-clipboard";
import { MAX_CHARACTERS, TONE_STYLES, ToneStyle } from "@/lib/ai";
import ThunderIcon from "@/components/ui/thunder-icon";

const getData = (data: AppStoreData, language: Locale, platform: Platform) => {
  const foundData = data?.[language]?.[platform];
  if (foundData) return foundData;

  const objectKeys = Object.keys(data) as Locale[];
  const fallbackKey = objectKeys[0];
  if (fallbackKey && data[fallbackKey]?.[platform]) {
    return data[fallbackKey][platform];
  }

  return {
    shortDescription: "",
    description: "",
  };
};

const Texts = ({
  language,
  storeData,
  tone,
  platform,
  appSlug,
}: {
  appSlug?: string;
  language: Locale;
  platform: Platform;
  tone: ToneStyle;
  storeData: AppStoreData;
}) => {
  const { generateAppStoreText, isMutating: isMutatingGenerateAppStoreText } =
    useGenerateAppStoreText();
  const { createOrUpdateAppStore, isMutating } = useCreateOrUpdateAppStore();
  const data = useMemo(
    () => getData(storeData, language, platform),
    [storeData, language, platform],
  );

  const [shortDescription, setShortDescription] = useState<string | undefined>(
    data?.shortDescription,
  );
  const [description, setDescription] = useState<string | undefined>(
    data?.description,
  );

  useEffect(() => {
    if (!data) return;
    setShortDescription(data?.shortDescription);
    setDescription(data?.description);
  }, [data, language, platform]);

  const [shortDescriptionCopied, onCopyShortDescription] = useClipboard();
  const [descriptionCopied, onCopyDescription] = useClipboard();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!appSlug) return;

    await createOrUpdateAppStore({
      slug: appSlug,
      storeData: {
        ...storeData,
        [language]: {
          ...storeData[language],
          [platform]: {
            ...data,
            shortDescription,
            description,
          },
        },
      },
    });

    void mutate(`/api/app/stores?slug=${appSlug}`);
  };

  const onGenerateResponse = async (
    field: "shortDescription" | "description",
  ) => {
    if (!appSlug) return;

    const response = await generateAppStoreText({
      slug: appSlug,
      language,
      tone,
      fieldName: field,
      platform,
    });

    if (field === "description") setDescription(response.text);
    if (field === "shortDescription") setShortDescription(response.text);
  };

  const maxLengthShortDescription = MAX_CHARACTERS.shortDescription[platform];
  const maxLengthDescription = MAX_CHARACTERS.description[platform];

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-end justify-between gap-2">
          <div>
            <Label>Short description</Label>
          </div>
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "text-sm px-2",
                shortDescription?.length &&
                  shortDescription.length > maxLengthShortDescription
                  ? "text-orange-500"
                  : "text-muted-foreground",
              )}
            >
              {shortDescription?.length || 0}/{maxLengthShortDescription}
            </div>
            <TooltipWrapper content="Copy" asChild>
              <button
                type="button"
                className="px-1 text-sm transition-all [&>svg]:size-4"
                onClick={() => {
                  void onCopyShortDescription(shortDescription || "");
                }}
              >
                {shortDescriptionCopied ? <Check /> : <Copy />}
              </button>
            </TooltipWrapper>
          </div>
        </div>
        <div className="flex">
          <Textarea
            placeholder="Write a short and actionable description."
            required
            maxLength={maxLengthShortDescription}
            minLength={10}
            rows={3}
            value={shortDescription}
            onChangeText={setShortDescription}
            className="rounded-r-none"
          />
          <TooltipWrapper content="Generate with AI" asChild>
            <button
              type="button"
              disabled={isMutatingGenerateAppStoreText}
              className={
                "group flex flex-1 flex-col items-center justify-center gap-2 rounded-lg rounded-l-none border border-l-0 px-4 transition-all disabled:opacity-50"
              }
              onClick={() => onGenerateResponse("shortDescription")}
            >
              <div className="text-muted-foreground">
                {isMutatingGenerateAppStoreText ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ThunderIcon className="size-5 transition-all group-hover:scale-125 group-hover:text-primary" />
                )}
              </div>
            </button>
          </TooltipWrapper>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <Label>Description</Label>
          </div>
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "text-sm px-2",
                description?.length && description.length > maxLengthDescription
                  ? "text-orange-500"
                  : "text-muted-foreground",
              )}
            >
              {description?.length || 0}/{maxLengthDescription}
            </div>
            <TooltipWrapper content="Copy" asChild>
              <button
                type="button"
                className="px-1 text-sm transition-all [&>svg]:size-4"
                onClick={() => {
                  void onCopyDescription(description || "");
                }}
              >
                {descriptionCopied ? <Check /> : <Copy />}
              </button>
            </TooltipWrapper>
          </div>
        </div>
        <div className="flex">
          <Textarea
            placeholder="As a recommendation try to make the description about actionable stuff that your app can help with, example:  Plan your routes, log ascents, and challenge yourself!"
            required
            maxLength={maxLengthDescription}
            minLength={10}
            value={description}
            rows={10}
            onChangeText={setDescription}
            className="rounded-r-none"
          />
          <TooltipWrapper content="Generate with AI" asChild>
            <button
              type="button"
              disabled={isMutatingGenerateAppStoreText}
              className={
                "group flex flex-1 flex-col items-center justify-center gap-2 rounded-lg rounded-l-none border border-l-0 px-4 transition-all disabled:opacity-50"
              }
              onClick={() => onGenerateResponse("description")}
            >
              <div className="text-muted-foreground">
                {isMutatingGenerateAppStoreText ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ThunderIcon className="size-5 transition-all group-hover:scale-125 group-hover:text-primary" />
                )}
              </div>
            </button>
          </TooltipWrapper>
        </div>
      </div>
      <Button
        isLoading={isMutating}
        disabled={!shortDescription && !description}
      >
        Save <Save />
      </Button>
    </form>
  );
};

export default function StoresTextsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const languageFromUrl = searchParams.get("language") as Locale | null;
  const platformFromUrl = searchParams.get("platform") as Platform | null;
  const toneFromUrl = searchParams.get("tone") as ToneStyle | null;
  const { appSlug, app } = useGetAppFromSlug();
  const { appStoreData } = useAppStore(appSlug);
  const selectedLanguage: Locale =
    languageFromUrl || app?.languages?.[0] || "en";
  const selectedPlatform: Platform = platformFromUrl || "ios";
  const selectedTone: ToneStyle = toneFromUrl || "normal";

  const handleUrlChange = (
    type: "language" | "platform" | "tone",
    value: string,
  ) => {
    if (!value) return;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(type, value);
    router.push(newUrl.toString(), { scroll: false });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {!app ? (
          <Skeleton className="h-[36px] w-[130px]" />
        ) : (
          <Select
            defaultValue={selectedLanguage}
            onValueChange={(value) => handleUrlChange("language", value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(app?.languages?.length ? app.languages : ["en"]).map(
                  (language) => {
                    const foundLanguage = ALL_LANGUAGES.find(
                      (lang) => lang.locale === language,
                    )!;

                    return (
                      <SelectItem
                        key={language}
                        value={language}
                        aria-label={`Select ${foundLanguage.name}`}
                      >
                        <span className="mr-1.5">{foundLanguage.emoji}</span>{" "}
                        {foundLanguage.name}
                      </SelectItem>
                    );
                  },
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <Select
          defaultValue={selectedPlatform}
          onValueChange={(value) => handleUrlChange("platform", value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ALL_PLATFORMS.map((platform) => (
                <SelectItem
                  key={platform.key}
                  value={platform.key}
                  aria-label={`Select ${platform.name}`}
                >
                  <platform.Icon className="-mt-1 mr-2 inline-flex" />
                  {platform.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          defaultValue={selectedTone}
          onValueChange={(value) => handleUrlChange("tone", value)}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(TONE_STYLES).map((key) => (
                <SelectItem key={key} value={key}>
                  <MessageSquare className="mr-2 inline-flex size-4 text-muted-foreground" />
                  {TONE_STYLES[key as ToneStyle]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Texts
        appSlug={appSlug}
        language={selectedLanguage}
        platform={selectedPlatform}
        tone={selectedTone}
        storeData={appStoreData || {}}
      />
    </div>
  );
}
