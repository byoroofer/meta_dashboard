import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
