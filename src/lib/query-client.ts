import { QueryClient, QueryCache } from "@tanstack/react-query";
import { logout } from "@/app/actions";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1500,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: async (error: unknown) => {
      // Handle 401 errors globally
      if (error && typeof error === "object" && "status" in error) {
        if ((error as { status: number }).status === 401) {
          await logout();
        }
      }
    },
  }),
});
