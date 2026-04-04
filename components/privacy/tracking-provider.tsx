"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ConsentBanner } from "@/components/privacy/consent-banner";
import { Button } from "@/components/ui/button";
import {
  consentActionSchema,
  defaultCollectionFriendlyPreferences,
  type ConsentPreferences,
  type ConsentState,
  essentialsOnlyPreferences
} from "@/lib/privacy/consent";
import { withBasePath } from "@/lib/config/base-path";
import { getOrCreateSessionId, getOrCreateVisitorId, getSessionPayload, readStoredConsentState, saveConsentState } from "@/lib/tracking/session";

const DASHBOARD_PREFIXES = [
  "/overview",
  "/inbox",
  "/leads",
  "/contacts",
  "/ads",
  "/connected-accounts",
  "/archive",
  "/settings"
];

function isDashboardPath(pathname: string) {
  return DASHBOARD_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }
}

export function TrackingProvider({
  policyVersion,
  privacyPolicyPath
}: {
  policyVersion: string;
  privacyPolicyPath: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const initializedRef = useRef(false);
  const syncingRef = useRef(false);

  const hidden = isDashboardPath(pathname);

  useEffect(() => {
    if (hidden) {
      setBannerOpen(false);
      return;
    }

    const storedConsent = readStoredConsentState();
    setConsentState(storedConsent);
    setBannerOpen(!storedConsent);
    getOrCreateVisitorId();
    getOrCreateSessionId();
    initializedRef.current = true;
  }, [hidden]);

  useEffect(() => {
    if (!initializedRef.current || hidden || !consentState || syncingRef.current) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      syncingRef.current = true;

      try {
        await postJson(withBasePath("/api/tracking/session"), getSessionPayload(consentState.preferences));
      } catch {
        // Keep the banner usable even if the server endpoint is unavailable during local setup.
      } finally {
        if (!cancelled) {
          syncingRef.current = false;
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      syncingRef.current = false;
    };
  }, [consentState, hidden, pathname, searchParams]);

  async function persistDecision(action: "accept_all" | "reject_all" | "save_preferences", preferences: ConsentPreferences) {
    const parsedAction = consentActionSchema.parse(action);
    const nextState: ConsentState = {
      policyVersion,
      consentSource: bannerOpen ? "cookie_banner" : "preference_center",
      consentAction: parsedAction,
      preferences,
      consentedAt: new Date().toISOString()
    };

    saveConsentState(nextState);
    setConsentState(nextState);
    setBannerOpen(false);

    const sessionPayload = getSessionPayload(preferences);

    try {
      await postJson(withBasePath("/api/tracking/session"), sessionPayload);
      await postJson(withBasePath("/api/tracking/consent"), {
        anonymousId: sessionPayload.anonymousId,
        sessionToken: sessionPayload.sessionToken,
        policyVersion,
        consentSource: nextState.consentSource,
        consentAction: parsedAction,
        preferences,
        page: sessionPayload.page
      });
    } catch {
      // Local consent persistence remains available even if server persistence is offline.
    }
  }

  if (hidden) {
    return null;
  }

  return (
    <>
      <ConsentBanner
        key={`${bannerOpen ? "open" : "closed"}:${consentState?.consentedAt ?? "new"}`}
        open={bannerOpen}
        policyVersion={policyVersion}
        privacyPolicyPath={privacyPolicyPath}
        initialPreferences={consentState?.preferences ?? defaultCollectionFriendlyPreferences()}
        onAcceptAll={() => persistDecision("accept_all", defaultCollectionFriendlyPreferences())}
        onEssentialsOnly={() => persistDecision("reject_all", essentialsOnlyPreferences())}
        onSavePreferences={(preferences) => persistDecision("save_preferences", preferences)}
        onClose={() => {
          if (consentState) {
            setBannerOpen(false);
          }
        }}
      />

      {consentState && !bannerOpen ? (
        <div className="fixed bottom-4 left-4 z-40">
          <Button variant="secondary" size="sm" onClick={() => setBannerOpen(true)}>
            Cookie Settings
          </Button>
        </div>
      ) : null}
    </>
  );
}
