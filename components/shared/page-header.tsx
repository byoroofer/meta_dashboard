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
    <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
