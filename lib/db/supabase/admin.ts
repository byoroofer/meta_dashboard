import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseAdminConfig } from "@/lib/config/env";

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig) {
    return null;
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
