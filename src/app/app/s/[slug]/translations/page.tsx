"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Locale } from "@/lib/languages";
import { flattenJson } from "@/lib/json";
import { toast } from "@/hooks/use-toast";
import { useGetAppFromSlug } from "@/domains/app/app.utils";
import {
  useCreateOrUpdateTranslations,
  useTranslations,
} from "@/domains/app/translation/translation.api";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TranslationLanguageSelector } from "./translations.language-selector";
import { TranslationToolbar } from "./translations.toolbar";
import { TranslationList } from "./translations.list";
import { TranslationEmptyState } from "./translations.empty-state";
import { TranslateAllButton } from "@/app/app/s/[slug]/translations/translations.all";
import { useTitle } from "@/hooks/use-title";

const Header = () => (
  <div className="mb-8 flex flex-col items-end justify-between gap-4 sm:flex-row">
    <div>
      <h1 className="text-3xl font-bold">Translations</h1>
      <p className="text-muted-foreground">
        Effortlessly streamline your translation workflow with AI.
      </p>
    </div>
  </div>
);

export default function TranslationPage() {
  useTitle("Translations");
  const searchParams = useSearchParams();
  const router = useRouter();
  const languageFromUrl = searchParams.get("language") as Locale | null;
  const query = searchParams.get("query") || "";
  const filter = searchParams.get("filter");
  const { appSlug, app, isLoadingApp } = useGetAppFromSlug();
  const {
    translations: originalTranslations,
    refetch,
    isLoading: isLoadingTranslations,
  } = useTranslations(appSlug);
  const { createOrUpdateTranslations, isMutating } =
    useCreateOrUpdateTranslations();

  const selectedLanguage: Locale =
    languageFromUrl || app?.languages?.[0] || "en";

  const [localTranslations, setLocalTranslations] = useState<{
    [locale in Locale]?: Record<string, string>;
  }>({});

  const handleLanguageChange = (value: Locale) => {
    const url = new URL(window.location.href);
    url.searchParams.set("language", value);
    router.push(url.toString(), { scroll: false });
  };

  const handleFilterChange = (value: string) => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("filter") === value) {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", value);
    }
    router.push(url.toString(), { scroll: false });
  };

  const handleTranslationChange = (key: string, value: string) => {
    setLocalTranslations((prev) => ({
      ...prev,
      [selectedLanguage]: {
        ...(prev[selectedLanguage] ||
          originalTranslations?.[selectedLanguage] ||
          {}),
        [key]: value,
      },
    }));
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete?")) {
      await createOrUpdateTranslations({
        slug: appSlug,
        data: { ...originalTranslations, [selectedLanguage]: {} },
      });
      setLocalTranslations((lc) => ({ ...lc, [selectedLanguage]: {} }));
      await refetch();
    }
  };

  const handleSave = async () => {
    if (!appSlug) return;
    try {
      await createOrUpdateTranslations({
        slug: appSlug,
        data: { ...originalTranslations, ...localTranslations },
      });
      await refetch();
      handleFilterChange(filter || "");
    } catch (err) {
      toast({
        title: "Error saving translations",
        description: (err as Error)?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const currentTranslations = useMemo(
    () => localTranslations?.[selectedLanguage],
    [localTranslations, selectedLanguage],
  );
  const original = useMemo(
    () => originalTranslations?.[selectedLanguage],
    [originalTranslations, selectedLanguage],
  );
  const translations = useMemo(
    () => currentTranslations || original || {},
    [currentTranslations, original],
  );

  const hasDiff = useMemo(() => {
    if (!original || !currentTranslations) return false;
    return JSON.stringify(original) !== JSON.stringify(currentTranslations);
  }, [original, currentTranslations]);

  const handleImportFromLocale = (sourceLocale: Locale) => {
    const sourceTranslations =
      localTranslations?.[sourceLocale] ||
      originalTranslations?.[sourceLocale] ||
      {};

    const existing = localTranslations?.[selectedLanguage] || {};
    const updated: Record<string, string> = {};

    for (const key in sourceTranslations) {
      updated[key] = existing[key] ?? sourceTranslations[key];
    }

    setLocalTranslations((prev) => ({
      ...prev,
      [selectedLanguage]: updated,
    }));
  };

  const filteredTranslations = useMemo(() => {
    return Object.entries(translations)
      .filter(([key, value]) => {
        const originalVal = original?.[key];
        const isNew = originalVal === undefined;
        const isModified = !isNew && originalVal !== value;
        const isMissing = value.trim() === "";

        let matches = true;
        if (filter === "new") matches = isNew;
        if (filter === "modified") matches = isModified;
        if (filter === "missing") matches = isMissing;

        const matchesQuery = `${key} ${value}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matches && matchesQuery;
      })
      .sort(([a], [b]) => {
        const aNew = original?.[a] === undefined;
        const bNew = original?.[b] === undefined;
        return Number(bNew) - Number(aNew);
      });
  }, [translations, original, filter, query]);

  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInputFocused =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active instanceof HTMLElement && active.isContentEditable);
      if (isInputFocused) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        if (!hasDiff || confirm("You have unsaved translations, continue?")) {
          try {
            const text = await navigator.clipboard.readText();
            const json = JSON.parse(text);
            setLocalTranslations((lc) => ({
              ...lc,
              [selectedLanguage]: flattenJson(json),
            }));

            toast({
              title: "Success",
              description: "Your translations where added successfully!",
              variant: "success",
            });
          } catch {
            toast({
              title: "Clipboard Error",
              description: "Could not access or parse clipboard content.",
              variant: "destructive",
            });
          }
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasDiff, selectedLanguage]);

  const filters = [
    {
      key: "new",
      color: "bg-green-500",
      onClick: () => handleFilterChange("new"),
      active: filter === "new",
    },
    {
      key: "modified",
      color: "bg-orange-500",
      onClick: () => handleFilterChange("modified"),
      active: filter === "modified",
    },
    {
      key: "missing",
      color: "bg-red-500",
      onClick: () => handleFilterChange("missing"),
      active: filter === "missing",
    },
  ];

  const availableLocales = (app?.languages || []).filter((l) => {
    const local = localTranslations?.[l];
    const original = originalTranslations?.[l];
    const merged = { ...original, ...local };
    return merged && Object.keys(merged).length > 0;
  });

  if (isLoadingTranslations || isLoadingApp) {
    return (
      <div className="mx-auto max-w-7xl">
        <Header />
        <div className="grid grid-cols-8 gap-8">
          <div className="col-span-2">
            <Skeleton className="mb-2 h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="col-span-6">
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-9 w-60" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-2">
          <div className="sticky top-14 -mt-4 mb-6 pb-2 pt-4 backdrop-blur-lg">
            <TranslationLanguageSelector
              languages={app?.languages}
              selectedLanguage={selectedLanguage}
              localTranslations={localTranslations}
              originalTranslations={originalTranslations}
              isLoadingApp={isLoadingApp}
              onSelect={handleLanguageChange}
            />
            <div className="mt-4">
              <Button
                onClick={handleSave}
                disabled={isMutating || !Object.keys(localTranslations).length}
                isLoading={isMutating}
                className="w-full"
              >
                Save all <Save />
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-6">
          {isLoadingTranslations ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : !Object.keys(translations).length ? (
            <TranslationEmptyState
              locale={selectedLanguage}
              onImport={handleImportFromLocale}
              availableLocales={availableLocales}
            />
          ) : (
            <>
              <TranslationToolbar
                query={query}
                onQueryChange={(v) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("query", v);
                  router.push(url.toString(), { scroll: false });
                }}
                filters={filters}
                filter={filter || ""}
                onImport={handleImportFromLocale}
                availableLocales={availableLocales}
                targetLocale={selectedLanguage}
                onSave={handleSave}
                currentTranslations={translations}
                hasDiff={hasDiff}
                onDelete={handleDelete}
              />
              {!filteredTranslations.length ? (
                <div className="rounded-lg border p-4 text-sm">
                  No translations found by given filters.
                </div>
              ) : (
                <>
                  <TranslateAllButton
                    translations={translations}
                    appSlug={appSlug}
                    locale={selectedLanguage}
                    original={original}
                    onUpdate={(updated) =>
                      setLocalTranslations((prev) => ({
                        ...prev,
                        [selectedLanguage]: {
                          ...(prev[selectedLanguage] || {}),
                          ...updated,
                        },
                      }))
                    }
                  />
                  <TranslationList
                    entries={filteredTranslations}
                    original={original || {}}
                    onChange={handleTranslationChange}
                    targetLocale={selectedLanguage}
                    appSlug={appSlug}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
