import { TranslationEntry } from "./translations.entry";
import { Locale } from "@/lib/languages";

interface Props {
  entries: [string, string][];
  original: Record<string, string>;
  onChange: (key: string, val: string) => void;
  appSlug: string;
  targetLocale: Locale;
}

export const TranslationList = ({
  entries,
  original,
  onChange,
  appSlug,
  targetLocale,
}: Props) => {
  return (
    <div className="grid gap-4">
      {entries.map(([key, value]) => (
        <TranslationEntry
          key={key}
          keyName={key}
          value={value}
          originalValue={original?.[key]}
          onChange={(val) => onChange(key, val)}
          appSlug={appSlug}
          targetLocale={targetLocale}
        />
      ))}
    </div>
  );
};
