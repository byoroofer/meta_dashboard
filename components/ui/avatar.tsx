import type { HTMLAttributes } from "react";

import { cn, initials } from "@/lib/utils";

export function Avatar({ name, className, ...props }: HTMLAttributes<HTMLDivElement> & { name: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-strong)]",
        className
      )}
      {...props}
    >
      {initials(name)}
    </div>
  );
}
