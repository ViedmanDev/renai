import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("auth")?.value;

  // Rutas protegidas (requieren autenticación)
  const protectedRoutes = ["/project", "/dashboard"];

  // Rutas públicas (NO requieren autenticación)
  const publicRoutes = ["/auth/login", "/auth/register"];

  const isProtectedRoute = protectedRoutes.some(
    (r) =>
      req.nextUrl.pathname === r || req.nextUrl.pathname.startsWith(r + "/")
  );

  const isPublicRoute = publicRoutes.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  // Si intenta acceder a ruta protegida sin token
  if (isProtectedRoute && !token) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Si ya está logueado e intenta ir al login, redirigir al home
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
