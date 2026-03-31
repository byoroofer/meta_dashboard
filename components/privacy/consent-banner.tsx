"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  defaultCollectionFriendlyPreferences,
  essentialsOnlyPreferences,
  type ConsentPreferences
} from "@/lib/privacy/consent";

interface ConsentBannerProps {
  open: boolean;
  policyVersion: string;
  privacyPolicyPath: string;
  initialPreferences?: ConsentPreferences;
  onAcceptAll: () => void | Promise<void>;
  onEssentialsOnly: () => void | Promise<void>;
  onSavePreferences: (preferences: ConsentPreferences) => void | Promise<void>;
  onClose: () => void;
}

export function ConsentBanner({
  open,
  policyVersion,
  privacyPolicyPath,
  initialPreferences,
  onAcceptAll,
  onEssentialsOnly,
  onSavePreferences,
  onClose
}: ConsentBannerProps) {
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(
    initialPreferences ?? defaultCollectionFriendlyPreferences()
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[rgba(255,255,255,0.98)] shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="border-b border-[var(--border)] p-6 lg:border-b-0 lg:border-r lg:p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Cookie choices
              <span className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] text-[var(--accent-strong)]">
                Policy {policyVersion}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              We use essential cookies by default and would like permission to use analytics and marketing technologies.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              If you allow analytics and marketing, we may measure visits, page usage, campaign performance, and ad-response data such as UTM values,
              <span className="font-[var(--font-mono)]"> fbclid</span>,
              <span className="font-[var(--font-mono)]"> _fbc</span>, and
              <span className="font-[var(--font-mono)]"> _fbp</span> when they are present. Essential storage keeps consent and session preferences working.
              Review the <a className="font-semibold text-[var(--accent-strong)] underline-offset-4 hover:underline" href={privacyPolicyPath}>privacy notice</a> for categories, retention, and consumer rights.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={onAcceptAll}>Accept Analytics + Marketing</Button>
              <Button variant="secondary" onClick={onEssentialsOnly}>Essentials Only</Button>
              <Button variant="ghost" onClick={() => setShowPreferences((value) => !value)}>
                {showPreferences ? "Hide Preferences" : "Customize"}
              </Button>
            </div>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(231,240,255,0.56),rgba(255,255,255,0.95))] p-6 lg:p-7">
            <div className="rounded-2xl border border-[var(--border)] bg-white/90 p-4">
              <p className="text-sm font-semibold text-slate-950">What stays on even if you decline</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Essential cookies keep your consent choice, a first-party visitor ID, and a session token so the site can remember your settings and operate consistently.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white/90 p-4">
              <p className="text-sm font-semibold text-slate-950">What turns on if you accept</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Analytics and marketing enable page analytics, campaign attribution, ad-performance measurement, and remarketing-oriented event logging.
              </p>
            </div>
          </div>
        </div>

        {showPreferences ? (
          <div className="border-t border-[var(--border)] bg-slate-50/90 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Necessary</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Required for consent storage, visitor/session continuity, and core site behavior.</p>
                  </div>
                  <input checked disabled type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                </div>
              </label>

              <label className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Analytics</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Understand content performance, landing-page quality, and session behavior.</p>
                  </div>
                  <input
                    checked={preferences.analytics}
                    onChange={(event) => setPreferences((current) => ({ ...current, analytics: event.target.checked }))}
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  />
                </div>
              </label>

              <label className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Marketing</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Enable attribution, audience building, and ad-response measurement for company campaigns.</p>
                  </div>
                  <input
                    checked={preferences.marketing}
                    onChange={(event) => setPreferences((current) => ({ ...current, marketing: event.target.checked }))}
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  />
                </div>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => onSavePreferences(preferences)}>Save Preferences</Button>
              <Button variant="secondary" onClick={() => setPreferences(essentialsOnlyPreferences())}>Set Essentials Only</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPreferences(false);
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
