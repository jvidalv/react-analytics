import ThunderIcon from "@/components/custom/thunder-icon";
import { PublicFooter } from "@/components/public/footer";
import Image from "next/image";
import { SignInButton } from "@/app/join/page.buttons";
import { Suspense } from "react";
import { Metadata } from "next";
import PageError from "@/app/join/page.error";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Join - React Analytics",
  };
}

export default function JoinPage() {
  return (
    <div>
      <main className="grid min-h-screen grid-cols-2">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center">
          <Link href="/">
            <h1 className="mb-2 text-3xl font-bold">Welcome!</h1>
          </Link>
          <p className="mb-6 text-lg font-medium text-muted-foreground">
            Privacy-first analytics for your React apps
          </p>
          <Suspense>
            <div className="mb-4 flex flex-col gap-2">
              <SignInButton provider="google" />
              <SignInButton provider="github" />
            </div>
            <PageError />
          </Suspense>
        </div>
        <div className="flex items-center justify-center  bg-gradient-to-bl from-purple-600 to-purple-800">
          <img
            src="/assets/images/logo.png"
            alt="upsell"
            width={500}
            height={500}
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
