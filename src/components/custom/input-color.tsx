import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { getContrastTextColor } from "@/lib/colors";

type InputColorProps = React.ComponentProps<"input"> & {
  onChangeText?: (value: string) => void;
};

const InputColor = React.forwardRef<HTMLInputElement, InputColorProps>(
  ({ className, onChange, onChangeText, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string>(
      (props.defaultValue as string) || (props.value as string),
    );
    const [isFocused, setIsFocused] = React.useState(false);
    const internalRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
      internalRef.current?.click();
    };

    return (
      <div
        className={cn(
          "relative flex items-center rounded-md h-9 border border-input transition-colors",
          isFocused && "ring-1 ring-ring",
          className,
        )}
      >
        <Input
          type="color"
          className="absolute size-10 appearance-none border-none p-0 opacity-0"
          ref={(node) => {
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            internalRef.current = node;
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onChange?.(e);
            onChangeText?.(e.target.value);
          }}
          {...props}
        />
        <div
          className="z-10 flex h-8 w-full min-w-8 cursor-pointer items-center justify-center rounded-md"
          onClick={handleClick}
          style={{ background: internalValue }}
        >
          <Palette
            className={cn("size-5 transition-all duration-500")}
            style={{
              color: internalValue && getContrastTextColor(internalValue),
            }}
          />
        </div>
      </div>
    );
  },
);

InputColor.displayName = "InputColor";

export { InputColor };
