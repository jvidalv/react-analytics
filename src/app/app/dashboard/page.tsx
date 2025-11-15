"use client";

import { useCreateApp, useUserApps } from "@/domains/app/app.api";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getColor, getContrastTextColor } from "@/lib/colors";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BookText, Plus } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uuidv7 } from "uuidv7";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { wait } from "@/lib/wait";
import { useTitle } from "@/hooks/use-title";

const CreateAppForm = ({
  show,
  cancelCreate,
}: {
  show: boolean;
  cancelCreate: () => void;
}) => {
  const router = useRouter();
  const idRef = useRef(uuidv7());
  const { createApp, isCreating } = useCreateApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      return;
    }

    const app = await createApp({
      id: idRef.current,
      name,
      description,
    });

    router.push(`/app/s/${app.slug}`);

    await wait(200);
    void mutate("/api/app/all");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "absolute top-0 shadow-lg z-10 -mx-6 w-full transition-all  border backdrop-blur-lg p-6 border-muted-foreground/50",
        !show ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-16 min-w-16 items-center justify-center transition-all text-2xl font-semibold capitalize",
            show && getColor(idRef.current),
          )}
        >
          {name?.[0] || "?"}
        </div>
        <div className="flex w-full flex-1 flex-col items-start gap-4">
          <div className="flex w-full flex-col items-start gap-2">
            <Label>Name</Label>
            {show && (
              <Input
                autoFocus
                placeholder="..."
                onChangeText={setName}
                type="text"
                required
                min="2"
                max="100"
              />
            )}
          </div>
          <div className="flex w-full flex-col items-start gap-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              onChangeText={setDescription}
              placeholder="Typing a detailed description will enhace the quality of the AI generated texts later on."
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button isLoading={isCreating}>Create app</Button>
            <Button
              disabled={isCreating}
              onClick={cancelCreate}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default function DashboardPage() {
  useTitle("Dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const create = searchParams.get("create");

  const { apps, isLoading } = useUserApps();
  const [openCreate, setOpenCreate] = useState(false);
  const resources = [
    {
      href: "/docs",
      name: "Documentation",
      Icon: BookText,
    },
  ];

  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    if (create) {
      router.replace("/app/dashboard");
    }
  };

  useEffect(() => {
    setOpenCreate(!!create);
  }, [create]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Apps</h1>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-6">
        {isLoading && (
          <>
            <div className="flex gap-4  border p-6">
              <Skeleton className="size-16 " />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex gap-4  border p-6">
              <Skeleton className="size-16 " />
              <Skeleton className="h-6 w-32" />
            </div>
          </>
        )}
        {apps?.map((app) => (
          <Link
            href={`/app/s/${app.slug}`}
            key={app.id}
            className="flex gap-4  border p-6 transition-all hover:border-muted-foreground/50"
          >
            <div>
              <Avatar className="size-16 ">
                <AvatarFallback
                  className="capitalize text-2xl"
                  style={{ background: app?.primaryColor || undefined }}
                >
                  {app?.name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">{app.name}</h2>
            </div>
          </Link>
        ))}
        <div
          role="button"
          className={cn(
            "relative group flex items-center gap-4  border p-6 opacity-90 transition-all hover:opacity-100 hover:border-muted-foreground/50",
            isLoading && "opacity-0 hover:opacity-0",
            openCreate &&
              "opacity-100 border-transparent hover:border-transparent",
          )}
          onClick={openCreate ? undefined : handleOpenCreate}
        >
          {!isLoading && (
            <CreateAppForm show={openCreate} cancelCreate={handleCloseCreate} />
          )}
          <div className="flex size-16 items-center justify-center   bg-neutral-800 text-muted-foreground transition-all group-hover:rotate-90 group-hover:scale-105">
            <Plus className="size-8 stroke-1" />
          </div>
          {!openCreate && (
            <div className="text-left opacity-50 transition-all group-hover:opacity-100">
              <h2 className="text-lg font-semibold">Add your app</h2>
            </div>
          )}
        </div>
      </div>
      {!isLoading && (
        <>
          <h2 className="mb-4 text-xl font-semibold">Resources</h2>
          <ul>
            {resources.map(({ Icon, name, href }) => (
              <li key={name}>
                <Link
                  href={href}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
