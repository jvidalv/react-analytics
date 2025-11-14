"use client";

import * as React from "react";
import { useState, FormEvent, useEffect } from "react";
import { useGetAppFromSlug } from "@/domains/app/app.utils";
import { App, useUpdateApp } from "@/domains/app/app.api";
import { APP_FEATURES, FeatureKey } from "@/lib/features";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputColor } from "@/components/custom/input-color";
import { MultiSelect } from "@/components/custom/multi-select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUploadImage } from "@/domains/image/image.api";
import { useFilePicker } from "@/hooks/use-file-picker";
import { Camera, Loader2, Save } from "lucide-react";
import { getColor, getContrastTextColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { mutate } from "swr";

export default function SettingsPage() {
  const { app } = useGetAppFromSlug();

  if (!app)
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
          <BasicInfoForm app={app} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Enabling or disabling features will modify the tailored experience
            within the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeaturesForm app={app} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Languages</CardTitle>
          <CardDescription>
            Select the supported languages of your app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguagesForm app={app} />
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
          <PersonalizationForm app={app} />
        </CardContent>
      </Card>
    </div>
  );
}

function BasicInfoForm({ app }: { app: App }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp();
  const { uploadedUrl, isUploading, uploadImage } = useUploadImage();
  const { triggerFilePicker } = useFilePicker({
    accept: "image/*",
    onSelect: (files) => {
      if (files?.length) void uploadImage({ file: files[0], type: "avatar" });
    },
  });

  const [name, setName] = useState(app.name);
  const [description, setDescription] = useState(app.description);
  const [email, setEmail] = useState(app.email);
  const [websiteUrl, setWebsiteUrl] = useState(app.websiteUrl);
  const [logoUrl, setLogoUrl] = useState(app.logoUrl);

  useEffect(() => {
    if (uploadedUrl) setLogoUrl(uploadedUrl);
  }, [uploadedUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({
      ...app,
      name,
      description,
      email,
      websiteUrl,
      logoUrl: uploadedUrl || app.logoUrl,
    });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Basic information updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Logo</Label>
        <button
          type="button"
          onClick={triggerFilePicker}
          disabled={isUploading}
          className={cn(
            "flex size-16 min-w-16 items-center justify-center transition-all rounded-lg cursor-pointer",
            getColor(app.id),
          )}
          style={{
            background: app.primaryColor || undefined,
            color: app.primaryColor
              ? getContrastTextColor(app.primaryColor)
              : undefined,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              className="rounded-lg transition-all"
            />
          ) : isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Camera />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Slug</Label>
        <Input disabled defaultValue={app.slug} placeholder="app-slug" />
      </div>
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
          defaultValue={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="App description"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input
          defaultValue={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Website</Label>
        <Input
          defaultValue={websiteUrl}
          type="url"
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourapp.com"
        />
      </div>
      <Button
        isLoading={isUpdating || isUploading}
        type="submit"
        className="mt-4 w-fit"
      >
        Save <Save />
      </Button>
    </form>
  );
}

function FeaturesForm({ app }: { app: App }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp();
  const [features, setFeatures] = useState<FeatureKey[]>(app.features || []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({ ...app, features });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Features updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <ToggleGroup
        type="multiple"
        value={features}
        onValueChange={(features: FeatureKey[]) => setFeatures(features)}
        className="flex-wrap items-start justify-start"
      >
        {APP_FEATURES.map((feat) => (
          <ToggleGroupItem
            key={feat.key}
            value={feat.key}
            aria-label={`Toggle ${feat.name}`}
          >
            <feat.Icon />
            {feat.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button isLoading={isUpdating} type="submit" className="mt-4 w-fit">
        Save <Save />
      </Button>
    </form>
  );
}

function LanguagesForm({ app }: { app: App }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp();
  const [languages, setLanguages] = useState<Locale[]>(app.languages || []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({ ...app, languages });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Languages updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <MultiSelect
        options={ALL_LANGUAGES.map((l) => ({
          label: `${l.emoji} ${l.name}`,
          value: l.locale,
        }))}
        onValueChange={(val) => setLanguages(val as Locale[])}
        defaultValue={languages}
        placeholder="Select languages"
        animation={2}
        maxCount={5}
      />
      <Button isLoading={isUpdating} type="submit" className="mt-4 w-fit">
        Save <Save />
      </Button>
    </form>
  );
}

function PersonalizationForm({ app }: { app: App }) {
  const { toast } = useToast();
  const { updateApp, isUpdating } = useUpdateApp();
  const [color, setColor] = useState(app.primaryColor);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateApp({ ...app, primaryColor: color });
    void mutate("/api/app/all");
    toast({ title: "App updated", description: "Primary color updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col items-start gap-1.5">
        <Label>Primary Color</Label>
        <InputColor defaultValue={color} onChangeText={setColor} />
      </div>
      <Button isLoading={isUpdating} type="submit" className="mt-4 w-fit">
        Save <Save />
      </Button>
    </form>
  );
}
