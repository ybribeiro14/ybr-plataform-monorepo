import { routing } from "@/i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Paths protegidos por auth
const PROTECTED_PATHS = ["/dashboard", "/my-courses", "/courses", "/profile"];

// Paths de auth — redirecionar para dashboard se já logado
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

const SUPPORTED_LOCALES = routing.locales as readonly string[];

const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ybr_access_token")?.value;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  // Garantir que o cookie ybr_locale esteja definido com um valor suportado
  const cookieLocale = request.cookies.get("ybr_locale")?.value;
  if (!cookieLocale || !SUPPORTED_LOCALES.includes(cookieLocale)) {
    response.cookies.set("ybr_locale", routing.defaultLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};

export default middleware;
