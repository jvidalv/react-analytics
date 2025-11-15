import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { publicRoutes } from "./public";
import { protectedRoutes } from "./protected";

export const app = new Elysia({ prefix: "/api" })
  // CORS removed from global level - managed per-route for flexibility
  // Analytics endpoints need permissive CORS (accept from any domain)
  // Protected routes can add their own restrictive CORS if needed
  .use(
    swagger({
      documentation: {
        info: {
          title: "React Analytics API",
          version: "1.0.0",
          description: "API documentation for React Analytics platform",
        },
        tags: [
          { name: "Health", description: "Health check endpoints" },
          { name: "Analytics", description: "Analytics endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
          { name: "User", description: "User management endpoints" },
          { name: "App", description: "App management endpoints" },
        ],
      },
      path: "/swagger",
    }),
  )
  .onError(({ code, error, set }) => {
    console.error(`[${code}]`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        error: "Validation error",
        details: error.message,
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        success: false,
        error: "Route not found",
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Internal server error",
    };
  })
  .use(publicRoutes)
  .use(protectedRoutes);

export type Api = typeof app;
