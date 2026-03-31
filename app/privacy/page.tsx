import Link from "next/link";

import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "Essential storage",
    body: "Used to remember consent choices and keep a first-party visitor identifier and session token working across page loads."
  },
  {
    title: "Analytics",
    body: "If enabled, we measure visits, landing-page performance, route usage, and form engagement to improve the site and reporting."
  },
  {
    title: "Marketing",
    body: "If enabled, we may retain campaign and ad-response data such as UTM parameters, fbclid, _fbc, and _fbp when those values are present and lawfully obtained."
  },
  {
    title: "Texas privacy rights",
    body: "Texas residents may have rights to confirm, access, correct, delete, and obtain a copy of personal data, and to opt out of targeted advertising or certain profiling uses, subject to the Texas Data Privacy and Security Act and applicable exemptions."
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-6 md:p-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Privacy notice</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">First-party data and consent notice</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          This page explains the categories used by the site banner and the operational data model behind visitor, session, attribution, consent, and form-submission records.
          It should be reviewed by counsel before production launch.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Contact and retention notes</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Submitted lead information, attribution data, and internal CRM notes may be retained in company systems for follow-up, reporting, fraud review, and operational recordkeeping.
            Sensitive-data use and any production rights-request workflow should be finalized with counsel and operations before launch.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">Back To Login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/overview">Go To Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
