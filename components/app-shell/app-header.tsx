"use client";

import { Suspense } from "react";
import { AlertTriangle, CircleHelp, PanelsTopLeft, Search } from "lucide-react";
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
    <header className="space-y-3">
      {requiresMfaEnrollment ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          MFA enrollment is still a placeholder. Keep security hardening open before production cutover.
        </div>
      ) : null}
      <div className="app-shell-panel flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-white px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Meta Dashboard</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-slate-950">{resolveTitle(pathname)}</h1>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)]" />
              <Input className="pl-10" placeholder="Search inbox, leads, contacts, targets, commands" />
            </div>
            <Button variant="secondary" className="justify-start bg-slate-50 text-slate-800">
              <PanelsTopLeft className="mr-2 h-4 w-4 text-[var(--accent)]" />
              Portal actions
            </Button>
            <Button variant="outline">
              <CircleHelp className="mr-2 h-4 w-4" />
              Help
            </Button>
            <LogoutButton />
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-slate-50 px-3 py-2">
              <Avatar name={user.fullName} className="h-9 w-9 text-[10px]" />
              <div>
                <p className="text-sm text-slate-950">{user.fullName}</p>
                <p className="text-xs text-[var(--muted)]">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
        <Suspense fallback={<div className="h-[86px] rounded-2xl border border-[var(--border)] bg-slate-50/60" />}>
          <AccountSwitcher options={scopeOptions} />
        </Suspense>
      </div>
    </header>
  );
}
