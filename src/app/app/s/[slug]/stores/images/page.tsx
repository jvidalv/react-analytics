"use client";

import * as React from "react";
import { RefAttributes, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toJpeg } from "html-to-image";
import { useGetAppFromSlug } from "@/domains/app/app.utils";
import { ALL_LANGUAGES, Locale } from "@/lib/languages";
import { useRouter, useSearchParams } from "next/navigation";
import { Platform } from "@/lib/platforms";
import {
  AppStoreData,
  AppStoreImage,
  useAppStore,
  useCreateOrUpdateAppStore,
} from "@/domains/app/store/store.api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignRight,
  AlignCenter,
  LucideProps,
  Download,
  Save,
  Loader2,
  Trash,
} from "lucide-react";
import { mutate } from "swr";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputColor } from "@/components/custom/input-color";
import { getContrastTextColor } from "@/lib/colors";
import { useUploadImage } from "@/domains/image/image.api";
import { uuidv7 } from "uuidv7";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REAL_HEIGHT = 2796;
const REAL_WIDTH = 1290;

type TextAlign = "left" | "right" | "center";

const TEXT_ALIGN: {
  name: TextAlign;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}[] = [
  {
    Icon: AlignLeft,
    name: "left",
  },
  {
    Icon: AlignCenter,
    name: "center",
  },
  {
    Icon: AlignRight,
    name: "right",
  },
];

