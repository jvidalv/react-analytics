import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import Image from "next/image";
import { Database, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { JoinSection } from "@/components/public/join-section";

export default function Home() {
  const faqs = [
    {
      title: "Is React Analytics really free?",
      content: (
        <>
          <span>
            Yes! The free tier includes 1 project and 10,000 events per month.
            Perfect for side projects and small applications.
          </span>
          <span>
            Plus, being open source, you can self-host it completely free on
            your own infrastructure.
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
            We provide comprehensive documentation and Docker support to make
            self-hosting easy. Check our GitHub repository for the full
            self-hosting guide.
          </span>
        </>
      ),
    },
    {
      title: "What platforms are supported?",
      content: (
        <>
          <span>
            Our analytics library works seamlessly with React, React Native,
            Expo, and Next.js. One package, universal compatibility.
          </span>
          <span>
            It automatically detects your router (Next.js App Router, Expo
            Router, React Router) and tracks navigation events without any
            configuration.
          </span>
        </>
      ),
    },
    {
      title: "How is my data stored?",
      content: (
        <>
          <span>
            For our hosted solution, we use PostgreSQL with industry-standard
            security practices. Your data is encrypted at rest and in transit.
          </span>
          <span>
            For self-hosted deployments, you have complete control—use
            PostgreSQL, MySQL, or SQLite on your own infrastructure.
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
                <div className="animate-grow absolute left-0 top-1 z-0 size-full w-0 -rotate-1 bg-purple-900" />
              </span>
            </h1>
            <div>
              <p className="mb-8 text-xl font-medium text-muted-foreground">
                Complete analytics solution for React, React Native, Expo, and
                Next.js. Track user behavior, monitor app health, and make
                data-driven decisions.
              </p>
            </div>
            <div>
              <Link href="/join">
                <Button
                  size="lg"
                  className="mb-2 py-7 text-xl !font-bold min-w-xs animate-glow"
                >
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="">
            <Image
              src="/assets/images/icon.png"
              alt="upsell"
              className="transition-all opacity-50 hover:scale-105 hover:opacity-100"
              width={500}
              height={500}
            />
          </div>
        </section>
        <section className="px-6 py-24 sm:py-36">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                Open Source & Self-Hostable 🔓
              </h2>
              <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl">
                Full transparency and control. Host on your infrastructure or
                use our managed service.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className=" border-2 bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <LayoutGrid className="size-8 text-primary" />
                  <h3 className="text-2xl font-semibold">MIT Licensed</h3>
                </div>
                <p className="mb-6 text-lg text-muted-foreground">
                  Complete source code available on GitHub. Fork it, customize
                  it, contribute to it—it's yours to use however you need.
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
              <div className=" border-2 bg-card p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Database className="size-8 text-emerald-500" />
                  <h3 className="text-2xl font-semibold">Self-Host</h3>
                </div>
                <p className="mb-6 text-lg text-muted-foreground">
                  Deploy to your own servers, keep your data private, and
                  maintain complete control. Full documentation and Docker
                  support included.
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
        <section id="faq" className="relative bg-foreground/5 px-6 py-24">
          <span className="absolute h-0 opacity-0">FAQ</span>
          <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2">
            <div>
              <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl">
                Everything you need to know about React Analytics, from
                self-hosting to supported platforms and data privacy.
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
        <JoinSection />
      </main>
      <PublicFooter />
    </div>
  );
}
