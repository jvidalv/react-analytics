"use client";

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getColor } from "@/lib/colors";
import * as React from "react";
import { getFeatureByKey } from "@/lib/features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAppFromSlug } from "@/domains/app/app.utils";

export default function AppsSlug() {
  const params = useParams();
  const { app } = useGetAppFromSlug();

  if (!app) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton>
            <h1 className="text-3xl font-bold opacity-0">{params.slug}</h1>
          </Skeleton>
          <div className="flex gap-2">
            <Link href={`/app/s/${params.slug}/settings`}>
              <Button variant="outline">
                <Cog className="text-muted-foreground" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-6 rounded-lg border p-6">
          <Skeleton className="size-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{app.name}</h1>
        <div className="flex gap-2">
          <Link href={`/app/s/${app.slug}/settings`}>
            <Button variant="outline">
              <Cog className="text-muted-foreground" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex gap-6 rounded-lg border p-6">
        <Avatar className="size-32 rounded">
          {!!app?.logoUrl && (
            <AvatarImage src={app.logoUrl} className="size-32" />
          )}
          <AvatarFallback
            className={cn(
              "size-32 rounded capitalize text-4xl",
              getColor(app.id),
            )}
            style={{ background: app?.primaryColor || undefined }}
          >
            {app.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Description</span>
            <p>{app?.description}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Features</span>
            <div className="flex gap-2">
              {app.features?.map((key) => {
                const feature = getFeatureByKey(key);
                return (
                  <Badge variant="outline" key={key}>
                    <feature.Icon className="mr-2 size-4 stroke-1" />
                    {feature.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
