const COLORS_KEY = "expofast::colors";

const COLORS = ["bg-indigo-500", "bg-blue-500", "bg-violet-500"];

export const getColor = (id: string) => {
  if (typeof window === "undefined") {
    return "bg-neutral-500";
  }

  const colors = JSON.parse(localStorage?.getItem(COLORS_KEY) || "{}");

  if (colors[id]) {
    return colors[id];
  }

  const length = Object.keys(colors).length;
  const color = COLORS[length % COLORS.length];

  localStorage.setItem(COLORS_KEY, JSON.stringify({ ...colors, [id]: color }));

  return color;
};

export const generateRandomHexColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getContrastTextColor = (hex: string): "#000000" | "#ffffff" => {
  if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4))
    return "#000000";

  const fullHex =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;

  const r = parseInt(fullHex.substring(1, 3), 16);
  const g = parseInt(fullHex.substring(3, 5), 16);
  const b = parseInt(fullHex.substring(5, 7), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#ffffff";
};
