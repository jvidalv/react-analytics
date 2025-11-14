"use client";

import { useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";

export default function PageError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const isOauthOther = error === "OAuthAccountNotLinked";

  let errorMessage = "Unknown error";
  if (isOauthOther) {
    errorMessage = "Email already linked to a different provider";
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-500 p-3 text-sm text-red-500">
      <TriangleAlert />
      {errorMessage}
    </div>
  );
}
