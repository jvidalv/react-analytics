import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sensitive-mode";

export function useSensitive() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    const html = document.documentElement;

    if (enabled) {
      html.classList.add("sensitive-on");
    } else {
      html.classList.remove("sensitive-on");
    }

    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      localStorage.setItem(STORAGE_KEY, `${!prev}`);
      return !prev;
    });
  }, []);

  return { enabled, toggle };
}
