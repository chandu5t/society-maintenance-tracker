import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  const user = token ? verifyToken(token) : null;

  console.log("========== MIDDLEWARE ==========");
  console.log("Path:", pathname);
  console.log("Token exists:", !!token);
  console.log("Verified user:", user);
  console.log("===============================");

  // Protected Routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isResidentRoute = pathname.startsWith("/resident");

  // Not logged in
  if ((isAdminRoute || isResidentRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Resident trying to access admin pages
  if (isAdminRoute && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/resident", request.url));
  }

  // Admin trying to access resident pages
  if (isResidentRoute && user?.role !== "RESIDENT") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/resident/:path*"],
};