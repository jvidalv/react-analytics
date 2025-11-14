import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public/header";
import ThunderIcon from "@/components/ui/thunder-icon";
import { PublicFooter } from "@/components/public/footer";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HomeStarterFeatures from "@/app/page.starter-features";
import {
  BookText,
  Check,
  Copy,
  Infinity,
  LayoutGrid,
  Plus,
  Smartphone,
  X,
} from "lucide-react";
import Link from "next/link";
import { PRICE_PLANS } from "@/domains/plan/api.plan";
import { JoinSection } from "@/components/public/join-section";
import { MeSection } from "@/components/public/me-section";

export default function Home() {
  const features = [
    {
      Icon: Smartphone,
      title: "ExpoFast starter",
      description: "An app boilerplate to quick-start your journey.",
      color: "bg-primary text-background",
    },
    {
      Icon: LayoutGrid,
      title: "Production apps code",
      description: "Use all the solutions already implemented on our own apps.",
      color: "bg-indigo-500",
    },
    {
      Icon: Copy,
      title: "Stores boilerplate generation",
      description: "Generate with AI all the mandatory texts and images.",
      color: "bg-violet-500",
    },
    {
      Icon: BookText,
      title: "Documentation x2",
      description: "Concise documentation, made by builders for builders.",
      color: "bg-pink-500",
    },
  ];

  const twits = [
    {
      text: (
        <p className="text-xl font-medium">
          <span className="bg-gray-800 text-white transition-all hover:bg-primary">
            One of the best investments I did
          </span>
          , the amount and the quality of the code is insane.
        </p>
      ),
      avatar: "https://github.com/shadcn.png",
      name: "Josep Vidal",
      handle: "@josepvidalvidal",
      url: "https://x.com/josepvidalvidal",
    },
    {
      text: (
        <p className="text-xl font-medium">
          <span className="bg-gray-800 text-white transition-colors hover:bg-primary">
            Complete access to production code
          </span>{" "}
          is a game changer, there are real examples of everything!
        </p>
      ),
      avatar:
        "https://pbs.twimg.com/profile_images/1866391662475218944/iZY0SInO_400x400.jpg",
      name: "Andrew Johannson",
      handle: "@andrewjohnson",
      url: "https://x.com/josepvidalvidal",
    },
    {
      text: (
        <p className="text-xl font-medium">
          Having high quality texts and images for the mobile stores with a
          single click is a{" "}
          <span className="bg-gray-800 text-white transition-colors hover:bg-primary">
            huge time save
          </span>
          .
        </p>
      ),
      avatar:
        "https://pbs.twimg.com/profile_images/1878823258306367488/35_KLF3T_400x400.jpg",
      name: "Nathan",
      handle: "@nathan_222",
      url: "https://x.com/josepvidalvidal",
    },
  ];

  const faqs = [
    {
      title: "What do I receive exactly?",
      content: (
        <>
          <span>
            When you buy Wood 🪵 or Metal 🪙, you get the full code repository
            to start your app.
          </span>
          <span>
            Plus, ExpoFast unlocks completely—giving you access to docs, tools,
            and with Metal, our own app’s code. 🚀
          </span>
        </>
      ),
    },
    {
      title: "How often is ExpoFast updated?",
      content: (
        <>
          <span>
            Almost daily, as I use both the platform and the product for myself
            I kept it in perfect shape.
          </span>
        </>
      ),
    },
    {
      title: "How flexible is the tech stack?",
      content: (
        <>
          <span>
            The template is built with React Native and Expo, fully typed with
            TypeScript from the app to the API and database.
          </span>
          <span>
            It uses PostgreSQL by default, but you can easily switch to SQLite
            or MySQL as needed.
          </span>
        </>
      ),
    },
    {
      title: "Is there any extra cost ($)?",
      content: (
        <>
          <span>
            Both Vercel and Expo offer a generous free tier for hosting the API.
          </span>
          <span>
            Supabase (database) and Resend (email handling) also provide free
            tiers.
          </span>
          <span>
            This means you can launch a fully functional app in production for
            $0/month.
          </span>
        </>
      ),
    },
  ];

  return (
    <div>
      <PublicHeader />
      <main>
        <section className="mx-auto my-6 mb-16 grid min-h-[60vh] max-w-7xl items-center gap-8 px-6 sm:grid-cols-2 sm:py-0">
          <div className="flex flex-col">
            <h1 className="mb-6 text-5xl font-black sm:text-6xl">
              <span className="relative z-10">Ship your app in days, </span>
              <span className="relative whitespace-nowrap px-1">
                <span className="relative z-10">not weeks.</span>
                <div className="animate-grow absolute left-0 top-1 z-0 size-full w-0 -rotate-1 bg-white/20" />
              </span>
            </h1>
            <div>
              <p className="mb-8 text-xl font-medium text-muted-foreground">
                The all-in-one product with all you need to build your mobile
                app and make your first $ online fast.
              </p>
            </div>
            <div>
              <Link href="/#join">
                <Button
                  size="lg"
                  className="animate-glow mb-2 py-7 text-xl !font-bold"
                >
                  <ThunderIcon /> Get ExpoFast →
                </Button>
              </Link>
            </div>
          </div>
          <div className="">
            <Image
              src="/assets/images/upsell.png"
              alt="upsell"
              width={500}
              height={500}
            />
          </div>
        </section>
        <section className="mx-auto mb-32 flex max-w-7xl flex-col gap-4 px-6 pt-8 sm:mb-40 sm:flex-row sm:pt-0">
          {twits.map(({ text, name, handle, avatar, url }) => (
            <div
              key={name}
              className="flex h-60 w-full flex-col justify-between rounded-lg border-2 p-6"
            >
              {text}
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{name}</div>
                    <div className="text-muted-foreground">{handle}</div>
                  </div>
                </div>
                <a href={url} target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="currentColor"
                  >
                    <path d="M16.42 2H21l-7.34 8.14L22 22h-6.08l-4.88-5.93L5.4 22H1l7.92-8.78L2 2h6.08l4.5 5.63L16.42 2ZM14.9 20h1.86L6.73 4H4.83l10.07 16Z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </section>
        <section className="mx-auto mb-32 max-w-7xl px-6 sm:mb-56">
          <div className="mb-14">
            <h2 className="mb-4 text-4xl font-bold sm:text-center sm:text-5xl">
              Make your idea a reality 🚀
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
              Stop wasting your time on repetitive time-sinks like repository
              boilerplate, infra setup, app stores config... thanks to ExpoFast
              offerings:
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 sm:gap-8">
            {features.map(({ title, description, Icon, color }) => (
              <li
                key={title}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-fit relative rounded p-2 animate-glow",
                      color,
                    )}
                  >
                    <Icon className="relative z-20 size-14 stroke-1" />
                    <span
                      className={cn(
                        "absolute inset-0 animate-pulse rounded-lg  blur-md",
                        color,
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-medium sm:hidden">{title}</h3>
                </div>
                <div>
                  <h3 className="hidden text-2xl font-medium sm:block">
                    {title}
                  </h3>
                  <p className="text-xl font-medium text-muted-foreground">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-foreground/5 px-6 py-24 sm:py-36">
          <h2 className="mb-4 text-4xl font-bold sm:text-center sm:text-5xl">
            This is{" "}
            <span className="relative">
              <span className="relative z-10 text-background">waaay more</span>
              <div className="animate-grow absolute left-0 top-0 z-0 size-full w-0 -rotate-1 bg-primary" />
            </span>{" "}
            than a starter template
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
            Authenticate users, process payments, push notifications, send
            emails... Invest your time on coding your app not on configuration
            chores.
          </p>
          <HomeStarterFeatures />
        </section>
        <section id="pricing" className="relative px-6 py-16 sm:py-36">
          <span className="absolute h-0 opacity-0">Pricing</span>
          <h2 className="mb-4 text-4xl font-bold sm:text-center sm:text-5xl">
            Invest on the best foundation
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
            Receive a{" "}
            <span className="text-foreground underline underline-offset-4">
              100$ discount
            </span>{" "}
            as one of the 1000 initial devs enjoying ExpoFast.
          </p>
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
            {PRICE_PLANS.map(
              (
                {
                  title,
                  price,
                  slashedPrice,
                  crossedBulletPoints,
                  bulletPoints,
                  payOnce,
                  ctaText,
                  allThePrevious,
                  ctaButtonVariant,
                  ctaUrl,
                },
                index,
              ) => (
                <div
                  key={title}
                  className={cn(
                    "flex flex-col rounded-xl border-4 p-4 sm:p-6",
                    index === 2 && "border-emerald-400",
                  )}
                >
                  <h4 className="mb-4 text-2xl font-medium">{title}</h4>
                  <div className="mb-6 flex items-center gap-2">
                    {slashedPrice && (
                      <span className="text-4xl font-black text-muted-foreground line-through">
                        ${slashedPrice}
                      </span>
                    )}
                    <span className="text-6xl font-black">${price}</span>
                  </div>
                  <ul className="mb-8 flex flex-col gap-1.5">
                    {allThePrevious && (
                      <li className="flex items-center gap-2 text-foreground/80">
                        <div>
                          <Plus />
                        </div>
                        <div className="text-lg font-medium sm:text-xl">
                          All the previous
                        </div>
                      </li>
                    )}
                    {bulletPoints.map((bp) => (
                      <li key={bp} className="flex items-center gap-2">
                        <div>
                          <Check />
                        </div>
                        <div
                          className={cn(
                            "text-lg sm:text-xl font-medium",
                            "ExpoFast starter" === bp &&
                              "text-blue-500 font-semibold",
                            "Lifetime updates" === bp &&
                              "text-emerald-500 font-semibold",
                            "Access to our apps code" === bp &&
                              "text-indigo-500",
                          )}
                        >
                          {bp} {"Lifetime updates" === bp && "🏆"}
                          {"Access to our apps code" === bp && "⭐"}
                        </div>
                      </li>
                    ))}

                    {crossedBulletPoints?.map((bp) => (
                      <li
                        key={bp}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <div>
                          <X />
                        </div>
                        <div className="text-lg font-medium sm:text-xl">
                          {bp}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <a href={ctaUrl} target="_blank">
                      <Button
                        // @ts-expect-error -- acceptable risk
                        variant={ctaButtonVariant}
                        size="lg"
                        className="w-full text-base"
                      >
                        {ctaText} →
                      </Button>
                    </a>
                    {payOnce ? (
                      <div className="mt-2">
                        <span className="flex items-center justify-center gap-1">
                          One payment, <Infinity alt-title="infinite" /> apps.
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 opacity-0">
                        <span className="flex items-center justify-center gap-1">
                          One payment, <Infinity alt-title="infinite" /> apps.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
        <section id="faq" className="relative bg-foreground/5 px-6 py-24">
          <span className="absolute h-0 opacity-0">FAQ</span>
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl">
                ExpoFast is not only a repository with code, but a platform with
                tools that speed up your development process.
              </p>
            </div>
            <ul className="flex flex-col gap-4">
              {faqs.map(({ title, content }) => (
                <li key={title}>
                  <h4 className="mb-1 text-xl font-semibold">{title}</h4>
                  <p className="flex flex-col gap-1 text-lg font-medium text-muted-foreground">
                    {content}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <MeSection />
        <JoinSection />
      </main>
      <PublicFooter />
    </div>
  );
}
