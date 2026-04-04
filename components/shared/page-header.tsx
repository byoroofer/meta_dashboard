import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-end">
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-slate-950">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
