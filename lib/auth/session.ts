import { cache } from "react";

import { env } from "@/lib/config/env";
import type { AppUser } from "@/types/domain";

export interface AppSession {
  user: AppUser;
  requiresMfaEnrollment: boolean;
}

export const getSession = cache(async (): Promise<AppSession> => {
  return {
    user: {
      id: "usr_admin_demo",
      email: env.DEMO_USER_EMAIL,
      fullName: "Morgan Lee",
      role: "admin",
      lastLoginAt: "2026-03-30T09:12:00.000Z"
    },
    requiresMfaEnrollment: true
  };
});

export async function requireAdminSession() {
  const session = await getSession();

  if (session.user.role !== "admin") {
    throw new Error("Admin session required.");
  }

  return session;
}
