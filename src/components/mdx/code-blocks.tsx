"use client";
import { PropsWithChildren, useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";

export default function CodeBlock({ children }: PropsWithChildren) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="group relative">
      <button
        onClick={copyToClipboard}
        className="absolute right-4 top-5 z-10  text-xs text-muted-foreground transition group-hover:text-foreground"
      >
        {copied ? (
          <ClipboardCheck className="size-4 text-green-500" />
        ) : (
          <Clipboard className="size-4" />
        )}
      </button>
      <pre>{children}</pre>
    </div>
  );
}
