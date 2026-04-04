import { redirect } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession, isAdminPasswordConfigured } from "@/lib/auth/session";
import { withBasePath } from "@/lib/config/base-path";

function resolveErrorLabel(error?: string) {
  if (error === "invalid-password") {
    return "Password is incorrect.";
  }

  if (error === "not-configured") {
    return "Dashboard password is not configured on this environment.";
  }

  return null;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();

  if (session) {
    redirect(withBasePath("/overview") as never);
  }

  const params = await searchParams;
  const errorValue = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorLabel = resolveErrorLabel(errorValue);
  const configured = isAdminPasswordConfigured();

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
              Protected with a simple password gate before the richer auth stack is finalized.
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
            <CardDescription>Enter the admin password to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {errorLabel ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{errorLabel}</div>
            ) : null}
            {!configured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                `DASHBOARD_ADMIN_PASSWORD` is not configured for this environment yet.
              </div>
            ) : null}
            <LoginForm disabled={!configured} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
