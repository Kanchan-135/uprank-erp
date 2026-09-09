import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "school-erp-super-secure-production-secret-key-2025"
);
const COOKIE_NAME = "school_erp_token";

const ROLE_DASHBOARDS: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SCHOOL_ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let user: { role: string; userId: string; email: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = {
        role: payload.role as string,
        userId: payload.userId as string,
        email: payload.email as string,
      };
    } catch {
      // Invalid, tampered, or expired token
      user = null;
    }
  }

  // If user is at /login and already authenticated, redirect to their role dashboard
  if (pathname === "/login") {
    if (request.nextUrl.searchParams.has("force") || request.nextUrl.searchParams.has("logout")) {
      const res = NextResponse.next();
      res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0, expires: new Date(0) });
      return res;
    }
    if (user && user.role && ROLE_DASHBOARDS[user.role]) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[user.role], request.url));
    }
    return NextResponse.next();
  }

  // Determine required role(s) based on path prefix
  let allowedRoles: string[] | null = null;

  if (pathname.startsWith("/super-admin")) {
    allowedRoles = ["SUPER_ADMIN"];
  } else if (pathname.startsWith("/admin")) {
    allowedRoles = ["SCHOOL_ADMIN", "SUPER_ADMIN"];
  } else if (pathname.startsWith("/teacher")) {
    allowedRoles = ["TEACHER"];
  } else if (pathname.startsWith("/student")) {
    allowedRoles = ["STUDENT"];
  } else if (pathname.startsWith("/parent")) {
    allowedRoles = ["PARENT"];
  }

  // If this path requires RBAC authorization
  if (allowedRoles) {
    // Unauthenticated: redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role mismatch: prevent cross-role access, redirect to legitimate home portal
    if (!allowedRoles.includes(user.role)) {
      const userHome = ROLE_DASHBOARDS[user.role] || "/login";
      return NextResponse.redirect(new URL(userHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/login",
  ],
};
