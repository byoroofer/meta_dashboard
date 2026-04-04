import { NextResponse } from "next/server";

import { clearAdminSessionCookie, isAdminPasswordConfigured, setAdminSessionCookie, validateAdminPassword } from "@/lib/auth/session";
import { withBasePath } from "@/lib/config/base-path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const origin = new URL(request.url).origin;

  await clearAdminSessionCookie();

  if (!isAdminPasswordConfigured()) {
    return NextResponse.redirect(new URL(`${withBasePath("/login")}?error=not-configured`, origin), { status: 303 });
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.redirect(new URL(`${withBasePath("/login")}?error=invalid-password`, origin), { status: 303 });
  }

  await setAdminSessionCookie();
  return NextResponse.redirect(new URL(withBasePath("/overview"), origin), { status: 303 });
}
