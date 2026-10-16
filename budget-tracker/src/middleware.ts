import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/api/health"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Early redirect only — cookie presence does not guarantee a valid session.
  // Real authorization happens in server components via lucia.validateSession().
  const sessionCookie = request.cookies.get(lucia.sessionCookieName);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
