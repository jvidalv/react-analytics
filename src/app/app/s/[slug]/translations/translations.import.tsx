import { useEffect, useState } from "react";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Import } from "lucide-react";

interface ImportToolProps {
  targetLocale: Locale;
  availableLocales: Locale[];
  onImport: (sourceLocale: Locale) => void;
}

export const ImportTranslations = ({
  targetLocale,
  availableLocales,
  onImport,
}: ImportToolProps) => {
  const importableLocales = availableLocales.filter((l) => l !== targetLocale);

  const [selectedImportLocale, setSelectedImportLocale] =
    useState<Locale | null>(null);

  useEffect(() => {
    setSelectedImportLocale(null);
  }, [targetLocale]);

  useEffect(() => {
    if (!selectedImportLocale) {
      if (importableLocales.includes("en")) {
        setSelectedImportLocale("en");
      }
    }
  }, [importableLocales, selectedImportLocale]);

  const handleImport = () => {
    if (selectedImportLocale) onImport(selectedImportLocale);
  };

  if (!importableLocales.length) return null;

  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedImportLocale || ""}
        onValueChange={(v) => setSelectedImportLocale(v as Locale)}
      >
        <SelectTrigger className="w-full min-w-[170px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {importableLocales.map((locale) => {
            const lang = ALL_LANGUAGES.find((x) => x.locale === locale);
            return (
              <SelectItem key={locale} value={locale}>
                {lang?.emoji}{" "}
                <span className="ml-1 text-foreground">{lang?.name}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button onClick={handleImport} disabled={!selectedImportLocale}>
        Import
        <Import />
      </Button>
    </div>
  );
};
