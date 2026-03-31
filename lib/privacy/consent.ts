import { z } from "zod";

export const PRIVACY_POLICY_VERSION_FALLBACK = "2026-03-31";
export const PRIVACY_POLICY_PATH_FALLBACK = "/privacy";
export const CONSENT_COOKIE_NAME = "md_consent";
export const VISITOR_ID_COOKIE_NAME = "md_vid";
export const SESSION_ID_COOKIE_NAME = "md_sid";
export const VISITOR_ID_STORAGE_KEY = "md.visitor.id";
export const SESSION_ID_STORAGE_KEY = "md.session.id";
export const CONSENT_STORAGE_KEY = "md.consent.state";
export const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 30;

export const consentPreferencesSchema = z.object({
  necessary: z.literal(true).default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false)
});

export const consentActionSchema = z.enum([
  "accept_all",
  "reject_all",
  "save_preferences",
  "reopen_preferences"
]);

export const consentSourceSchema = z.enum([
  "cookie_banner",
  "preference_center",
  "form_checkbox",
  "server_default"
]);

export const consentStateSchema = z.object({
  policyVersion: z.string().min(1),
  consentSource: consentSourceSchema,
  consentAction: consentActionSchema,
  preferences: consentPreferencesSchema,
  consentedAt: z.string().min(1)
});

export const consentSubmissionSchema = z.object({
  anonymousId: z.string().min(8),
  sessionToken: z.string().min(8),
  policyVersion: z.string().min(1),
  consentSource: consentSourceSchema,
  consentAction: consentActionSchema,
  preferences: consentPreferencesSchema,
  page: z
    .object({
      url: z.string().url(),
      path: z.string().min(1),
      referrer: z.string().url().or(z.literal("")).default("")
    })
    .optional()
});

export type ConsentPreferences = z.infer<typeof consentPreferencesSchema>;
export type ConsentState = z.infer<typeof consentStateSchema>;
export type ConsentSubmission = z.infer<typeof consentSubmissionSchema>;

export function defaultCollectionFriendlyPreferences(): ConsentPreferences {
  return {
    necessary: true,
    analytics: true,
    marketing: true
  };
}

export function essentialsOnlyPreferences(): ConsentPreferences {
  return {
    necessary: true,
    analytics: false,
    marketing: false
  };
}

export function safeParseConsentState(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    const result = consentStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function encodeConsentState(value: ConsentState) {
  return JSON.stringify(value);
}

export function isTrackingEnabled(preferences: ConsentPreferences) {
  return preferences.analytics || preferences.marketing;
}

export function getClientIpAddress(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip");
}

export function getReferrerDomain(referrer: string | null | undefined) {
  if (!referrer) {
    return null;
  }

  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

export function classifySourceChannel(input: {
  source?: string | null;
  medium?: string | null;
  referrer?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  ttclid?: string | null;
}) {
  const source = (input.source ?? "").toLowerCase();
  const medium = (input.medium ?? "").toLowerCase();
  const referrerDomain = getReferrerDomain(input.referrer)?.toLowerCase() ?? "";

  if (input.fbclid || input.fbc || input.fbp || source.includes("meta") || source.includes("facebook") || source.includes("instagram")) {
    return "paid_social";
  }

  if (input.gclid || input.msclkid || medium.includes("cpc") || medium.includes("ppc") || medium.includes("paid_search")) {
    return "paid_search";
  }

  if (input.ttclid || source.includes("tiktok")) {
    return "paid_social";
  }

  if (medium.includes("email") || source.includes("email")) {
    return "email";
  }

  if (medium.includes("sms") || source.includes("sms")) {
    return "sms";
  }

  if (referrerDomain.includes("google.") || referrerDomain.includes("bing.") || referrerDomain.includes("duckduckgo.")) {
    return "organic_search";
  }

  if (
    referrerDomain.includes("facebook.") ||
    referrerDomain.includes("instagram.") ||
    referrerDomain.includes("tiktok.") ||
    referrerDomain.includes("linkedin.")
  ) {
    return "organic_social";
  }

  if (referrerDomain) {
    return "referral";
  }

  return "direct";
}
