export type MaxCharacterLimits = {
  shortDescription: {
    ios: number;
    android: number;
  };
  description: {
    ios: number;
    android: number;
  };
};

export const MAX_CHARACTERS: MaxCharacterLimits = {
  shortDescription: {
    ios: 170,
    android: 80,
  },
  description: {
    ios: 4000,
    android: 4000,
  },
};

export type FieldName = "shortDescription" | "description";

export type ToneStyle = "serious" | "normal" | "playful";

export const TONE_STYLES: Record<ToneStyle, string> = {
  serious: "Formal and professional",
  normal: "Neutral and clear",
  playful: "Engaging and fun",
};

export const sanitizeAIResponse = (raw: string): string => {
  return raw
    .trim()
    .replace(/^```(json)?/, "")
    .replace(/```$/, "")
    .trim();
};
