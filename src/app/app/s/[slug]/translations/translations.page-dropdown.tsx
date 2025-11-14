import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Trash } from "lucide-react";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";

export function TranslationsPageDropdown({
  locale,
  onDelete,
}: {
  locale: Locale;
  onDelete: () => Promise<void>;
}) {
  const language = ALL_LANGUAGES.find((lang) => lang.locale === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onDelete}>
            <Trash className="mr-2 size-4" />
            Delete translations for{" "}
            <span className="ml-1">{language?.emoji}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
