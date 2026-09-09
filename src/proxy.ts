import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    // No dedicated admin login page: staff sign in through the storefront form.
    if (session?.role !== "admin") {
      const url = new URL("/giris", request.url);
      url.searchParams.set("devam", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/hesap") && !session) {
    const url = new URL("/giris", request.url);
    url.searchParams.set("devam", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/hesap", "/hesap/:path*"],
};
