import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // ✅ Cookie se login status check karo
  const isLoggedIn = req.cookies.get("auth")?.value === "1";

  if (!isLoggedIn) {
    // ✅ Bina login → localhost:3000 (app/page.tsx) pe redirect
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/quotations/:path*",
    "/invoices/:path*",
    "/costing/:path*",
    "/services/:path*",
  ],
};