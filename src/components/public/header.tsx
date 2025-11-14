import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThunderIcon from "@/components/custom/thunder-icon";
import GithubIcon from "@/components/custom/github-icon";

export const PublicHeader = () => {
  return (
    <header className="mx-auto flex max-w-7xl items-center px-4 py-5">
      <nav className="flex w-full items-center justify-between">
        <Link href="/">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={110}
            height={40}
            priority
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/#join">
            <Button variant="outline">
              <ThunderIcon className="text-white" /> Start Tracking
            </Button>
          </Link>
          <a
            href="https://github.com/jvidalv/react-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all hover:scale-105"
          >
            <GithubIcon className="size-6 sm:size-8" />
          </a>
        </div>
      </nav>
    </header>
  );
};
