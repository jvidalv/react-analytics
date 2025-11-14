"use client";

import { SVGProps, useState } from "react";
import { cn } from "@/lib/utils";
import {
  BellRing,
  ChevronsRight,
  CircleEllipsis,
  CreditCard,
  Database,
  Mail,
  Palette,
  UserCircle,
} from "lucide-react";

export default function HomeStarterFeatures() {
  const [selected, setSelected] = useState("api");

  const features = [
    {
      key: "api",
      title: "API",
      points: [
        "Backend API included, single repository app thanks to expo-router.",
        "Zero infrastructure hassle, deploy with one click.",
        "Fully typed end to end experience with elysia-js and eden.",
      ],
      poweredBy: (
        <p>
          Easily deploy on{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            className="underline underline-offset-4"
          >
            Vercel
          </a>{" "}
          or on{" "}
          <a
            href="https://expo.dev"
            target="_blank"
            className="underline underline-offset-4"
          >
            Expo
          </a>{" "}
          with one click.
        </p>
      ),
      note: "You can also self-host if that's what you prefer.",
      Icon: (props: SVGProps<SVGSVGElement>) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={800}
          height={800}
          viewBox="0 0 1024 1024"
          fill="currentColor"
          {...props}
        >
          <path d="m877.686 727.913-.585-.365a32.899 32.899 0 0 1-8.042-46.424 411.817 411.817 0 1 0-141.83 145.777c14.622-8.992 33.63-5.117 43.646 8.773l.146.073a30.413 30.413 0 0 1-7.969 43.207l-6.14 4.02a475.201 475.201 0 1 1 163.615-164.419 29.974 29.974 0 0 1-42.841 9.358zM340.343 329.33c7.164-7.091 24.71-9.65 33.264 0 10.6 11.186 7.164 29.462 0 37.139L262.995 473.936l107.907 102.205c7.164 7.092 8.115 27.343 0 35.384-9.797 9.724-29.828 8.188-36.481 1.536L208.31 487.388a18.423 18.423 0 0 1 0-25.953l132.033-132.033zm343.314 0L815.69 461.362a18.423 18.423 0 0 1 0 25.953L689.652 613.134c-6.653 6.58-25.588 10.747-36.554 0-10.308-10.235-7.091-31.29 0-38.382l108.346-100.67L649.59 365.445c-7.165-7.676-9.504-26.611 0-36.042 9.285-9.138 26.904-7.091 34.068 0zM548.115 303.01c3.583-9.504 21.348-15.499 32.68-11.258 10.82 4.02 17.18 19.008 14.256 28.512L475.154 649.98c-3.51 9.504-20.617 13.306-30.194 9.723-10.162-3.509-21.201-17.545-17.546-26.976L548.042 303.01z" />
        </svg>
      ),
    },
    {
      key: "database",
      title: "Database",
      points: [
        "PostgreSQL managed by drizzle-orm.",
        "Supabase integration.",
        "Fully typed experience and seamless migration flow with examples.",
      ],
      poweredBy: (
        <p>
          Leverages{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            className="underline underline-offset-4"
          >
            Supabase
          </a>
          .
        </p>
      ),
      Icon: Database,
      note: "You can switch to any other SQL database.",
    },
    {
      key: "payments",
      title: "Payments",
      points: [
        "Native Stripe implementation for an amazing user experience.",
        "Apple Pay and Google Pay implementation out of the box.",
        "Examples of webhooks to manage Stripe within the repository.",
      ],
      poweredBy: (
        <p>
          Uses{" "}
          <a
            href="https://stripe.com"
            target="_blank"
            className="underline underline-offset-4"
          >
            Stripe
          </a>
          .
        </p>
      ),
      Icon: CreditCard,
    },
    {
      key: "user",
      title: "Users",
      points: [
        "Sign in with Apple and Google.",
        "Magic links.",
        "Super simple session management, no convoluted auth libraries.",
        "Protected/public API routes examples.",
      ],
      Icon: UserCircle,
    },
    {
      key: "emails",
      title: "Emails",
      points: [
        "Transactional emails examples for sign-up and stripe purchases.",
        "Create emails using React.",
        "Setup guide to avoid spam folder.",
      ],
      poweredBy: (
        <p>
          Powered by{" "}
          <a
            href="https://resend.com"
            target="_blank"
            className="underline underline-offset-4"
          >
            Resend
          </a>{" "}
          and react-email.
        </p>
      ),
      Icon: Mail,
    },
    {
      key: "notifications",
      title: "Notifications",
      points: [
        "Push notifications setup for both Android and iOS.",
        "Detailed documentation for configuring it.",
      ],
      Icon: BellRing,
    },
    {
      key: "design",
      title: "Design",
      points: [
        "30+ components with animations to build the perfect UI.",
        "Easily adapt to your desired style thanks to nativewind defaults.",
        "Light/Dark mode out of the box.",
      ],
      poweredBy: (
        <p>
          Build with{" "}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            className="underline underline-offset-4"
          >
            Tailwind
          </a>{" "}
          and nativewind.
        </p>
      ),
      Icon: Palette,
    },
    {
      key: "more",
      title: "More",
      points: [
        "Easily convert it to a fully functional web thanks to react-native-web.",
        "Access our discord community to receive help and share progress.",
        "Documentation for x10 engineers, no noise, straight to the point.",
        "Access to a highly trained AI with all the ExpoFast content and and our production apps code.",
      ],
      Icon: CircleEllipsis,
    },
  ];

  const currentFeature = features.find((feature) => selected === feature.key);

  if (!currentFeature) {
    return null;
  }

  return (
    <div>
      <div className="mx-auto mb-6 grid max-w-6xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {features.map(({ key, title, Icon }, index) => (
          <button
            type="button"
            onClick={() => setSelected(key)}
            key={title}
            className={cn(
              "relative hover:scale-105 flex cursor-pointer items-center gap-2 sm:gap-3 rounded-lg bg-background border-4 border-transparent transition-all p-1 sm:p-4",
              selected === key && "border-primary [&_svg]:text-background",
              index % 2 ? "hover:rotate-1" : "hover:-rotate-1",
            )}
          >
            <div
              className={cn(
                "rounded-lg relative border-2 border-transparent bg-foreground/10 transition all p-1 sm:p-2",
                selected === key && "bg-primary",
              )}
            >
              <Icon className="size-4 stroke-1 sm:size-10" />
            </div>
            <h3 className="relative text-lg font-semibold sm:text-2xl">
              {title}
            </h3>
          </button>
        ))}
      </div>
      <div className="mx-auto max-w-6xl rounded-lg bg-background p-4">
        <h3 className="mb-6 text-2xl font-semibold sm:text-3xl">
          {currentFeature.title}
        </h3>
        <ul className="mb-6 flex flex-col gap-3">
          {currentFeature.points.map((point) => (
            <li key={point} className="flex items-start gap-1 sm:items-center">
              <div>
                <ChevronsRight />
              </div>
              <p className="max-w-2xl font-medium text-muted-foreground sm:text-xl">
                {point}
              </p>
            </li>
          ))}
        </ul>
        {!!currentFeature.poweredBy && (
          <div className="mb-3 font-medium sm:text-xl">
            {currentFeature.poweredBy}
          </div>
        )}
        {!!currentFeature.note && (
          <div className="text-sm text-muted-foreground sm:text-base">
            *{currentFeature.note}
          </div>
        )}
      </div>
    </div>
  );
}
