import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { ImportTranslations } from "@/app/app/s/[slug]/translations/translations.import";

interface Props {
  locale: Locale;
  availableLocales: Locale[];
  onImport: (sourceLocale: Locale) => void;
}

export const TranslationEmptyState = ({
  locale,
  availableLocales,
  onImport,
}: Props) => {
  const language = ALL_LANGUAGES.find((lang) => lang.locale === locale);

  const importableLocales = availableLocales.filter((l) => l !== locale);
  const hasImportableContent = importableLocales.length > 0;

  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border px-6 py-16 text-sm">
      <div className="mb-3 text-5xl transition-all duration-500">
        {language?.emoji}
      </div>
      <h2 className="mb-6 text-2xl font-semibold">
        {language?.name} translations
      </h2>
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-lg border p-5 shadow">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h5 className="mb-1 font-medium text-foreground">Copy & Paste</h5>
              <p>
                Paste your <code className="font-bold text-primary">.json</code>{" "}
                file content.
              </p>
            </div>
            {hasImportableContent && (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-px w-full bg-border" />
                  <span className="text-muted-foreground/80">or</span>
                  <div className="h-px w-full bg-border" />
                </div>
                <div>
                  <h5 className="mb-1 font-medium text-foreground">
                    Import from another language
                  </h5>
                  <p className="mb-2">
                    Import the keys and values from another language
                  </p>
                  <ImportTranslationTool
                    targetLocale={locale}
                    availableLocales={availableLocales}
                    onImport={onImport}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ImportToolProps {
  targetLocale: Locale;
  availableLocales: Locale[];
  onImport: (sourceLocale: Locale) => void;
}

export const ImportTranslationTool = ({
  targetLocale,
  availableLocales,
  onImport,
}: ImportToolProps) => {
  const importableLocales = availableLocales.filter((l) => l !== targetLocale);

  if (!importableLocales.length) return null;

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <ImportTranslations
        onImport={onImport}
        availableLocales={availableLocales}
        targetLocale={targetLocale}
      />
    </div>
  );
};
