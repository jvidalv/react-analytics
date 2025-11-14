"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { AppDocsSidebar } from "@/components/apps/docs/sidebar";

import "./../../mdx.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppDocsSidebar />
      <div className="flex-1 p-8">
        <div className="prose prose-invert max-w-3xl">{children}</div>
      </div>
    </SidebarProvider>
  );
}
