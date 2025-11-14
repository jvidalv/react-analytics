import { useState } from "react";

export function useClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (error) {
      console.error("Failed to copy: ", error);
      setCopied(false);
    }
  };

  return [copied, copyToClipboard];
}
