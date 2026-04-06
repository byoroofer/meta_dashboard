"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Circle } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { primaryNavigation, secondaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/domain";

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();

  return (
    <aside className="app-shell-panel flex flex-col rounded-3xl border border-[var(--border)] bg-white p-4">
      {/* Brand header */}
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--accent-soft)] p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Meta Dashboard</p>
          <h2 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-slate-950">Business Center</h2>
          <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
            Operational portal for Meta assets, websites, databases, and internal systems.
          </p>
        </div>
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
      </div>

      {/* Primary nav */}
      <nav className="mt-4 space-y-0.5">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "app-nav-active font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-slate-400")} />
                {item.label}
              </span>
              {isActive ? (
                <Circle className="h-1.5 w-1.5 fill-[var(--accent)] text-[var(--accent)]" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Secondary nav */}
      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-slate-50/80 p-3.5">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-soft)]">Quick access</p>
        <div className="space-y-1">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "text-[var(--accent-strong)]"
                  : "text-slate-600 hover:text-[var(--accent-strong)]"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* User card */}
      <div className="mt-auto pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-3.5 py-3 shadow-[var(--shadow-soft)]">
          <Avatar name={user.fullName} className="h-9 w-9 shrink-0 text-[10px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950">{user.fullName}</p>
            <p className="truncate text-xs text-[var(--muted)]">{user.role}</p>
          </div>
          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 ring-2 ring-emerald-100" title="Active session" />
        </div>
      </div>
    </aside>
  );
}
