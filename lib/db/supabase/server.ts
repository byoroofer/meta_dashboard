import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env, hasSupabaseConfig } from "@/lib/config/env";

export function getSupabaseServerClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  const cookieStorePromise = cookies();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        const cookieStore = await cookieStorePromise;
        return cookieStore.get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        const cookieStore = await cookieStorePromise;
        cookieStore.set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        const cookieStore = await cookieStorePromise;
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
