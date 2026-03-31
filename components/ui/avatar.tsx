import type { HTMLAttributes } from "react";

import { cn, initials } from "@/lib/utils";

export function Avatar({ name, className, ...props }: HTMLAttributes<HTMLDivElement> & { name: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-xs font-semibold text-slate-950",
        className
      )}
      {...props}
    >
      {initials(name)}
    </div>
  );
}
