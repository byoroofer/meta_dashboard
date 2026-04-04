import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Meta Dashboard"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_PRIVACY_POLICY_VERSION: z.string().default("2026-03-31"),
  NEXT_PUBLIC_PRIVACY_POLICY_PATH: z.string().default("/privacy"),
  SUPABASE_URL: z.string().default(""),
  SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_DB_URL: z.string().default(""),
  META_APP_ID: z.string().default(""),
  META_APP_SECRET: z.string().default(""),
  META_API_VERSION: z.string().default("v22.0"),
  META_WEBHOOK_VERIFY_TOKEN: z.string().default(""),
  META_WEBHOOK_APP_SECRET: z.string().default(""),
  META_SYSTEM_USER_ACCESS_TOKEN: z.string().default(""),
  ENCRYPTION_KEY: z.string().default(""),
  DASHBOARD_ADMIN_PASSWORD: z.string().default(""),
  DEMO_USER_EMAIL: z.string().default("ops@meta-dashboard.internal")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PRIVACY_POLICY_VERSION: process.env.NEXT_PUBLIC_PRIVACY_POLICY_VERSION,
  NEXT_PUBLIC_PRIVACY_POLICY_PATH: process.env.NEXT_PUBLIC_PRIVACY_POLICY_PATH,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
  META_APP_ID: process.env.META_APP_ID,
  META_APP_SECRET: process.env.META_APP_SECRET,
  META_API_VERSION: process.env.META_API_VERSION,
  META_WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN,
  META_WEBHOOK_APP_SECRET: process.env.META_WEBHOOK_APP_SECRET,
  META_SYSTEM_USER_ACCESS_TOKEN: process.env.META_SYSTEM_USER_ACCESS_TOKEN,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  DASHBOARD_ADMIN_PASSWORD: process.env.DASHBOARD_ADMIN_PASSWORD,
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL
});

export const hasSupabaseConfig = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
export const hasSupabaseAdminConfig = Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
export const hasMetaConfig = Boolean(
  env.META_APP_ID &&
    env.META_APP_SECRET &&
    env.META_WEBHOOK_VERIFY_TOKEN &&
    env.META_WEBHOOK_APP_SECRET
);
export const hasMetaSystemUser = Boolean(env.META_SYSTEM_USER_ACCESS_TOKEN);

/** Full status of every runtime config gate, safe to pass to server components. No secret values included. */
export function getConfigStatus() {
  return {
    supabasePublic: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    supabaseAdmin: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    metaAppCredentials: Boolean(env.META_APP_ID && env.META_APP_SECRET),
    metaWebhook: Boolean(env.META_WEBHOOK_VERIFY_TOKEN && env.META_WEBHOOK_APP_SECRET),
    metaSystemUser: Boolean(env.META_SYSTEM_USER_ACCESS_TOKEN),
    encryptionKey: Boolean(env.ENCRYPTION_KEY),
    adminPassword: Boolean(env.DASHBOARD_ADMIN_PASSWORD)
  };
}
