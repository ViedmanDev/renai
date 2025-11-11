import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("auth")?.value;

  const protectedRoutes = ["/project", "/dashboard"];

  if (protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))) {

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }
}
export const config = {
  matcher: ["/project/:path*", "/dashboard/:path*"],
};
