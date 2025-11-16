"use client";

import * as React from "react";
import { useState, FormEvent, useEffect } from "react";
import { App, useAppBySlug, useAppSlugFromParams, useUpdateApp } from "@/domains/app/app.api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputColor } from "@/components/custom/input-color";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { useSensitive } from "@/hooks/use-sensitive";

export default function SettingsPage() {
  const appSlug = useAppSlugFromParams();
  const { app, isLoading } = useAppBySlug(appSlug);

  if (isLoading || !app)
    return (
      <div className="space-y-6">
        <Skeleton className="h-[550px] w-full" />
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Modify the basic information about your app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInfoForm app={app} appSlug={appSlug} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalization</CardTitle>
          <CardDescription>
            Customize the primary color of your app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalizationForm app={app} appSlug={appSlug} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sensitive Mode</CardTitle>
          <CardDescription>
            Hide sensitive information like user emails and names in the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SensitiveModeToggle />
        </CardContent>
      </Card>
    </div>
  );
}

function BasicInfoForm({ app, appSlug }: { app: App; appSlug: string }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp(appSlug);

  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description ?? undefined);
  const [email, setEmail] = useState(app.email ?? undefined);
  const [websiteUrl, setWebsiteUrl] = useState(app.websiteUrl ?? undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({
      name,
      description,
      email,
      websiteUrl,
    });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Basic information updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Name</Label>
        <Input
          defaultValue={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="App name"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Description</Label>
        <Textarea
          defaultValue={description ?? undefined}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="App description"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input
          defaultValue={email ?? undefined}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Website</Label>
        <Input
          defaultValue={websiteUrl ?? undefined}
          type="url"
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourapp.com"
        />
      </div>
      <Button
        isLoading={isUpdating}
        type="submit"
        className="mt-4 w-fit"
      >
        Save <Save />
      </Button>
    </form>
  );
}

function PersonalizationForm({ app, appSlug }: { app: App; appSlug: string }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp(appSlug);
  const [color, setColor] = useState(app.primaryColor ?? undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({ primaryColor: color });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Primary color updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col items-start gap-1.5">
        <Label>Primary Color</Label>
        <InputColor defaultValue={color ?? undefined} onChangeText={setColor} />
      </div>
      <Button isLoading={isUpdating} type="submit" className="mt-4 w-fit">
        Save <Save />
      </Button>
    </form>
  );
}

function SensitiveModeToggle() {
  const { enabled, toggle } = useSensitive();

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="sensitive-mode" className="text-sm font-medium">
          Enable Sensitive Mode
        </Label>
        <p className="text-sm text-muted-foreground">
          When enabled, sensitive information will be hidden in the dashboard
        </p>
      </div>
      <Switch
        id="sensitive-mode"
        checked={enabled}
        onCheckedChange={toggle}
      />
    </div>
  );
}
