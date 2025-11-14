import { useEffect, useRef, useState } from "react";
import { Locale } from "@/lib/languages";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { ImportTranslations } from "@/app/app/s/[slug]/translations/translations.import";

interface ImportTranslationsPopoverProps {
  targetLocale: Locale;
  availableLocales: Locale[];
  onImport: (sourceLocale: Locale) => void;
}

export const ImportTranslationsPopover = ({
  targetLocale,
  availableLocales,
  onImport,
}: ImportTranslationsPopoverProps) => {
  const importableLocales = availableLocales.filter((l) => l !== targetLocale);
  const hasImportableContent = importableLocales.length > 0;

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleImportClick = (sourceLocale: Locale) => {
    onImport(sourceLocale);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Import <Import />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" ref={popoverRef}>
        <div className="flex flex-col items-center rounded-lg border p-6 text-sm">
          <div className="w-full space-y-4 text-sm text-muted-foreground">
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
                  <p className="mb-4">
                    Import the keys and values from another language
                  </p>
                  <ImportTranslations
                    targetLocale={targetLocale}
                    availableLocales={availableLocales}
                    onImport={handleImportClick}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