const ImageColumn = ({
  index,
  language,
  image,
  onDelete,
  onSave,
  isSaving,
}: {
  index: number;
  language: Locale;
  image: AppStoreImage;
  onDelete: () => void;
  onSave: (image: Partial<AppStoreImage>) => void;
  isSaving: boolean;
}) => {
  const { app } = useGetAppFromSlug();
  const ref = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { uploadedUrl, isUploading, uploadImage } = useUploadImage();

  const handleDownloadImage = async () => {
    if (!ref.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await toJpeg(ref.current, {
        width: REAL_WIDTH,
        height: REAL_HEIGHT,
        pixelRatio: 1, // Prevents high-DPR scaling issues
      });

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${index + 1}-image-${language}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
      console.error("Failed to generate image:", error);
    }

    setIsGenerating(false);
  };

  const [color, setColor] = useState<string>(image.color);
  const [text, setText] = useState(image.text);
  const [textPadding, setTextPadding] = useState<number | undefined>(
    image.textPadding || 56,
  );
  const [borderWidth, setBorderWidth] = useState<number | undefined>(
    image.borderWidth || 16,
  );
  const [borderColor, setBorderColor] = useState(image.borderColor || "white");
  const [imageWidth, setImageWidth] = useState<number | undefined>(
    image.imageWidth || 85,
  );
  const [imageTop, setImageTop] = useState<number | undefined>(
    image.imageTop || 25,
  );
  const [borderRadius, setBorderRadius] = useState<number | undefined>(
    image.borderRadius || 100,
  );
  const [fontSize, setFontSize] = useState<number | undefined>(image.fontSize);
  const [textAlign, setTextAlign] = useState<TextAlign>(image.textAlign);
  const [backgroundGradientOne, setBackgroundGradientOne] = useState(
    image.gradientOne,
  );
  const [backgroundGradientTwo, setBackgroundGradientTwo] = useState(
    image.gradientTwo,
  );

  const isDiff =
    color !== image.color ||
    text !== image.text ||
    fontSize !== image.fontSize ||
    textAlign !== image.textAlign ||
    borderRadius !== image.borderRadius ||
    borderColor !== image.borderColor ||
    textPadding !== image.textPadding ||
    imageTop !== image.imageTop ||
    imageWidth !== image.imageWidth ||
    (uploadedUrl && uploadedUrl !== image.imageUrl);

  const handleSave = () => {
    onSave({
      ...image,
      color,
      text,
      fontSize,
      textAlign,
      textPadding,
      borderColor,
      borderRadius,
      imageTop,
      imageWidth,
      gradientOne: backgroundGradientOne,
      gradientTwo: backgroundGradientTwo,
      imageUrl: uploadedUrl || image.imageUrl,
    });
  };

  const isNumberSetNumber = (value: string) => {
    if (!value || Number.isNaN(value)) {
      return undefined;
    }

    return parseFloat(value);
  };

  return (
    <div className="grid grid-cols-2 px-6 pt-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between">
            <h4 className="text-xl font-black">Image {index + 1}</h4>
            <div className="flex items-center gap-2">
              {isUploading && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadImage}
                isLoading={isGenerating}
              >
                <Download />
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Text
            </h3>
            <div>
              <Label className="mb-2 block">Message</Label>
              <Input
                type="text"
                name="text"
                placeholder={`Explore ${app?.name} discover you a new world`}
                value={text}
                onChangeText={setText}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <Label className="mb-2 block">
                  Size <span className="text-muted-foreground">(px)</span>
                </Label>
                <Input
                  type="number"
                  name="size"
                  placeholder="..."
                  defaultValue={fontSize}
                  onChangeText={(value) =>
                    setFontSize(isNumberSetNumber(value))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Color</Label>
                <InputColor
                  value={color}
                  onChangeText={setColor}
                  className="min-w-16"
                />
              </div>
              <div>
                <Label className="mb-2 block">Alignment</Label>
                <div className="flex gap-2">
                  <ToggleGroup
                    type="single"
                    value={textAlign}
                    onValueChange={(value) => setTextAlign(value as TextAlign)}
                  >
                    {TEXT_ALIGN.map(({ name, Icon }) => (
                      <ToggleGroupItem
                        key={name}
                        value={name}
                        aria-label={`Align ${name}`}
                        className="border text-sm capitalize"
                      >
                        <Icon />
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">
                  Padding <span className="text-muted-foreground">(px)</span>
                </Label>
                <Input
                  type="number"
                  name="size"
                  placeholder="..."
                  defaultValue={textPadding}
                  onChangeText={(value) =>
                    setTextPadding(isNumberSetNumber(value))
                  }
                />
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Image
            </h3>
            <div>
              <Label className="mb-2 block">Screenshot</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const files = event.target.files;
                  if (files && files.length > 0) {
                    void uploadImage({
                      file: files[0],
                      type: "simulator-screenshot",
                    });
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-2 block">
                  Position <span className="text-muted-foreground">(%)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="..."
                  defaultValue={imageTop}
                  onChangeText={(value) =>
                    setImageTop(isNumberSetNumber(value))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">
                  Width <span className="text-muted-foreground">(%)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="..."
                  min={70}
                  max={100}
                  defaultValue={imageWidth}
                  onChangeText={(value) =>
                    setImageWidth(isNumberSetNumber(value))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="mb-2 block">
                  Border width{" "}
                  <span className="text-muted-foreground">(px)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="..."
                  defaultValue={borderWidth}
                  onChangeText={(value) =>
                    setBorderWidth(isNumberSetNumber(value))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">
                  Radius <span className="text-muted-foreground">(px)</span>
                </Label>
                <Input
                  type="number"
                  name="border-radius"
                  placeholder="Border radius"
                  defaultValue={borderRadius}
                  onChangeText={(value) =>
                    setBorderRadius(isNumberSetNumber(value))
                  }
                />
              </div>
              <div>
                <Label className="mb-2 block">Color</Label>
                <InputColor
                  value={borderColor}
                  className="w-full"
                  onChangeText={setBorderColor}
                />
              </div>
            </div>
            <div className="mb-4">
              <Label className="mb-2 block">Background gradient</Label>
              <div className="flex gap-2">
                <InputColor
                  value={backgroundGradientOne}
                  className="w-full"
                  onChangeText={setBackgroundGradientOne}
                />
                <InputColor
                  value={backgroundGradientTwo}
                  className="w-full"
                  onChangeText={setBackgroundGradientTwo}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!isDiff}
            >
              <Save /> Save
            </Button>
            <Button
              onClick={handleDownloadImage}
              isLoading={isGenerating}
              variant="outline"
            >
              <Download /> Download
            </Button>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none relative flex size-full items-end justify-center overflow-hidden"
        style={{
          height: REAL_HEIGHT * 0.26,
        }}
      >
        <div
          className="absolute flex items-center justify-center overflow-hidden border-8"
          style={{
            transform: "scale(0.25)",
            left: `-${REAL_WIDTH * 0.31}px`,
            top: `-${REAL_HEIGHT * 0.375}px`,
          }}
        >
          {/* HTML Container to Capture */}
          <div
            ref={ref}
            className="relative flex flex-col items-center justify-end transition-all"
            style={{
              width: REAL_WIDTH,
              height: REAL_HEIGHT,
              background: `linear-gradient(180deg, ${backgroundGradientOne}, ${backgroundGradientTwo})`,
            }}
          >
            <div className="w-full">
              <h1
                className="absolute top-0 text-ellipsis font-bold transition-all"
                style={{
                  fontSize: Number.isNaN(fontSize) ? 0 : fontSize,
                  color,
                  textAlign,
                  lineHeight: 1,
                  padding: textPadding,
                }}
              >
                {text}
              </h1>
            </div>
            <img
              src={
                uploadedUrl || image.imageUrl || "/assets/images/simulator.png"
              }
              crossOrigin="anonymous"
              alt="App Screenshot"
              className="absolute object-cover shadow-2xl transition-all"
              style={{
                width: `${imageWidth}%`,
                top: `${imageTop}%`,
                borderRadius: borderRadius,
                border: !!borderWidth
                  ? `${borderWidth}px solid ${borderColor}`
                  : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Images = ({
  language,
  storeData,
  platform,
  appSlug,
}: {
  appSlug?: string;
  language: Locale;
  platform: Platform;
  storeData: AppStoreData;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { createOrUpdateAppStore, isMutating } = useCreateOrUpdateAppStore();

  const { app } = useGetAppFromSlug();

  const images = useMemo(
    () => getImagesData(storeData, language, platform),
    [storeData, language, platform],
  );
  const primaryColour = app?.primaryColor || "#000000";

  const onUpdateOrCreateImage = async (image: Partial<AppStoreImage>) => {
    if (!appSlug) return;

    try {
      setIsSaving(true);
      await createOrUpdateAppStore({
        slug: appSlug,
        storeData: {
          ...storeData,
          [language]: {
            ...storeData[language],
            [platform]: {
              ...storeData?.[language]?.[platform],
              images: images?.find((i) => i.id === image.id)
                ? images?.map((i) =>
                    i.id === image.id ? { ...i, ...image } : i,
                  )
                : [...images, image],
            },
          },
        },
      });
      void mutate(`/api/app/stores?slug=${appSlug}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onAddImage = () => {
    void onUpdateOrCreateImage({
      text: "Number 1 app available now!",
      fontSize: 150,
      textAlign: "left",
      color: getContrastTextColor(primaryColour),
      gradientOne: primaryColour,
      gradientTwo: "#000000",
      borderRadius: 100,
      borderWidth: 16,
      borderColor: primaryColour,
      imageWidth: 85,
      imageTop: 25,
      textPadding: 60,
      ...(images?.length ? images[images.length - 1] : {}),
      id: uuidv7(),
    });
  };

  const handleDelete = async (id: string) => {
    if (!appSlug) return;

    await createOrUpdateAppStore({
      slug: appSlug,
      storeData: {
        ...storeData,
        [language]: {
          ...storeData[language],
          [platform]: {
            ...storeData?.[language]?.[platform],
            images: images?.filter((i) => i.id !== id),
          },
        },
      },
    });

    void mutate(`/api/app/stores?slug=${appSlug}`);
  };

  return (
    <div className="divide-y">
      {images.map((image, index) => {
        return (
          <ImageColumn
            key={image.id + language}
            index={index}
            image={image}
            language={language}
            onDelete={() => handleDelete(image.id)}
            onSave={onUpdateOrCreateImage}
            isSaving={isSaving}
          />
        );
      })}
      <button
        onClick={onAddImage}
        disabled={isMutating}
        className="mt-8 flex size-full h-[750px] items-center justify-center text-muted-foreground transition-all hover:text-foreground disabled:opacity-10"
      >
        <span>+ Add image</span>
      </button>
    </div>
  );
};

const getImagesData = (
  data: AppStoreData,
  language: Locale,
  platform: Platform,
) => {
  const foundData = data?.[language]?.[platform]?.images;
  if (foundData) return foundData;

  const objectKeys = Object.keys(data) as Locale[];
  const fallbackKey = objectKeys[0];
  if (fallbackKey && data[fallbackKey]?.[platform]?.images) {
    return data[fallbackKey][platform].images;
  }

  return [];
};

export default function StoresImagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const languageFromUrl = searchParams.get("language") as Locale | null;
  const platformFromUrl = searchParams.get("platform") as Platform | null;
  const { appSlug, app } = useGetAppFromSlug();
  const { appStoreData } = useAppStore(appSlug);
  const selectedLanguage: Locale =
    languageFromUrl || app?.languages?.[0] || "en";
  const selectedPlatform: Platform = platformFromUrl || "ios";

  const handleUrlChange = (
    type: "language" | "platform" | "tone",
    value: string,
  ) => {
    if (!value) return;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(type, value);
    router.push(newUrl.toString(), { scroll: false });
  };

  return (
    <div>
      <div className="mb-4">
        {!app ? (
          <Skeleton className="h-[36px] w-[130px]" />
        ) : (
          <Select
            defaultValue={selectedLanguage}
            onValueChange={(value) => handleUrlChange("language", value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(app?.languages?.length ? app.languages : ["en"]).map(
                  (language) => {
                    const foundLanguage = ALL_LANGUAGES.find(
                      (lang) => lang.locale === language,
                    )!;

                    return (
                      <SelectItem
                        key={language}
                        value={language}
                        aria-label={`Select ${foundLanguage.name}`}
                      >
                        <span className="mr-1.5">{foundLanguage.emoji}</span>{" "}
                        {foundLanguage.name}
                      </SelectItem>
                    );
                  },
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      <div
        className="rounded-lg border"
        style={{ minHeight: REAL_HEIGHT * 0.3 }}
      >
        {!app ? (
          <Skeleton className="h-[750px] w-full rounded-lg" />
        ) : (
          <Images
            appSlug={appSlug}
            language={selectedLanguage}
            platform={selectedPlatform}
            storeData={appStoreData || {}}
          />
        )}
      </div>
    </div>
  );
}
