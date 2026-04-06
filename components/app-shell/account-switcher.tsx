"use client";

import { Building2, ChevronDown, Megaphone, RotateCcw, SquareStack } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardScopeOptions } from "@/lib/repositories/dashboard-repository";

export function AccountSwitcher({ options }: { options: DashboardScopeOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedBusinessId = searchParams.get("businessId") ?? "";
  const selectedAssetId = searchParams.get("assetId") ?? "";
  const selectedAdAccountId = searchParams.get("adAccountId") ?? "";
  const isScopedToAll = !selectedBusinessId && !selectedAssetId && !selectedAdAccountId;

  const assets = selectedBusinessId
    ? options.assets.filter((asset) => asset.businessId === selectedBusinessId)
    : options.assets;

  const adAccounts = selectedBusinessId
    ? options.adAccounts.filter((account) => !account.businessIds?.length || account.businessIds.includes(selectedBusinessId))
    : options.adAccounts;

  const selectedBusiness = options.businesses.find((business) => business.id === selectedBusinessId);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId);
  const selectedAdAccount = adAccounts.find((account) => account.id === selectedAdAccountId);

  function pushScope(nextBusinessId?: string, nextAssetId?: string, nextAdAccountId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextBusinessId) params.set("businessId", nextBusinessId);
    else params.delete("businessId");
    if (nextAssetId) params.set("assetId", nextAssetId);
    else params.delete("assetId");
    if (nextAdAccountId) params.set("adAccountId", nextAdAccountId);
    else params.delete("adAccountId");
    const query = params.toString();
    startTransition(() => router.replace(`${pathname}${query ? `?${query}` : ""}` as never));
  }

  const noData = options.businesses.length === 0 && options.assets.length === 0 && options.adAccounts.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-3 py-2.5 transition-colors",
        noData
          ? "border-amber-200 bg-amber-50/60"
          : isScopedToAll
            ? "border-[var(--border)] bg-slate-50/70"
            : "border-[var(--accent)]/30 bg-[var(--accent-subtle)]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.18em]",
            noData ? "text-amber-700" : isScopedToAll ? "text-[var(--muted-soft)]" : "text-[var(--accent-strong)]"
          )}
        >
          {noData
            ? "No businesses connected - import Meta data to populate"
            : isScopedToAll
              ? "Viewing all accounts"
              : `Scoped: ${[selectedBusiness?.name, selectedAsset?.name, selectedAdAccount?.name].filter(Boolean).join(" / ")}`}
        </p>
        {!isScopedToAll && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => pushScope(undefined, undefined, undefined)}
            className="h-6 px-2 text-[10px] text-[var(--muted)]"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {!noData && (
        <div className="flex flex-wrap gap-2">
          <label className="relative flex min-w-[190px] items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            <select
              className="h-6 w-full bg-transparent text-xs text-slate-900 outline-none"
              disabled={isPending}
              value={selectedBusinessId}
              onChange={(event) => {
                const nextBusinessId = event.target.value || undefined;
                const keepAsset =
                  selectedAssetId &&
                  (!nextBusinessId || options.assets.some((asset) => asset.id === selectedAssetId && asset.businessId === nextBusinessId));
                const currentAdAccount = options.adAccounts.find((account) => account.id === selectedAdAccountId);
                const keepAdAccount =
                  currentAdAccount &&
                  (!nextBusinessId || !currentAdAccount.businessIds?.length || currentAdAccount.businessIds.includes(nextBusinessId));
                pushScope(nextBusinessId, keepAsset ? selectedAssetId : undefined, keepAdAccount ? currentAdAccount.id : undefined);
              }}
            >
              <option value="">All businesses</option>
              {options.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 shrink-0 text-[var(--muted-soft)]" />
          </label>

          <label className="relative flex min-w-[220px] items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
            <SquareStack className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            <select
              className="h-6 w-full bg-transparent text-xs text-slate-900 outline-none"
              disabled={isPending}
              value={selectedAssetId}
              onChange={(event) => pushScope(selectedBusinessId || undefined, event.target.value || undefined, selectedAdAccountId || undefined)}
            >
              <option value="">All assets</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} - {asset.type.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 shrink-0 text-[var(--muted-soft)]" />
          </label>

          <label className="relative flex min-w-[210px] items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
            <Megaphone className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            <select
              className="h-6 w-full bg-transparent text-xs text-slate-900 outline-none"
              disabled={isPending}
              value={selectedAdAccountId}
              onChange={(event) => pushScope(selectedBusinessId || undefined, selectedAssetId || undefined, event.target.value || undefined)}
            >
              <option value="">All ad accounts</option>
              {adAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                  {account.businessNames?.length ? ` - ${account.businessNames.join(", ")}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 shrink-0 text-[var(--muted-soft)]" />
          </label>

          {isPending && (
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
              Refreshing...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
