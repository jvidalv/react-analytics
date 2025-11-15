"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Cog } from "lucide-react";
import * as React from "react";
import { useTitle } from "@/hooks/use-title";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  useTitle("Account");

  const pathname = usePathname();

  const links = [
    {
      name: "Information",
      icon: Cog,
      href: `/app/account`,
      get active() {
        return this.href === pathname;
      },
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <div></div>
      </div>
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-2 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 text-muted-foreground font-medium py-2  hover:bg-border/80 transition-all",
                link.active && "bg-border/80 text-foreground",
              )}
            >
              <link.icon className="size-4" />
              {link.name}
            </Link>
          ))}
        </div>
        <div className="col-span-6 flex flex-col gap-8">{children}</div>
      </div>
    </div>
  );
}
