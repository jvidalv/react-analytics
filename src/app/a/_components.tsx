"use client";

import { AppsHeader } from "@/components/apps/header";
import { ReactNode, Suspense, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PublicFooter } from "@/components/public/footer";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { logout } from "@/app/actions";
import { queryClient } from "@/lib/query-client";
import { useAppSlugFromLocalStorage } from "@/domains/app/app.utils";
import { useIsDocs } from "@/hooks/use-is-docs";
import { useAnalyticsApiKeys } from "@/domains/app/users/users.api";
import { useUserApps } from "@/domains/app/app.api";

export function AppLayoutClient({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AppsLayoutContent>{children}</AppsLayoutContent>
      </QueryClientProvider>
    </Suspense>
  );
}

function AppsLayoutContent({ children }: { children: ReactNode }) {
  const params = useParams();
  const hasSelectedApp = !!params.slug;

  useAnalyticsApiKeys();
  useUserApps();

  const { setAppSlug } = useAppSlugFromLocalStorage();
  const isDocs = useIsDocs();

  useEffect(() => {
    if (typeof params.slug === "string") {
      setAppSlug(params.slug);
    }
  }, [setAppSlug, params.slug]);

  return (
    <>
      <AppsHeader onLogout={logout} />
      <main
        className={cn(
          "min-h-screen pt-24 pb-24 px-8",
          hasSelectedApp && "pt-36",
          isDocs && "px-0 pb-0 pt-[var(--app-header-default-height)]",
        )}
      >
        {children}
      </main>
      <PublicFooter />
      <Toaster />
    </>
  );
}
