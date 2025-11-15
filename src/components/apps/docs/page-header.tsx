"use client";

import { useTitle } from "@/hooks/use-title";
import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  useTitle(title);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1">
        <span className="sm:hidden">
          <SidebarTrigger />
        </span>
        <Link
          className="text-sm text-muted-foreground no-underline hover:text-foreground"
          href="/a/docs"
        >
          Docs
        </Link>
        <span>
          <ChevronRight className="size-4" />
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <h1 className="m-0 mb-1 text-3xl font-bold">{title}</h1>
      <p className="m-0 text-muted-foreground">{description}</p>
    </div>
  );
};
