import { cn } from "@/lib/utils";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { TranslationsData } from "@/domains/app/translation/translation.api";

interface Props {
  languages?: Locale[];
  selectedLanguage: Locale;
  localTranslations: Record<string, Record<string, string>>;
  originalTranslations?: TranslationsData;
  isLoadingApp: boolean;
  onSelect: (lang: Locale) => void;
}

export const TranslationLanguageSelector = ({
  languages,
  selectedLanguage,
  localTranslations,
  originalTranslations,
  onSelect,
}: Props) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {languages?.map((l) => {
        const language = ALL_LANGUAGES.find((lang) => lang.locale === l);
        if (!language) return null;
        const locale = language.locale;

        const current = localTranslations?.[locale] || {};
        const original = originalTranslations?.[locale] || {};
        const total =
          Object.keys(current).length || Object.keys(original).length;

        const hasNew = Object.keys(current).some(
          (key) => original[key] === undefined,
        );
        const hasModified = Object.keys(current).some(
          (key) =>
            original[key] !== undefined && original[key] !== current[key],
        );
        const hasMissing = Object.values(current).some(
          (val) => val.trim() === "",
        );

        const active = locale === selectedLanguage;

        return (
          <button
            key={l}
            onClick={() => onSelect(l as Locale)}
            className={cn(
              "flex w-full items-center gap-2 px-4 text-muted-foreground py-2 rounded-lg hover:bg-border/80 transition-all",
              active && "bg-border/80 text-foreground",
            )}
          >
            <span
              className={cn(
                "flex flex-1 items-center text-base font-medium transition-all",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="mr-1.5">{language.emoji}</span>
              {language.name}
            </span>
            <span className="flex items-center gap-1">
              {hasNew && <div className="size-2 rounded bg-green-500" />}
              {hasModified && <div className="size-2 rounded bg-orange-500" />}
              {hasMissing && <div className="size-2 rounded bg-red-500" />}
              {!!total && (
                <span
                  className={cn(
                    "ml-1 rounded border border-foreground/50 px-1 text-sm font-medium transition-all",
                    !active && "opacity-50",
                  )}
                >
                  {total}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
