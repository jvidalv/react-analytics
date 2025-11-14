import { cn } from "@/lib/utils";
import { TooltipWrapper } from "@/components/custom/tooltip-wrapper";
import { SearchFilterInput } from "@/components/custom/input-search";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { ImportTranslationsPopover } from "@/app/app/s/[slug]/translations/translations.import-popover";
import { ExportTranslationsButton } from "@/app/app/s/[slug]/translations/translations.export";
import { TranslationsPageDropdown } from "@/app/app/s/[slug]/translations/translations.page-dropdown";

interface FilterItem {
  key: string;
  color: string;
  onClick: () => void;
  active: boolean;
}

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  filters: FilterItem[];
  filter: string;
  targetLocale: Locale;
  availableLocales: Locale[];
  onImport: (sourceLocale: Locale) => void;
  currentTranslations: Record<string, string>;
  hasDiff: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const TranslationToolbar = ({
  query,
  onQueryChange,
  filters,
  filter,
  targetLocale,
  availableLocales,
  onImport,
  currentTranslations,
  hasDiff,
  onSave,
  onDelete,
}: Props) => {
  const language = ALL_LANGUAGES.find((lang) => lang.locale === targetLocale);

  return (
    <div className="sticky top-14 -mx-6 -mt-4 mb-4 flex items-center justify-between gap-2 px-6 pb-2 pt-4 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <SearchFilterInput
          value={query}
          placeholder={`Search ${language?.emoji}`}
          className="w-full max-w-sm"
          onChangeText={onQueryChange}
        />
        <div className="flex items-center gap-2 pr-4">
          {filters.map(({ key, color, onClick, active }) => (
            <TooltipWrapper key={key} content={key} asChild>
              <button className="items-center" onClick={onClick}>
                <div
                  className={cn(
                    "transition-all rounded size-4 hover:opacity-100",
                    color,
                    active && "w-12",
                    filter && !active && "opacity-50",
                  )}
                />
              </button>
            </TooltipWrapper>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ExportTranslationsButton
          locale={targetLocale}
          translations={currentTranslations}
          hasDiff={hasDiff}
          onSave={onSave}
        />
        <ImportTranslationsPopover
          targetLocale={targetLocale}
          availableLocales={availableLocales}
          onImport={onImport}
        />
        <TranslationsPageDropdown locale={targetLocale} onDelete={onDelete} />
      </div>
    </div>
  );
};
