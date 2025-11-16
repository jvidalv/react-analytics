/**
 * Converts an ISO 3166-1 alpha-2 country code to a flag emoji
 * @param countryCode - Two-letter country code (e.g., "US", "GB", "CA")
 * @returns Flag emoji (e.g., "🇺🇸", "🇬🇧", "🇨🇦") or empty string if invalid
 */
export function countryCodeToFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) {
    return "";
  }

  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

/**
 * Gets the display name for a country code
 * @param countryCode - Two-letter country code (e.g., "US", "GB", "CA")
 * @param locale - Locale for the country name (default: "en")
 * @returns Country name (e.g., "United States", "United Kingdom", "Canada")
 */
export function getCountryName(
  countryCode: string | null,
  locale: string = "en"
): string {
  if (!countryCode) {
    return "Unknown";
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) || countryCode;
  } catch (error) {
    return countryCode;
  }
}
