/**
 * NOTE: In Next.js 16, middleware.ts is deprecated in favor of proxy.ts.
 * However, proxy.ts only supports Node.js runtime, not Edge runtime.
 * We're keeping middleware.ts to continue using Edge runtime for this auth middleware.
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/middleware
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session =
    req.cookies.get("authjs.session-token") ||
    // Production, we can't use `auth` export as it has a bug with drizzle-orm on the edge
    req.cookies.get("__Secure-authjs.session-token");

  const isNextPageJoin = req.nextUrl.pathname.startsWith("/join");

  if (!session && !isNextPageJoin) {
    return NextResponse.redirect(
      new URL(`/join?redirect_to=${req.nextUrl.pathname}`, req.url),
    );
  }

  if (!!session && isNextPageJoin) {
    return NextResponse.redirect(new URL("/app/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/join/:path*"],
};
