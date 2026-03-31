import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2 text-sm text-slate-900 outline-none placeholder:text-[var(--muted-soft)] focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent)]/10",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
