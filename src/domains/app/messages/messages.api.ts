import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcherProtected } from "@/lib/fetcher";
import type {
  Message,
  MessageStatus,
  MessagesListResponse,
} from "@/api/schemas/message.schema";

// Re-export types for convenience
export type { Message, MessageStatus };
export type MessagesList = MessagesListResponse;

export const getMessagesListQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page?: number,
  status?: string,
) =>
  [
    "analytics",
    appSlug,
    "messages",
    "list",
    devModeEnabled,
    page,
    status,
  ] as const;

export const useMessagesList = (
  appSlug?: string,
  devModeEnabled?: boolean,
  page: number = 1,
  status: string = "",
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const {
    data,
    isPending: isLoading,
    refetch,
  } = useQuery({
    queryKey: getMessagesListQueryKey(appSlug, devModeEnabled, page, status),
    queryFn: async () => {
      if (!appSlug) return undefined;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      if (status) {
        params.append("status", status);
      }

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.messages.list.get({
          query: Object.fromEntries(params),
        });

      if (error) {
        throw error;
      }

      return data as MessagesList;
    },
    enabled,
  });

  return {
    messagesList: data,
    isLoading,
    refetch,
  };
};

export const getMessageByIdQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
  messageId?: string | null,
) =>
  ["analytics", appSlug, "messages", "one", devModeEnabled, messageId] as const;

export const useMessageById = (
  appSlug?: string,
  devModeEnabled?: boolean,
  messageId?: string | null,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined && !!messageId;

  const {
    data,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: getMessageByIdQueryKey(appSlug, devModeEnabled, messageId),
    queryFn: async () => {
      if (!appSlug || !messageId) return undefined;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.messages({ messageId })
        .get();

      if (error) {
        throw error;
      }

      return data.message as Message;
    },
    enabled,
  });

  return {
    message: data,
    isLoading,
    error,
  };
};

export const getNewMessagesCountQueryKey = (
  appSlug?: string,
  devModeEnabled?: boolean,
) =>
  ["analytics", appSlug, "messages", "count", "new", devModeEnabled] as const;

export const useNewMessagesCount = (
  appSlug?: string,
  devModeEnabled?: boolean,
) => {
  const enabled = !!appSlug && devModeEnabled !== undefined;

  const { data, isPending: isLoading } = useQuery({
    queryKey: getNewMessagesCountQueryKey(appSlug, devModeEnabled),
    queryFn: async () => {
      if (!appSlug) return 0;

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.messages.list.get({
          query: { page: "1", limit: "1", status: "new" },
        });

      if (error) {
        throw error;
      }

      return (data as MessagesList)?.pagination?.total ?? 0;
    },
    enabled,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    count: data ?? 0,
    isLoading,
  };
};

export const useUpdateMessage = (
  appSlug?: string,
  _devModeEnabled?: boolean,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      status,
      notes,
    }: {
      messageId: string;
      status?: MessageStatus;
      notes?: string | null;
    }) => {
      if (!appSlug) throw new Error("App slug required");

      const { data, error } = await fetcherProtected
        .app({ slug: appSlug })
        .analytics.messages({ messageId })
        .put({
          status,
          notes,
        });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate messages list queries to refetch
      void queryClient.invalidateQueries({
        queryKey: ["analytics", appSlug, "messages"],
      });
    },
  });
};
