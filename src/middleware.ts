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
