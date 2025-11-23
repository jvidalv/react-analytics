import Link from "next/link";
import { Button } from "@/components/ui/button";

export const JoinSection = () => {
  return (
    <section id="join" className="px-6 py-32 sm:px-0 sm:py-36">
      <div className="relative mx-auto max-w-6xl">
        <div className="absolute top-[132px] opacity-50 sm:top-0 sm:opacity-100">
          <div className="size-32 bg-gray-900" />
          <div className="flex">
            <div className="size-16 bg-gray-900" />
            <div className="size-16 bg-background" />
            <div className="size-16 bg-indigo-900" />
          </div>
          <div className="ml-16 size-16 bg-gray-900" />
        </div>
        <div className="absolute -top-24 right-0 opacity-50 sm:top-0 sm:block  sm:opacity-100">
          <div className="flex">
            <div className="size-16 bg-pink-900" />
            <div className="size-16 bg-background" />
            <div className="size-16 bg-gray-900" />
          </div>
          <div className="size-32 bg-gray-900" />
          <div className="ml-16 size-16 bg-gray-900" />
        </div>
        <div className="relative">
          <h2 className="mb-4 text-center text-4xl font-bold sm:text-5xl">
            Start Today 🚀
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-lg font-medium text-muted-foreground sm:text-xl">
            Get started with{" "}
            <span className="text-foreground underline underline-offset-4">
              our free tier
            </span>{" "}
            or self-host the open source version. Start understanding your users
            in minutes.
          </p>
          <div className="mx-auto flex max-w-md justify-center">
            <Link href="/join">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
