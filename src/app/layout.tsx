import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AnalyticsWrapper } from "@/components/providers/analytics-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "React Analytics — Privacy-first analytics for React applications",
  description:
    "Open source, self-hostable analytics platform for React, Next.js, Expo, and React Native. Track user behavior without compromising privacy.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} antialiased`}>
        <AnalyticsWrapper>
          <NuqsAdapter>{children}</NuqsAdapter>
        </AnalyticsWrapper>
      </body>
    </html>
  );
}
