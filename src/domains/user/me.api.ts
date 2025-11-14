import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

export type UserPlans = "straw" | "wood" | "metal";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  image?: string;
  plan: UserPlans;
  aiModel: string;
  createdAt: string;
  updatedAt: string;
};

export const useMe = () => {
  const { data, mutate, isLoading } = useSWR<User>("/api/user/me");

  return {
    me: data,
    isLoading,
    refetch: mutate,
  };
};

const updateUserFetcher = async (
  url: string,
  { arg }: { arg: Partial<User> },
) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  const updatedUser = await response.json();
  await mutate("/api/user/me"); // Refetch user data after update
  return updatedUser;
};

export const useUpdateUser = () => {
  const { trigger, isMutating } = useSWRMutation(
    "/api/user/me",
    updateUserFetcher,
  );

  return { updateUser: trigger, isUpdating: isMutating };
};
