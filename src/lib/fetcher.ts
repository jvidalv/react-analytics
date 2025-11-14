import { FetcherError } from "@/lib/errors";

export const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(async (res) => {
    if (res.ok) {
      return res.json();
    }

    throw new FetcherError(res.status, await res.json());
  });
