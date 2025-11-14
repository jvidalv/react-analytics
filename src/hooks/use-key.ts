import { useEffect } from "react";

export const useKey = (
  key: string,
  callback: (event: KeyboardEvent) => void,
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [key, callback]);
};
