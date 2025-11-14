import { useToast } from "@/hooks/use-toast";
import { useTranslateKeys } from "@/domains/app/translation/translation.api";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { CheckCircle, Loader2 } from "lucide-react";
import ThunderIcon from "@/components/custom/thunder-icon";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  appSlug: string;
  locale: Locale;
  translations: Record<string, string>;
  original?: Record<string, string>;
  onUpdate: (newTranslations: Record<string, string>) => void;
}

export const TranslateAllButton = ({
  appSlug,
  locale,
  translations,
  original,
  onUpdate,
}: Props) => {
  const [translatedOnce, setTranslatedOnce] = useState(false);
  const { translateKeys, isMutating } = useTranslateKeys();
  const { toast } = useToast();
  const language = ALL_LANGUAGES.find((lang) => lang.locale === locale);

  const entriesToTranslate = Object.fromEntries(
    Object.entries(translations).filter(
      ([key, value]) => original?.[key] === undefined && value.trim() !== "",
    ),
  );

  const entriesLength = Object.keys(entriesToTranslate).length;

  if (!entriesLength) return null;

  const handleTranslateAll = async () => {
    try {
      const result = await translateKeys({
        slug: appSlug,
        language: locale,
        entries: entriesToTranslate,
      });

      onUpdate(result.translations);

      setTranslatedOnce(true);
      setTimeout(() => setTranslatedOnce(false), 2000);

      toast({
        title: "Success",
        description: `All new keys translated to ${language?.emoji}  ${language?.name}.`,
      });
    } catch {
      toast({
        title: "Failed to translate",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6 flex items-center gap-2 rounded-lg border border-primary bg-primary/10 p-4">
      {isMutating ? (
        <Loader2 className="size-4 animate-spin" />
      ) : translatedOnce ? (
        <CheckCircle className="size-4 text-green-500" />
      ) : (
        <ThunderIcon className="size-4 text-primary" />
      )}
      <button
        className="flex flex-1 justify-between gap-2 text-sm"
        onClick={handleTranslateAll}
        disabled={isMutating}
      >
        <span className="flex items-center justify-between">
          {isMutating
            ? "It may take up to a minute, hold on..."
            : "You have added new keys."}
        </span>
        <span
          className={cn(
            "transition-all font-medium hover:underline",
            isMutating && "opacity-50 hover:no-underline",
          )}
        >
          {isMutating ? "..." : "Translate all new keys"}
        </span>
      </button>
    </div>
  );
};
