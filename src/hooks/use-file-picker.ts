import { useRef } from "react";

type FilePickerOptions = {
  accept?: string; // Accepted file types (e.g., "image/*" or ".png,.jpg")
  multiple?: boolean;
  onSelect: (files: FileList | null) => void;
};

export const useFilePicker = ({
  accept,
  multiple,
  onSelect,
}: FilePickerOptions) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerFilePicker = () => {
    if (!inputRef.current) {
      inputRef.current = document.createElement("input");
      inputRef.current.type = "file";
      inputRef.current.style.display = "none";
      if (accept) inputRef.current.accept = accept;
      if (multiple) inputRef.current.multiple = multiple;

      inputRef.current.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        onSelect(target.files);
        target.value = ""; // Reset input to allow re-selection of the same file
      });

      document.body.appendChild(inputRef.current);
    }

    inputRef.current.click();
  };

  return { triggerFilePicker };
};
