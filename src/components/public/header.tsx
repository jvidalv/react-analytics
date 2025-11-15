import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThunderIcon from "@/components/custom/thunder-icon";
import { Star } from "lucide-react";

async function getGithubStars() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/jvidalv/react-analytics",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return 0;
  }
}

export const PublicHeader = async () => {
  const stars = await getGithubStars();

  return (
    <header className="mx-auto flex max-w-7xl items-center px-4 py-5">
      <nav className="flex w-full items-center justify-between">
        <Link href="/">
          <img src="/assets/images/logo.png" alt="Logo" width={80} />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href="https://github.com/jvidalv/react-analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2  px-3 py-2 text-sm font-medium transition-all hover:bg-gray-800"
          >
            <Star className="size-4 fill-foreground" />
            {stars.toLocaleString()}
          </a>
          <Link href="/join">
            <Button variant="outline">
              <ThunderIcon className="text-white" /> Start Tracking
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};
