import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "@/lib/auth/session";
import { withBasePath } from "@/lib/config/base-path";

export async function POST(request: Request) {
  await clearAdminSessionCookie();
  return NextResponse.redirect(new URL(withBasePath("/login"), request.url), { status: 303 });
}
