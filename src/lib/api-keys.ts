import { uuidv7 } from "uuidv7";

/**
 * Generates a custom-format API key with app slug prefix
 * Format: {mode}-{slug}-{uuid32}
 * Example: "prod-myapp-7c9e66797425440de944be07fc1f90ae7"
 */
export function generateApiKey(slug: string, isTest: boolean): string {
  // Generate UUID v7 and remove hyphens for compact format
  const uuid = uuidv7().replace(/-/g, "");

  // Determine mode prefix
  const mode = isTest ? "dev" : "prod";

  // Construct custom API key
  return `${mode}-${slug}-${uuid}`;
}

/**
 * Validates API key format - accepts BOTH old UUID format and new custom format
 * This ensures backwards compatibility during migration
 *
 * Accepted formats:
 * - Old UUID: "550e8400-e29b-41d4-a716-446655440000"
 * - New custom: "prod-myapp-7c9e66797425440de944be07fc1f90ae7"
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Old UUID format pattern (with hyphens)
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // New custom format pattern (mode-slug-uuid32)
  const customPattern = /^(prod|dev)-[a-z0-9-]+-[0-9a-f]{32}$/;

  // Accept either format
  return uuidPattern.test(apiKey) || customPattern.test(apiKey);
}

/**
 * Extracts the mode from a custom-format API key
 * Returns null for old UUID-format keys
 */
export function getApiKeyMode(
  apiKey: string,
): "prod" | "dev" | null {
  if (apiKey.startsWith("prod-")) return "prod";
  if (apiKey.startsWith("dev-")) return "dev";
  return null; // Old UUID format
}

/**
 * Extracts the app slug from a custom-format API key
 * Returns null for old UUID-format keys
 */
export function getApiKeySlug(apiKey: string): string | null {
  const customPattern = /^(prod|dev)-([a-z0-9-]+)-[0-9a-f]{32}$/;
  const match = apiKey.match(customPattern);
  return match ? match[2] : null;
}
