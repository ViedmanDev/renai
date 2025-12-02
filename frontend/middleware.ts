// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Permite que tu frontend haga requests
  res.headers.set(
    "Access-Control-Allow-Origin",
    "https://renai-2ebd.onrender.com"
  ); // tu frontend
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Preflight request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: res.headers });
  }

  return res;
}

// Aplica solo a las rutas de auth
export const config = {
  matcher: ["/auth/:path*"],
};
