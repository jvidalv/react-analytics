"use client";

import { AppsHeader } from "@/components/apps/header";
import { ReactNode, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PublicFooter } from "@/components/public/footer";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { logout } from "@/app/actions";
import { queryClient } from "@/lib/query-client";
import { useUserApps } from "@/domains/app/app.api";
import { AnalyticsIdentify } from "@/components/providers/analytics-provider";

export function AppLayoutClient({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Suspense>
      <QueryClientProvider client={queryClient}>
        <AnalyticsIdentify />
        <AppsLayoutContent>{children}</AppsLayoutContent>
      </QueryClientProvider>
    </Suspense>
  );
}

function AppsLayoutContent({ children }: { children: ReactNode }) {
  const params = useParams();
  const hasSelectedApp = !!params.slug;

  useUserApps();

  return (
    <>
      <AppsHeader onLogout={logout} />
      <main
        className={cn(
          "min-h-screen pt-24 pb-24 px-8",
          hasSelectedApp && "pt-36",
        )}
      >
        {children}
      </main>
      <PublicFooter />
      <Toaster />
    </>
  );
}
