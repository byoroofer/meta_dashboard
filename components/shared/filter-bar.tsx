"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FilterBar({
  searchPlaceholder,
  filters
}: {
  searchPlaceholder: string;
  filters: string[];
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-soft)]" />
        <Input className="h-9 pl-9 text-xs" placeholder={searchPlaceholder} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive((prev) => (prev === filter ? null : filter))}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              active === filter
                ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[var(--border)] bg-slate-50 text-slate-600 hover:border-[var(--accent)]/30 hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-strong)]"
            )}
          >
            {filter}
          </button>
        ))}
        <Button variant="outline" size="sm" className="h-8 border-[var(--border)] text-xs">
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </Button>
      </div>
    </div>
  );
}
