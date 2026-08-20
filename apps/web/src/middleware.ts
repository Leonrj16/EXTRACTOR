import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

// Rutas de /admin accesibles sin sesión — login y el flujo de
// recuperación de contraseña, que por definición corre para alguien que
// todavía no puede entrar.
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export function middleware(request: NextRequest) {
  const isPublicPage = PUBLIC_ADMIN_PATHS.includes(request.nextUrl.pathname);
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const hasSession = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (!isPublicPage && !hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
