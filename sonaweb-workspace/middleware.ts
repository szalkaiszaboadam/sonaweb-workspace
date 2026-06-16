// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasAuthToken = request.cookies.has("auth_token_present");
  const { pathname } = request.nextUrl;

  // Ha nincs bejelentkezve és nem a login oldalon áll, irányítsuk át a loginra
  if (!hasAuthToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ha már be van jelentkezve, de mégis a login oldalra tévedne, irányítsuk a főoldalra
  if (hasAuthToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Minden útvonalra lefusson, kivéve az API-kat, a statikus fájlokat és az ikonokat
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};