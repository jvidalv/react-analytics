"use client";

import { Button } from "@/components/ui/button";
import { ClipboardCopy } from "lucide-react";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { unflattenJson } from "@/lib/json";
import { useToast } from "@/hooks/use-toast";

interface ExportTranslationsButtonProps {
  locale: Locale;
  translations: Record<string, string>;
  hasDiff: boolean;
  onSave?: () => Promise<void>;
}

export const ExportTranslationsButton = ({
  locale,
  translations,
  hasDiff,
  onSave,
}: ExportTranslationsButtonProps) => {
  const { toast } = useToast();
  const language = ALL_LANGUAGES.find((lang) => lang.locale === locale);

  const handleExport = async () => {
    try {
      if (hasDiff && onSave) {
        await onSave();
      }

      const unflattened = unflattenJson(translations);
      const json = JSON.stringify(unflattened, null, 2);
      await navigator.clipboard.writeText(json);

      toast({
        title: `Copied to clipboard  ${language?.emoji}`,
        description: `Paste them on your "${language?.locale}.json" file.`,
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Could not copy translations to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant={hasDiff ? "default" : "outline"} onClick={handleExport}>
      {hasDiff ? "Save & export" : "Export"}
      <ClipboardCopy />
    </Button>
  );
};
