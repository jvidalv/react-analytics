import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppLayoutClient } from "./_components";

export default async function AppsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/join?redirect_to=/app/dashboard");
  }

  return <AppLayoutClient>{children}</AppLayoutClient>;
}
