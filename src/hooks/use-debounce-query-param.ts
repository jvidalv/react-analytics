import { useCallback, useRef } from "react";

export const useDebouncedQueryParam = (delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (
      paramKey: string,
      value: string,
      searchParams: URLSearchParams,
      push: (url: string) => void,
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
        push(`?${params.toString()}`);
      }, delay);
    },
    [delay],
  );
};
