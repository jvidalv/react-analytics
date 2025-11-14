import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expofast — Ship mobile apps in days not weeks",
  description:
    "Expofast supercharges your workflow, have an S-grade app production ready in days, not weeks.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
