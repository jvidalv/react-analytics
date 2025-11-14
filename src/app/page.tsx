import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public/header";
import ThunderIcon from "@/components/custom/thunder-icon";
import { PublicFooter } from "@/components/public/footer";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HomeStarterFeatures from "@/app/page.starter-features";
import {
  Activity,
  BarChart3,
  BookText,
  Check,
  Copy,
  Database,
  Infinity,
  LayoutGrid,
  Layers,
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
      title: "Multi-Platform Library",
      description: "Drop-in analytics for React, React Native, Expo, and Next.js with zero config.",
      color: "bg-primary text-background",
    },
    {
      Icon: BarChart3,
      title: "Real-Time Dashboard",
      description: "Beautiful analytics dashboard to visualize user journeys, events, and errors.",
      color: "bg-indigo-500",
    },
    {
      Icon: Activity,
      title: "Event Tracking",
      description: "Track navigation, custom actions, state changes, and errors automatically.",
      color: "bg-violet-500",
    },
    {
      Icon: Layers,
      title: "Multi-App Management",
      description: "Manage analytics for unlimited apps from a single dashboard with separate API keys.",
      color: "bg-pink-500",
    },
    {
      Icon: Database,
      title: "Open Source & Self-Hostable",
      description: "Full control over your data. Self-host on your own infrastructure or use our hosted solution.",
      color: "bg-emerald-500",
    },
    {
      Icon: BookText,
      title: "Complete Documentation",
      description: "Comprehensive guides, API references, and examples to get you started in minutes.",
      color: "bg-amber-500",
    },
  ];

  const twits = [
    {
      text: (
        <p className="text-xl font-medium">
          <span className="bg-gray-800 text-white transition-all hover:bg-primary">
            Finally, analytics that just works
          </span>
          {" "}across all my React apps. Setup took literally 5 minutes.
        </p>
      ),
      avatar: "https://github.com/shadcn.png",
      name: "Sarah Chen",
      handle: "@sarahcodes",
      url: "https://x.com/josepvidalvidal",
    },
    {
      text: (
        <p className="text-xl font-medium">
          Being{" "}
          <span className="bg-gray-800 text-white transition-colors hover:bg-primary">
            open source and self-hostable
          </span>{" "}
          means I own my data. Perfect for enterprise compliance.
        </p>
      ),
      avatar:
        "https://pbs.twimg.com/profile_images/1866391662475218944/iZY0SInO_400x400.jpg",
      name: "Marcus Weber",
      handle: "@marcusdev",
      url: "https://x.com/josepvidalvidal",
    },
    {
      text: (
        <p className="text-xl font-medium">
          The real-time dashboard helped us identify and fix a{" "}
          <span className="bg-gray-800 text-white transition-colors hover:bg-primary">
            critical navigation bug
          </span>{" "}
          in production within minutes.
        </p>
      ),
      avatar:
        "https://pbs.twimg.com/profile_images/1878823258306367488/35_KLF3T_400x400.jpg",
      name: "Alex Rodriguez",
      handle: "@alexbuilds",
      url: "https://x.com/josepvidalvidal",
    },
  ];

  const faqs = [
    {
      title: "Is React Analytics really free?",
      content: (
        <>
          <span>
            Yes! The free tier includes 1 project, 10,000 events per month, and 30 days of data retention.
            Perfect for side projects and small applications.
          </span>
          <span>
            Plus, being open source, you can self-host it completely free on your own infrastructure.
          </span>
        </>
      ),
    },
    {
      title: "Can I self-host React Analytics?",
      content: (
        <>
          <span>
            Absolutely! React Analytics is fully open source and self-hostable.
            You get complete control over your data and infrastructure.
          </span>
          <span>
            We provide comprehensive documentation and Docker support to make self-hosting easy.
            Check our GitHub repository for the full self-hosting guide.
          </span>
        </>
      ),
    },
    {
      title: "What platforms are supported?",
      content: (
        <>
          <span>
            Our analytics library works seamlessly with React, React Native, Expo, and Next.js.
            One package, universal compatibility.
          </span>
          <span>
            It automatically detects your router (Next.js App Router, Expo Router, React Router)
            and tracks navigation events without any configuration.
          </span>
        </>
      ),
    },
    {
      title: "How is my data stored?",
      content: (
        <>
          <span>
            For our hosted solution, we use PostgreSQL with industry-standard security practices.
            Your data is encrypted at rest and in transit.
          </span>
          <span>
            For self-hosted deployments, you have complete control—use PostgreSQL, MySQL, or SQLite
            on your own infrastructure.
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
              <span className="relative z-10">Understand your users, </span>
              <span className="relative whitespace-nowrap px-1">
                <span className="relative z-10">not just your code.</span>
                <div className="animate-grow absolute left-0 top-1 z-0 size-full w-0 -rotate-1 bg-white/20" />
              </span>
            </h1>
            <div>
              <p className="mb-8 text-xl font-medium text-muted-foreground">
                Complete analytics solution for React, React Native, Expo, and Next.js.
                Track user behavior, monitor app health, and make data-driven decisions.
              </p>
            </div>
            <div>
              <Link href="/#join">
                <Button
                  size="lg"
                  className="animate-glow mb-2 py-7 text-xl !font-bold"
                >
                  <ThunderIcon /> Start Tracking Free →
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
              Everything you need to understand your users 📊
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
              From event tracking to real-time dashboards, React Analytics gives you
              the complete toolkit to monitor user behavior across all your React applications:
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {features.map(({ title, description, Icon, color }) => (
              <li
                key={title}
                className="flex flex-col gap-2 sm:items-start sm:gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-fit relative rounded p-2 animate-glow",
                      color,
                    )}
                  >
                    <Icon className="relative z-20 size-12 stroke-1" />
                    <span
                      className={cn(
                        "absolute inset-0 animate-pulse rounded-lg blur-md",
                        color,
                      )}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {title}
                  </h3>
                  <p className="text-base font-medium text-muted-foreground">
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
              <span className="relative z-10 text-background">so much more</span>
              <div className="animate-grow absolute left-0 top-0 z-0 size-full w-0 -rotate-1 bg-primary" />
            </span>{" "}
            than just event tracking
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
            From automatic navigation tracking to real-time dashboards, custom event properties to
            user identification... everything you need to truly understand your users.
          </p>
          <HomeStarterFeatures />
        </section>
        <section className="px-6 py-24 sm:py-36">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                Open Source & Self-Hostable 🔓
              </h2>
              <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl">
                Full transparency and control. Host on your infrastructure or use our managed service.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border-2 bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <LayoutGrid className="size-8 text-primary" />
                  <h3 className="text-2xl font-semibold">MIT Licensed</h3>
                </div>
                <p className="mb-6 text-lg text-muted-foreground">
                  Complete source code available on GitHub. Fork it, customize it,
                  contribute to it—it's yours to use however you need.
                </p>
                <a
                  href="https://github.com/jvidalv/react-analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lg font-medium text-primary hover:underline"
                >
                  View on GitHub →
                </a>
              </div>
              <div className="rounded-xl border-2 bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Database className="size-8 text-emerald-500" />
                  <h3 className="text-2xl font-semibold">Self-Host</h3>
                </div>
                <p className="mb-6 text-lg text-muted-foreground">
                  Deploy to your own servers, keep your data private, and maintain complete control.
                  Full documentation and Docker support included.
                </p>
                <a
                  href="https://github.com/jvidalv/react-analytics#self-hosting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lg font-medium text-emerald-600 hover:underline"
                >
                  Self-Hosting Guide →
                </a>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="relative bg-foreground/5 px-6 py-16 sm:py-36">
          <span className="absolute h-0 opacity-0">Pricing</span>
          <h2 className="mb-4 text-4xl font-bold sm:text-center sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-medium text-muted-foreground sm:text-center sm:text-xl">
            Start free and scale as you grow. All plans include our complete analytics library
            and real-time dashboard. Open source and self-hostable—you own your data.
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
                  perMonth,
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
                    {perMonth ? (
                      <div className="mt-2">
                        <span className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          Billed monthly, cancel anytime
                        </span>
                      </div>
                    ) : payOnce ? (
                      <div className="mt-2">
                        <span className="flex items-center justify-center gap-1">
                          One payment, <Infinity alt-title="infinite" /> apps.
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 opacity-0">
                        <span className="flex items-center justify-center gap-1 text-sm">
                          placeholder
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
                Everything you need to know about React Analytics, from self-hosting
                to supported platforms and data privacy.
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
