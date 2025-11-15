import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validation utilities for API routes
 *
 * These helpers provide consistent error handling and type-safe validation
 * for API route query parameters and request bodies.
 */

/**
 * Validate URL search parameters against a Zod schema
 *
 * @param searchParams - URLSearchParams from request URL
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * ```typescript
 * const validation = validateQueryParams(searchParams, GetUsersQuerySchema);
 * if (!validation.success) {
 *   return validation.error;
 * }
 * const { apiKey, page, pageSize } = validation.data;
 * ```
 */
export function validateQueryParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T,
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse } {
  // Convert URLSearchParams to plain object
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Invalid query parameters",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate request body against a Zod schema
 *
 * @param body - Parsed request body (from req.json())
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * ```typescript
 * const body = await req.json();
 * const validation = validateBody(body, PushEventsBodySchema);
 * if (!validation.success) {
 *   return validation.error;
 * }
 * const { apiKey, events } = validation.data;
 * ```
 */
export function validateBody<T extends z.ZodType>(
  body: unknown,
  schema: T,
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse } {
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate response data before sending to client
 *
 * This is useful for ensuring backend responses match the expected schema.
 * In production, you might want to disable this for performance.
 *
 * @param data - Response data to validate
 * @param schema - Zod schema to validate against
 * @returns Validated data
 * @throws ZodError if validation fails
 *
 * @example
 * ```typescript
 * const response = validateResponse(
 *   { data: users, pagination: meta },
 *   UsersResponseSchema
 * );
 * return NextResponse.json(response);
 * ```
 */
export function validateResponse<T extends z.ZodType>(
  data: unknown,
  schema: T,
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validate response data (safe version that returns NextResponse on error)
 *
 * @param data - Response data to validate
 * @param schema - Zod schema to validate against
 * @returns Validated data or error response
 *
 * @example
 * ```typescript
 * const validation = validateResponseSafe(responseData, UsersResponseSchema);
 * if (!validation.success) {
 *   return validation.error;
 * }
 * return NextResponse.json(validation.data);
 * ```
 */
export function validateResponseSafe<T extends z.ZodType>(
  data: unknown,
  schema: T,
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("Response validation failed:", result.error);
    return {
      success: false,
      error: NextResponse.json(
        {
          error: "Internal server error",
          details:
            process.env.NODE_ENV === "development"
              ? result.error.flatten()
              : undefined,
        },
        { status: 500 },
      ),
    };
  }

  return { success: true, data: result.data };
}
