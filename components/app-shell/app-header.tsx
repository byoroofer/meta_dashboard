"use client";

import { AlertTriangle, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { pageTitles } from "@/lib/navigation";
import type { AppUser } from "@/types/domain";

function resolveTitle(pathname: string) {
  const sortedPaths = Object.keys(pageTitles).sort((left, right) => right.length - left.length);
  const match = sortedPaths.find((path) => pathname === path || pathname.startsWith(`${path}/`));

  return match ? pageTitles[match] : "Meta Dashboard";
}

export function AppHeader({ user, requiresMfaEnrollment }: { user: AppUser; requiresMfaEnrollment: boolean }) {
  const pathname = usePathname();

  return (
    <header className="space-y-4">
      {requiresMfaEnrollment ? (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="h-4 w-4" />
          MFA enrollment is scaffolded but not yet enforced. Keep this flagged before production rollout.
        </div>
      ) : null}
      <div className="app-shell-panel flex flex-col gap-4 rounded-[28px] border border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Meta Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">{resolveTitle(pathname)}</h1>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <Input className="pl-10" placeholder="Search conversations, contacts, leads, assets" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <Avatar name={user.fullName} className="h-9 w-9 text-[10px]" />
            <div>
              <p className="text-sm text-white">{user.fullName}</p>
              <p className="text-xs text-[var(--muted)]">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
