/**
 * Utility functions for avatar generation and UUID handling
 */

/**
 * Generates a simple hash from a string using polynomial rolling hash
 * @param str - The string to hash
 * @returns A positive integer hash value
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Converts a UUID to a deterministic avatar number (1-31)
 * Always returns the same number for the same UUID
 * @param uuid - The UUID string (e.g., identifyId)
 * @returns Avatar number between 1 and 31
 */
export function getAvatarNumberFromUuid(uuid: string): number {
  const hash = simpleHash(uuid);
  return (hash % 31) + 1;
}

/**
 * Gets the avatar path for a given avatar number
 * @param avatarNumber - Number between 1 and 31
 * @returns Path to the avatar image
 */
export function getAvatarPath(avatarNumber: number): string {
  return `/assets/avatars/base-${avatarNumber}.png`;
}

/**
 * Gets a deterministic avatar path from a UUID
 * Convenience function that combines getAvatarNumberFromUuid and getAvatarPath
 * @param uuid - The UUID string (e.g., identifyId)
 * @returns Path to the avatar image
 */
export function getAvatarFromUuid(uuid: string): string {
  const avatarNumber = getAvatarNumberFromUuid(uuid);
  return getAvatarPath(avatarNumber);
}

/**
 * Gets the last N characters from a UUID for display
 * Useful for showing abbreviated UUIDs as user names
 * @param uuid - The UUID string
 * @param length - Number of characters to take from the end (default: 8)
 * @returns Last N characters of the UUID
 */
export function getUuidLastDigits(uuid: string, length: number = 8): string {
  return uuid.slice(-length);
}
