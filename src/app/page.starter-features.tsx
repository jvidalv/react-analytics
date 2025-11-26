"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  ChevronsRight,
  Database,
  Filter,
  Globe,
  Search,
  Smartphone,
  UserCircle,
} from "lucide-react";

export default function HomeStarterFeatures() {
  const [selected, setSelected] = useState("tracking");

  const features = [
    {
      key: "tracking",
      title: "Event Tracking",
      points: [
        "Automatic navigation tracking for Next.js App Router, Expo Router, and React Router.",
        "Track custom actions, errors, state changes, and user identification.",
        "Properties support for detailed event metadata (up to 5KB).",
        "Client-side batching for optimized network performance.",
      ],
      Icon: Activity,
    },
    {
      key: "dashboard",
      title: "Dashboard",
      points: [
        "Real-time analytics visualization with beautiful, intuitive interface.",
        "User journey timelines showing complete event history.",
        "Error tracking and debugging with full context and stack traces.",
        "Session-based analytics to understand user behavior patterns.",
      ],
      poweredBy: (
        <p>
          Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Next.js 15
          </a>{" "}
          and{" "}
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Shadcn/ui
          </a>
          .
        </p>
      ),
      Icon: BarChart3,
    },
    {
      key: "platforms",
      title: "Multi-Platform",
      points: [
        "Universal analytics library for React, React Native, Expo, and Next.js.",
        "Single package (@jvidalv/react-analytics) works everywhere.",
        "Automatic platform detection and device information collection.",
        "Consistent API across web and mobile platforms.",
      ],
      poweredBy: (
        <p>
          Supports{" "}
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            React
          </a>
          ,{" "}
          <a
            href="https://reactnative.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            React Native
          </a>
          ,{" "}
          <a
            href="https://expo.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Expo
          </a>
          , and{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Next.js
          </a>
          .
        </p>
      ),
      Icon: Smartphone,
    },
    {
      key: "users",
      title: "User Analytics",
      points: [
        "Identify users with custom IDs to track across sessions and devices.",
        "Device fingerprinting for anonymous user tracking.",
        "User session management and session-based analytics.",
        "Privacy-focused with sensitive mode to hide personal data.",
      ],
      Icon: UserCircle,
    },
    {
      key: "database",
      title: "Data Storage",
      points: [
        "PostgreSQL database with Drizzle ORM for type safety.",
        "Separate production and test data tables for clean development.",
        "Optimized indexes for fast queries on large datasets.",
        "JSON support for flexible event properties storage.",
      ],
      poweredBy: (
        <p>
          Uses{" "}
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Neon
          </a>{" "}
          serverless PostgreSQL with{" "}
          <a
            href="https://orm.drizzle.team"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Drizzle ORM
          </a>
          .
        </p>
      ),
      note: "Switch to any PostgreSQL, MySQL, or SQLite database.",
      Icon: Database,
    },
    {
      key: "api",
      title: "Simple API",
      points: [
        "RESTful API endpoint for analytics ingestion (/api/analytics/push).",
        "API key authentication with separate production and test keys.",
        "CORS-enabled for cross-origin requests from your apps.",
        "Comprehensive API documentation and TypeScript types.",
      ],
      note: "Fully typed end-to-end experience with TypeScript.",
      Icon: Globe,
    },
    {
      key: "filtering",
      title: "Query & Filter",
      points: [
        "Filter events by date range, event type, and user ID.",
        "Search functionality to find specific events quickly.",
        "Pagination support for handling large datasets.",
        "Aggregated statistics and metrics calculation.",
      ],
      Icon: Filter,
    },
    {
      key: "opensource",
      title: "Open Source",
      points: [
        "Fully open source and MIT licensed—fork it, customize it, contribute to it.",
        "Self-host on your own infrastructure for complete data control.",
        "Docker support and comprehensive deployment documentation.",
        "Active community and regular updates on GitHub.",
      ],
      poweredBy: (
        <p>
          View source code on{" "}
          <a
            href="https://github.com/jvidalv/react-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      ),
      Icon: Search,
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
              "relative hover:scale-105 flex cursor-pointer items-center gap-2 sm:gap-3  bg-background border-4 border-transparent transition-all p-1 sm:p-4",
              selected === key && "border-primary [&_svg]:text-background",
              index % 2 ? "hover:rotate-1" : "hover:-rotate-1",
            )}
          >
            <div
              className={cn(
                " relative border-2 border-transparent bg-foreground/10 transition all p-1 sm:p-2",
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
      <div className="mx-auto max-w-6xl  bg-background p-4">
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
