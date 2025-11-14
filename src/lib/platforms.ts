import React, { SVGProps } from "react";
import AndroidIcon from "@/components/custom/android-icon";
import IosIcon from "@/components/custom/ios-icon";

export type Platform = "android" | "ios";

export const ALL_PLATFORMS: {
  key: Platform;
  name: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
}[] = [
  { key: "android", name: "Android", Icon: AndroidIcon },
  { key: "ios", name: "iOS", Icon: IosIcon },
];
