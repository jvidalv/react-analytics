/**
 * Analytics schemas - Single source of truth for all analytics API types
 *
 * This module exports Zod schemas and their inferred TypeScript types for:
 * - Query parameters validation
 * - Request body validation
 * - Response type checking
 * - Shared types between frontend and backend
 *
 * Usage:
 * ```typescript
 * import { GetUsersQuerySchema, type UsersResponse } from '@/schemas/analytics';
 * ```
 */

// Re-export all common schemas and types
export * from "./common";

// Re-export event schemas and types
export * from "./events";

// Re-export API keys schemas and types
export * from "./api-keys";

// Re-export push endpoint schemas and types
export * from "./push";
