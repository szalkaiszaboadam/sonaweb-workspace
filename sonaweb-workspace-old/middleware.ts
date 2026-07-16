// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasAuthToken = request.cookies.has("auth_token_present");
  const { pathname } = request.nextUrl;

  // Definiáljuk a publikus útvonalakat (ahova bejelentkezés nélkül is mehet a user)
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.includes(pathname);

  // Ha nincs bejelentkezve és NEM publikus oldalon áll, irányítsuk át a loginra
  if (!hasAuthToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ha már be van jelentkezve, de login/register oldalra tévedne, irányítsuk a főoldalra
  if (hasAuthToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Minden útvonalra lefusson, kivéve az API-kat és a statikus fájlokat
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};