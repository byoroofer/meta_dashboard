import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="app-shell-panel data-grid rounded-[32px] border border-[var(--border)] p-10">
          <div className="mb-10 flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            Meta Dashboard
          </div>
          <div className="max-w-2xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Private admin workspace</p>
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-950">
              Run messages, lead routing, websites, ads, and archive integrity from one business workspace.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
              Designed around supported Meta business assets only, with raw webhook preservation, normalized operations data, and server-first security boundaries.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              "Preserve every retrievable business message",
              "Auto-respond on supported Pages and professional accounts",
              "Feed normalized leads into website-owned intake paths"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)] shadow-[var(--shadow-soft)]">
                {item}
              </div>
            ))}
          </div>
        </section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-5 w-5 text-[var(--accent)]" />
              Admin access
            </CardTitle>
            <CardDescription>Authentication is scaffolded for a server-side admin gate. Supabase Auth or SSO can plug in next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              MFA enrollment, role enforcement, and session hardening are represented in the architecture but not activated until credentials are connected.
            </div>
            <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-slate-50 p-4 font-[var(--font-mono)] text-sm text-[var(--muted)]">
              <p>Route: /login</p>
              <p>Guard target: dashboard routes</p>
              <p>Session mode: scaffolded admin placeholder</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/overview">
                Enter dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
