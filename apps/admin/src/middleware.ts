import { routing } from "@/i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Paths protegidos por auth (qualquer role autenticado)
const PROTECTED_PATHS = [
  "/dashboard",
  "/courses",
  "/students",
  "/enrollments",
  "/settings",
  "/finance",
  "/ybr-admin",
];

// Paths SOMENTE admin YBR
const ADMIN_ONLY_PATHS = ["/ybr-admin"];

// Paths SOMENTE creator
const CREATOR_ONLY_PATHS = [
  "/courses",
  "/students",
  "/enrollments",
  "/settings",
  "/finance",
];

// Paths de auth — redirecionar para dashboard se já logado
const AUTH_PATHS = ["/login"];

const SUPPORTED_LOCALES = routing.locales as readonly string[];

const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("ybr_access_token")?.value;
  const role = request.cookies.get("ybr_user_role")?.value;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isCreatorOnlyPath = CREATOR_ONLY_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Não autenticado tentando acessar rota protegida
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Já logado tentando acessar página de auth
  if (isAuthPath && token) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/ybr-admin/creators", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Creator tentando acessar área admin
  if (isAdminOnlyPath && token && role && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin YBR tentando acessar área de creator
  if (isCreatorOnlyPath && token && role === "admin") {
    return NextResponse.redirect(new URL("/ybr-admin/creators", request.url));
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
