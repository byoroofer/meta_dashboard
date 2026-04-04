"use client";

import { Suspense } from "react";
import { AlertTriangle, Bell, CircleHelp, PanelsTopLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { AccountSwitcher } from "@/components/app-shell/account-switcher";
import { LogoutButton } from "@/components/app-shell/logout-button";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageTitles } from "@/lib/navigation";
import type { DashboardScopeOptions } from "@/lib/repositories/dashboard-repository";
import type { AppUser } from "@/types/domain";

function resolveTitle(pathname: string) {
  const sortedPaths = Object.keys(pageTitles).sort((left, right) => right.length - left.length);
  const match = sortedPaths.find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? pageTitles[match] : "Meta Dashboard";
}

export function AppHeader({
  user,
  requiresMfaEnrollment,
  scopeOptions
}: {
  user: AppUser;
  requiresMfaEnrollment: boolean;
  scopeOptions: DashboardScopeOptions;
}) {
  const pathname = usePathname();

  return (
    <header className="space-y-2.5">
      {requiresMfaEnrollment ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          MFA enrollment is still a placeholder. Keep security hardening open before production cutover.
        </div>
      ) : null}

      <div className="app-shell-panel rounded-3xl border border-[var(--border)] bg-white px-5 py-3.5">
        <div className="flex items-center gap-4">
          {/* Title */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-[var(--muted-soft)]">Meta Dashboard</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-[-0.035em] text-slate-950">
              {resolveTitle(pathname)}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative hidden xl:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-soft)]" />
              <Input
                className="h-9 w-[260px] pl-9 text-xs"
                placeholder="Search inbox, leads, contacts…"
              />
            </div>

            <Button variant="secondary" size="sm" className="hidden gap-1.5 lg:inline-flex">
              <PanelsTopLeft className="h-3.5 w-3.5 text-[var(--accent)]" />
              Portal
            </Button>

            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-4 w-4 text-slate-500" />
            </Button>

            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <CircleHelp className="h-4 w-4 text-slate-500" />
            </Button>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-slate-50 px-3 py-1.5">
              <Avatar name={user.fullName} className="h-7 w-7 text-[9px]" />
              <div className="hidden min-w-0 lg:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-950">{user.fullName}</p>
                <p className="max-w-[120px] truncate text-[10px] text-[var(--muted)]">{user.email}</p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>

        {/* Scope switcher */}
        <div className="mt-3">
          <Suspense
            fallback={<div className="h-[52px] rounded-xl border border-[var(--border)] bg-slate-50/60 animate-pulse" />}
          >
            <AccountSwitcher options={scopeOptions} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
