import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Admin paths requiring authentication (without locale prefix)
const PROTECTED_PATHS = [
  "/dashboard",
  "/cursos",
  "/alunos",
  "/analises",
  "/configuracoes",
];

// Auth-only paths — redirect to dashboard when already logged in
const AUTH_PATHS = ["/login"];

const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Strip the locale segment from the pathname for route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|pt-BR|es)/, "") || "/";

  const token = request.cookies.get("ybr_access_token")?.value;
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathnameWithoutLocale.startsWith(path),
  );
  const isAuthPath = AUTH_PATHS.some((path) =>
    pathnameWithoutLocale.startsWith(path),
  );

  // Detect active locale for constructing redirect URLs
  const localeMatch = pathname.match(/^\/(en|pt-BR|es)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  if (isProtectedPath && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};

export default middleware;
