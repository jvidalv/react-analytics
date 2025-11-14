import { useEffect } from "react";

export const useTitle = (title?: string) => {
  useEffect(() => {
    if (title) {
      const previousTitle = document.title;
      document.title = `${title.replaceAll(" — Expofast", "")} — Expofast`;

      return () => {
        document.title = previousTitle;
      };
    }
  }, [title]);
};
