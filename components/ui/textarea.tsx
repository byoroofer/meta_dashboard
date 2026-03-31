import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-[var(--muted-soft)] focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent)]/10",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
