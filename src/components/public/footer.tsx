import Image from "next/image";
import Link from "next/link";

export const PublicFooter = () => {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 grid gap-2 sm:col-span-1">
            <Link href="/">
              <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={110}
                height={40}
                priority
              />
            </Link>
            <p className="text-muted-foreground">
              Open source analytics for React applications. Copyright ©{" "}
              {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Links</h4>
            <div className="grid gap-1">
              <Link href="/#join" className="text-muted-foreground">
                Join
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Legal</h4>
            <div className="grid gap-1">
              <Link
                href="/legal/privacy-policy"
                className="text-muted-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/terms-of-service"
                className="text-muted-foreground"
              >
                Terms of service
              </Link>
              <Link href="/legal/license" className="text-muted-foreground">
                License
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Resources</h4>
            <div className="grid gap-1">
              <a
                href="https://github.com/jvidalv/react-analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground"
              >
                GitHub
              </a>
              <a
                href="https://github.com/jvidalv/react-analytics#documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground"
              >
                Documentation
              </a>
              <a
                href="https://github.com/jvidalv/react-analytics#self-hosting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground"
              >
                Self-Hosting Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
