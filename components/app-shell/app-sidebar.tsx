"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/domain";

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();

  return (
    <aside className="app-shell-panel flex flex-col rounded-3xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/60 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Meta Dashboard</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">Business Center</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Unified operations for messaging, leads, ads, archive, and connected assets.</p>
        </div>
        <Bell className="h-5 w-5 text-[var(--accent-strong)]" />
      </div>

      <nav className="mt-5 space-y-1.5">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "app-nav-active"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className={cn("h-4 w-4", isActive ? "text-[var(--accent-strong)]" : "text-slate-400")} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--accent-strong)]" />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-800">Automation path</p>
        </div>
        <ol className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>1. Capture every raw event.</li>
          <li>2. Auto-respond within supported business channels.</li>
          <li>3. Feed qualified leads into website intake endpoints.</li>
        </ol>
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-2xl border border-[var(--border)] bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Quick access</p>
          <div className="mt-3 space-y-2">
            {secondaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm text-slate-800 hover:text-[var(--accent-strong)]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
          <Avatar name={user.fullName} />
          <div>
            <p className="text-sm font-medium text-slate-950">{user.fullName}</p>
            <p className="text-xs text-[var(--muted)]">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
