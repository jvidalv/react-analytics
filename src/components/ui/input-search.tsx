import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type SearchFilterInputProps = React.ComponentProps<typeof Input>;

export function SearchFilterInput({
  wrapperClassName,
  ...props
}: SearchFilterInputProps & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <Search
          className={cn(
            "size-4 text-muted-foreground transition-all",
            !!(props?.defaultValue || props?.value) && "text-primary",
          )}
        />
      </div>
      <Input {...props} className={cn("pl-9", props.className)} />
    </div>
  );
}
