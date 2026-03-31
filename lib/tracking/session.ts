import {
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_ID_COOKIE_NAME,
  SESSION_ID_STORAGE_KEY,
  VISITOR_COOKIE_MAX_AGE_SECONDS,
  VISITOR_ID_COOKIE_NAME,
  VISITOR_ID_STORAGE_KEY,
  type ConsentPreferences,
  type ConsentState,
  encodeConsentState,
  safeParseConsentState
} from "@/lib/privacy/consent";

function createTrackingId(prefix: string) {
  const randomValue = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replaceAll("-", "")
    : `${Date.now()}${Math.random().toString(16).slice(2)}`;

  return `${prefix}_${randomValue}`;
}

export function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

export function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function getOrCreateVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY) ?? readCookie(VISITOR_ID_COOKIE_NAME);

  if (stored) {
    writeCookie(VISITOR_ID_COOKIE_NAME, stored, VISITOR_COOKIE_MAX_AGE_SECONDS);
    return stored;
  }

  const created = createTrackingId("vid");
  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, created);
  writeCookie(VISITOR_ID_COOKIE_NAME, created, VISITOR_COOKIE_MAX_AGE_SECONDS);
  return created;
}

export function getOrCreateSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY) ?? readCookie(SESSION_ID_COOKIE_NAME);

  if (stored) {
    window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, stored);
    writeCookie(SESSION_ID_COOKIE_NAME, stored, SESSION_COOKIE_MAX_AGE_SECONDS);
    return stored;
  }

  const created = createTrackingId("sid");
  window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, created);
  writeCookie(SESSION_ID_COOKIE_NAME, created, SESSION_COOKIE_MAX_AGE_SECONDS);
  return created;
}

export function saveConsentState(state: ConsentState) {
  if (typeof window === "undefined") {
    return;
  }

  const encoded = encodeConsentState(state);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, encoded);
  writeCookie(CONSENT_COOKIE_NAME, encoded, VISITOR_COOKIE_MAX_AGE_SECONDS);
}

export function readStoredConsentState() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? readCookie(CONSENT_COOKIE_NAME);
  return safeParseConsentState(stored);
}

export function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getSessionPayload(preferences: ConsentPreferences) {
  const currentUrl = new URL(window.location.href);
  const referrer = document.referrer || "";
  const trackingEnabled = preferences.analytics || preferences.marketing;

  return {
    anonymousId: getOrCreateVisitorId(),
    sessionToken: getOrCreateSessionId(),
    page: {
      url: currentUrl.toString(),
      path: currentUrl.pathname,
      referrer
    },
    device: trackingEnabled
      ? {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          language: navigator.language,
          timezone: getTimezone(),
          userAgent: navigator.userAgent
        }
      : null,
    attribution: trackingEnabled
      ? {
          source: currentUrl.searchParams.get("utm_source"),
          medium: currentUrl.searchParams.get("utm_medium"),
          campaign: currentUrl.searchParams.get("utm_campaign"),
          term: currentUrl.searchParams.get("utm_term"),
          content: currentUrl.searchParams.get("utm_content"),
          fbclid: currentUrl.searchParams.get("fbclid"),
          gclid: currentUrl.searchParams.get("gclid"),
          msclkid: currentUrl.searchParams.get("msclkid"),
          ttclid: currentUrl.searchParams.get("ttclid"),
          fbc: readCookie("_fbc"),
          fbp: readCookie("_fbp")
        }
      : null,
    consent: preferences
  };
}

