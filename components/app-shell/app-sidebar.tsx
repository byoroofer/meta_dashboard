"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, ShieldCheck } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/domain";

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();

  return (
    <aside className="app-shell-panel flex flex-col rounded-[28px] border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Meta Dashboard</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Business ops console</h2>
        </div>
        <PanelLeftClose className="h-5 w-5 text-[var(--muted)]" />
      </div>

      <nav className="mt-8 space-y-2">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                isActive ? "bg-white text-slate-950" : "text-[var(--muted)] hover:bg-white/6 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Preservation path</p>
        </div>
        <ol className="mt-3 space-y-2 text-sm text-cyan-50/90">
          <li>1. Raw webhook stored first</li>
          <li>2. Normalize operational tables</li>
          <li>3. Hash canonical archive snapshot</li>
        </ol>
      </div>

      <div className="mt-auto space-y-3 pt-8">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Security shortcuts</p>
          <div className="mt-3 space-y-2">
            {secondaryNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm text-white/90 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <Avatar name={user.fullName} />
          <div>
            <p className="text-sm font-medium text-white">{user.fullName}</p>
            <p className="text-xs text-[var(--muted)]">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
