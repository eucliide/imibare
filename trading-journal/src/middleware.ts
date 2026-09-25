import { NextRequest, NextResponse } from "next/server";
import { lucia } from "@/lib/auth";

const PUBLIC_PATHS = new Set(["/login", "/signup"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie by name from the Lucia instance
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
