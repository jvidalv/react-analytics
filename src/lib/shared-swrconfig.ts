import { FetcherError } from "@/lib/errors";
import { fetcher } from "@/lib/fetcher";
import { logout } from "@/app/actions";
import { SWRConfiguration } from "swr";

export const swrConfig = {
  fetcher,
  onError: async (error) => {
    if (error instanceof FetcherError) {
      if (error.status === 401) {
        await logout();
      }
    }
  },
} satisfies SWRConfiguration;
