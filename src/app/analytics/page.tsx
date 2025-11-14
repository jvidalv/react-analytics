import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { BadgeCheck, Smartphone, BarChart3, Bug } from "lucide-react";
import { JoinSection } from "@/components/public/join-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ThunderIcon from "@/components/ui/thunder-icon";
import { MeSection } from "@/components/public/me-section";

export default function AnalyticsLanding() {
  return (
    <div>
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-24">
          <div className="flex flex-col items-center justify-center">
            <h1 className="mb-6 text-6xl font-black">
              Understand how users
              <br /> interact with your app
            </h1>
            <p className="mb-6 max-w-2xl text-xl text-muted-foreground sm:text-center">
              Expofast Analytics is a drop-in analytics tool for Expo apps.
            </p>
            <ul className="mb-6 space-y-2 text-lg">
              <li className="flex items-center gap-2">
                <BadgeCheck className="text-primary" /> Navigation, state and
                errors auto-tracked
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="text-primary" /> Lightweight + works
                offline via AsyncStorage
              </li>
              <li className="flex items-center gap-2">
                <BadgeCheck className="text-primary" /> Dashboards, filters and
                version-based insights
              </li>
            </ul>
            <div>
              <Link href="/analytics#join">
                <Button
                  size="lg"
                  className="animate-glow mb-2 py-7 text-xl !font-bold"
                >
                  <ThunderIcon /> Install from npm →
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg border">
            <img
              src="/assets/images/analytics.png"
              alt="Analytics dashboard"
              className="rounded-lg"
            />
          </div>
        </section>
        <div className="mb-28 h-px w-full bg-border" />
        <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-32 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="mb-2 w-fit rounded-lg border-2 border-indigo-500 bg-indigo-900 p-2 opacity-80">
              <Smartphone className="size-12 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-semibold">Built for Expo</h3>
            <p className="text-lg text-muted-foreground">
              Optimized for apps using <code>expo-router</code>, with zero
              config navigation tracking.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="mb-2 w-fit rounded-lg border-2 border-blue-500 bg-blue-900 p-2 opacity-80">
              <BarChart3 className="size-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-semibold">Real-time dashboard</h3>
            <p className="text-lg text-muted-foreground">
              Monitor users, actions, errors and versions from a clean UI.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="mb-2 w-fit rounded-lg border-2 border-pink-500 bg-pink-900 p-2 opacity-80">
              <Bug className="size-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-semibold">Track handled errors</h3>
            <p className="text-lg text-muted-foreground">
              Get insights from your try/catch blocks to improve stability.
            </p>
          </div>
        </section>
        <MeSection />
        <JoinSection />
      </main>
      <PublicFooter />
    </div>
  );
}
