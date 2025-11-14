import Image from "next/image";

export const MeSection = () => {
  return (
    <section className="relative border-t-2 px-6 py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row">
        <div className="sm:min-w-[150px]">
          <Image
            src="/assets/images/me.jpg"
            width={150}
            height={150}
            className="rounded-lg sm:rounded-full"
            alt="photo of me on Ararat, Turkye"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-medium text-muted-foreground">
            Hey, I&apos;m Josep 👋 I&apos;ve build countless mobile and web apps
            for both startups and big tech over the years and I know what&apos;s
            the ideal stack to build your app.
          </p>
          <div className="flex flex-col justify-between gap-2 text-2xl font-medium text-muted-foreground sm:flex-row">
            <p>
              Follow me on{" "}
              <a
                href="https://x.com/josepvidalvidal"
                className="font-semibold underline underline-offset-4"
                target="_blank"
              >
                Twitter!
              </a>
            </p>
            <p>
              ...and here&apos;s my{" "}
              <a
                href="https://josepvidal.dev"
                className="font-semibold underline underline-offset-4"
                target="_blank"
              >
                Portfolio
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
