"use client";

import { Building2, Megaphone, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { DashboardScopeOptions } from "@/lib/repositories/dashboard-repository";

export function AccountSwitcher({ options }: { options: DashboardScopeOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedBusinessId = searchParams.get("businessId") ?? "";
  const selectedAdAccountId = searchParams.get("adAccountId") ?? "";
  const adAccounts = selectedBusinessId
    ? options.adAccounts.filter((account) => !account.businessIds?.length || account.businessIds.includes(selectedBusinessId))
    : options.adAccounts;

  function pushScope(nextBusinessId?: string, nextAdAccountId?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextBusinessId) params.set("businessId", nextBusinessId);
    else params.delete("businessId");

    if (nextAdAccountId) params.set("adAccountId", nextAdAccountId);
    else params.delete("adAccountId");

    const query = params.toString();
    startTransition(() => router.replace(`${pathname}${query ? `?${query}` : ""}` as never));
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-slate-50/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Live scope</p>
      <div className="flex flex-col gap-2 xl:flex-row">
        <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3">
          <Building2 className="h-4 w-4 text-[var(--accent)]" />
          <select
            className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none"
            disabled={isPending}
            value={selectedBusinessId}
            onChange={(event) => {
              const nextBusinessId = event.target.value || undefined;
              const currentAdAccount = options.adAccounts.find((account) => account.id === selectedAdAccountId);
              const keepAdAccount =
                currentAdAccount &&
                (!nextBusinessId || !currentAdAccount.businessIds?.length || currentAdAccount.businessIds.includes(nextBusinessId));
              pushScope(nextBusinessId, keepAdAccount ? currentAdAccount.id : undefined);
            }}
          >
            <option value="">All businesses</option>
            {options.businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[240px] items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3">
          <Megaphone className="h-4 w-4 text-[var(--accent)]" />
          <select
            className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none"
            disabled={isPending}
            value={selectedAdAccountId}
            onChange={(event) => pushScope(selectedBusinessId || undefined, event.target.value || undefined)}
          >
            <option value="">All ad accounts</option>
            {adAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}{account.businessNames?.length ? ` - ${account.businessNames.join(", ")}` : ""}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" disabled={isPending} onClick={() => pushScope(undefined, undefined)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
