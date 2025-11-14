import { useTranslateKeys } from "@/domains/app/translation/translation.api";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Locale } from "@/lib/languages";
import ThunderIcon from "@/components/ui/thunder-icon";
import { cn } from "@/lib/utils";

interface Props {
  keyName: string;
  value: string;
  originalValue?: string;
  onChange: (val: string) => void;
  appSlug: string;
  targetLocale: Locale;
}

export const TranslationEntry = ({
  keyName,
  value,
  originalValue,
  onChange,
  appSlug,
  targetLocale,
}: Props) => {
  const [translatedOnce, setTranslatedOnce] = useState(false);
  const { translateKeys, isMutating } = useTranslateKeys();
  const [internalLoading, setInternalLoading] = useState(false);

  const isNew = originalValue === undefined;
  const isModified = !isNew && originalValue !== value;
  const isMissing = value.trim() === "";

  const handleTranslate = async () => {
    try {
      setInternalLoading(true);
      const result = await translateKeys({
        slug: appSlug,
        language: targetLocale,
        entries: { [keyName]: value || "" },
      });

      if (result?.translations?.[keyName]) {
        onChange(result.translations[keyName]);
      }
      setTranslatedOnce(true);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          {keyName}
          <div className="flex items-center gap-1">
            {isNew && (
              <TooltipWrapper content="New">
                <div className="size-3 rounded bg-green-500" />
              </TooltipWrapper>
            )}
            {isModified && (
              <TooltipWrapper content="Modified">
                <div className="size-3 rounded bg-orange-500" />
              </TooltipWrapper>
            )}
            {isMissing && (
              <TooltipWrapper content="Missing">
                <div className="size-3 rounded bg-red-500" />
              </TooltipWrapper>
            )}
          </div>
        </div>
      </div>
      <div className="flex">
        <Textarea
          value={value}
          className="rounded-r-none"
          onChange={(e) => onChange(e.target.value)}
        />
        <div>
          <TooltipWrapper content="Translate" asChild>
            <button
              className={cn(
                "flex h-full flex-col items-center group hover:text-primary text-muted-foreground justify-center gap-1 rounded-r-lg border border-l-0 px-4 py-2 transition-all",
                !value && "opacity-40",
                isNew || isModified ? "text-primary" : "text-muted-foreground",
              )}
              onClick={handleTranslate}
              disabled={isMutating || internalLoading || !value}
            >
              {isMutating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : translatedOnce ? (
                <CheckCircle className="size-4 text-green-500 transition-all group-hover:scale-125" />
              ) : (
                <ThunderIcon className="transition-all group-hover:scale-125" />
              )}
            </button>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  );
};
