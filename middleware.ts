import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = req.cookies.get("auth")?.value === "1";

  // ✅ Public routes: Root (Login page), API, aur static assets
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2?|ttf|webp)$/);

  // ✅ Agar user already logged in hai aur root (/) par aata hai, toh quotations par bhej do
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/quotations", req.url));
  }

  // ✅ Public route allow karo
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ✅ Protected route + Not logged in -> Root (/) par wapas bhej do
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Har route match karo except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|css|js|woff2?|ttf|webp)$).*)",
  ],
};