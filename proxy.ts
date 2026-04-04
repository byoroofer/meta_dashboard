import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "meta_dashboard_admin_session";
const BASE_PATH = "/meta-dashboard";

async function buildSessionValue(password: string, appUrl: string) {
  const payload = `${password}|${appUrl}|meta-dashboard`;
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/meta/webhooks" ||
    pathname.startsWith("/api/tracking/")
  );
}

function isProtectedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/overview") ||
    pathname.startsWith("/ads") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/connected-accounts") ||
    pathname.startsWith("/contacts") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/")
  );
}

function normalizePath(pathname: string) {
  if (pathname === BASE_PATH) {
    return "/";
  }

  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

export async function proxy(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);

  if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.DASHBOARD_ADMIN_PASSWORD ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!password) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Dashboard password is not configured." }, { status: 503 });
    }

    return NextResponse.redirect(new URL(`${BASE_PATH}/login?error=not-configured`, request.url));
  }

  const expected = await buildSessionValue(password, appUrl);
  const actual = request.cookies.get(SESSION_COOKIE)?.value;

  if (actual === expected) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.redirect(new URL(`${BASE_PATH}/login`, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
