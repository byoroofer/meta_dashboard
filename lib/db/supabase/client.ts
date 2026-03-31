import { createBrowserClient } from "@supabase/ssr";

import { env, hasSupabaseConfig } from "@/lib/config/env";

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig) {
    return null;
  }

  return createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
