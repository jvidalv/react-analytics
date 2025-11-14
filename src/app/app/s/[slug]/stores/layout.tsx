"use client";

import { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Images, LetterText } from "lucide-react";
import * as React from "react";
import { useTitle } from "@/hooks/use-title";

export default function StoresLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  useTitle("Stores");

  const params = useParams();
  const pathname = usePathname();

  const links = [
    {
      name: "Texts",
      icon: LetterText,
      href: `/app/s/${params.slug}/stores`,
      get active() {
        return this.href === pathname;
      },
    },
    {
      name: "Images",
      icon: Images,
      href: `/app/s/${params.slug}/stores/images`,
      get active() {
        return this.href === pathname;
      },
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground">
            Generate the required texts and images with our AI
          </p>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-2 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 text-muted-foreground font-medium py-2 rounded-lg hover:bg-border/80 transition-all",
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
