"use server";

import { signIn } from "@/auth";

export async function handleSignIn(formData: FormData) {
  const redirectTo = formData.get("redirectTo") as string;
  const provider = formData.get("provider") as string;

  await signIn(provider, { redirectTo });
}
