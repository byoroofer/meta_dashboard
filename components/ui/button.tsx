"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-white hover:bg-[var(--accent-strong)] hover:border-[var(--accent-strong)]",
        secondary: "border-[var(--border)] bg-white px-4 py-2.5 text-slate-800 hover:bg-slate-50",
        outline: "border-[var(--border-strong)] bg-transparent px-4 py-2.5 text-slate-700 hover:bg-slate-50",
        ghost: "border-transparent px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      },
      size: {
        default: "h-10",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 px-5 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
