export type Language = {
  emoji: string;
  name: string;
  locale: Locale;
};

export type Locale =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "ru"
  | "ja"
  | "zh"
  | "ko"
  | "tr"
  | "ar"
  | "hi"
  | "pl"
  | "sv"
  | "da"
  | "no"
  | "fi"
  | "hu"
  | "el"
  | "cs"
  | "th"
  | "vi"
  | "id"
  | "ms"
  | "he"
  | "ro"
  | "uk"
  | "ca";

export const ALL_LANGUAGES: Language[] = [
  { emoji: "🇺🇸", name: "English", locale: "en" },
  { emoji: "🇪🇸", name: "Spanish", locale: "es" },
  { emoji: "🇫🇷", name: "French", locale: "fr" },
  { emoji: "🇩🇪", name: "German", locale: "de" },
  { emoji: "🇮🇹", name: "Italian", locale: "it" },
  { emoji: "🇵🇹", name: "Portuguese", locale: "pt" },
  { emoji: "🇳🇱", name: "Dutch", locale: "nl" },
  { emoji: "🇷🇺", name: "Russian", locale: "ru" },
  { emoji: "🇯🇵", name: "Japanese", locale: "ja" },
  { emoji: "🇨🇳", name: "Chinese", locale: "zh" },
  { emoji: "🇰🇷", name: "Korean", locale: "ko" },
  { emoji: "🇹🇷", name: "Turkish", locale: "tr" },
  { emoji: "🇸🇦", name: "Arabic", locale: "ar" },
  { emoji: "🇮🇳", name: "Hindi", locale: "hi" },
  { emoji: "🇵🇱", name: "Polish", locale: "pl" },
  { emoji: "🇸🇪", name: "Swedish", locale: "sv" },
  { emoji: "🇩🇰", name: "Danish", locale: "da" },
  { emoji: "🇳🇴", name: "Norwegian", locale: "no" },
  { emoji: "🇫🇮", name: "Finnish", locale: "fi" },
  { emoji: "🇭🇺", name: "Hungarian", locale: "hu" },
  { emoji: "🇬🇷", name: "Greek", locale: "el" },
  { emoji: "🇨🇿", name: "Czech", locale: "cs" },
  { emoji: "🇹🇭", name: "Thai", locale: "th" },
  { emoji: "🇻🇳", name: "Vietnamese", locale: "vi" },
  { emoji: "🇮🇩", name: "Indonesian", locale: "id" },
  { emoji: "🇲🇾", name: "Malay", locale: "ms" },
  { emoji: "🇮🇱", name: "Hebrew", locale: "he" },
  { emoji: "🇷🇴", name: "Romanian", locale: "ro" },
  { emoji: "🇺🇦", name: "Ukrainian", locale: "uk" },
  { emoji: "🇦🇩", name: "Catalan", locale: "ca" },
];
