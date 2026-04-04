import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { env } from "@/lib/config/env";
import { withBasePath } from "@/lib/config/base-path";
import type { AppUser } from "@/types/domain";

export interface AppSession {
  user: AppUser;
  requiresMfaEnrollment: boolean;
}

export const ADMIN_SESSION_COOKIE = "meta_dashboard_admin_session";

function buildSessionValue(password: string) {
  return createHash("sha256").update(`${password}|${env.NEXT_PUBLIC_APP_URL}|meta-dashboard`).digest("hex");
}

export function isAdminPasswordConfigured() {
  return Boolean(env.DASHBOARD_ADMIN_PASSWORD);
}

export function validateAdminPassword(password: string) {
  if (!isAdminPasswordConfigured()) {
    return false;
  }

  const expected = Buffer.from(env.DASHBOARD_ADMIN_PASSWORD);
  const actual = Buffer.from(password);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function getAdminSessionCookieValue() {
  if (!isAdminPasswordConfigured()) {
    return "";
  }

  return buildSessionValue(env.DASHBOARD_ADMIN_PASSWORD);
}

export async function setAdminSessionCookie() {
  const store = await cookies();

  store.set({
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionCookieValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: env.NEXT_PUBLIC_APP_URL.startsWith("https://"),
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}

export const getSession = cache(async (): Promise<AppSession | null> => {
  if (!isAdminPasswordConfigured()) {
    return null;
  }

  const store = await cookies();
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  const expected = Buffer.from(getAdminSessionCookieValue());
  const actual = Buffer.from(cookieValue);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  return {
    user: {
      id: "usr_admin_password",
      email: env.DEMO_USER_EMAIL,
      fullName: "Admin",
      role: "admin",
      lastLoginAt: new Date().toISOString()
    },
    requiresMfaEnrollment: false
  };
});

export async function requireAdminSession() {
  const session = await getSession();

  if (!session) {
    redirect(withBasePath("/login") as never);
  }

  if (session.user.role !== "admin") {
    throw new Error("Admin session required.");
  }

  return session;
}
