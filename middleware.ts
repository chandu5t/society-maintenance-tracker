import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let user: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch {
      user = null;
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isResidentRoute = pathname.startsWith("/resident");

  if ((isAdminRoute || isResidentRoute) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminRoute && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/resident", request.url));
  }

  if (isResidentRoute && user.role !== "RESIDENT") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/resident/:path*"],
};