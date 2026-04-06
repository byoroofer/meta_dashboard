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
  META_MESSAGING_PAGE_TOKEN_MAP: z.string().default(""),
  META_MESSAGING_PAGE_ID: z.string().default(""),
  META_MESSAGING_PAGE_ACCESS_TOKEN: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
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
  META_MESSAGING_PAGE_TOKEN_MAP: process.env.META_MESSAGING_PAGE_TOKEN_MAP,
  META_MESSAGING_PAGE_ID: process.env.META_MESSAGING_PAGE_ID,
  META_MESSAGING_PAGE_ACCESS_TOKEN: process.env.META_MESSAGING_PAGE_ACCESS_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
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

function parseMessagingPageTokenMap(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return {};
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([pageId, token]) =>
        typeof pageId === "string" && typeof token === "string" && pageId && token
          ? [[pageId, token]]
          : []
      )
    );
  } catch {
    const normalized = trimmed.replace(/^\{/, "").replace(/\}$/, "");

    return Object.fromEntries(
      normalized
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .flatMap((entry) => {
          const separatorIndex = entry.indexOf(":");

          if (separatorIndex <= 0) {
            return [];
          }

          const pageId = entry.slice(0, separatorIndex).trim().replace(/^"|"$/g, "");
          const token = entry.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

          return pageId && token ? [[pageId, token]] : [];
        })
    );
  }
}

const configuredMessagingPageTokenMap = parseMessagingPageTokenMap(env.META_MESSAGING_PAGE_TOKEN_MAP);

if (env.META_MESSAGING_PAGE_ID && env.META_MESSAGING_PAGE_ACCESS_TOKEN) {
  configuredMessagingPageTokenMap[env.META_MESSAGING_PAGE_ID] = env.META_MESSAGING_PAGE_ACCESS_TOKEN;
}

export function getMetaMessagingPageToken(pageId: string) {
  return configuredMessagingPageTokenMap[pageId] ?? "";
}

export function getMetaMessagingPageOverridePageIds() {
  return Object.keys(configuredMessagingPageTokenMap);
}

export function getMetaMessagingPageOverrideCount() {
  return getMetaMessagingPageOverridePageIds().length;
}

/** Full status of every runtime config gate, safe to pass to server components. No secret values included. */
export function getConfigStatus() {
  return {
    supabasePublic: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    supabaseAdmin: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    metaAppCredentials: Boolean(env.META_APP_ID && env.META_APP_SECRET),
    metaWebhook: Boolean(env.META_WEBHOOK_VERIFY_TOKEN && env.META_WEBHOOK_APP_SECRET),
    metaSystemUser: Boolean(env.META_SYSTEM_USER_ACCESS_TOKEN),
    metaMessagingPageOverride: getMetaMessagingPageOverrideCount() > 0,
    metaMessagingPageOverrideCount: getMetaMessagingPageOverrideCount(),
    openAiPricing: Boolean(env.OPENAI_API_KEY),
    encryptionKey: Boolean(env.ENCRYPTION_KEY),
    adminPassword: Boolean(env.DASHBOARD_ADMIN_PASSWORD)
  };
}
