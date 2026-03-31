import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FilterBar({
  searchPlaceholder,
  filters
}: {
  searchPlaceholder: string;
  filters: string[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-soft)]" />
        <Input className="pl-10" placeholder={searchPlaceholder} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Button key={filter} variant="secondary" size="sm" className="bg-slate-50">
            {filter}
          </Button>
        ))}
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
    </div>
  );
}
