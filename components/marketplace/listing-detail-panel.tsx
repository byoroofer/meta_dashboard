"use client";

import { ExternalLink, LoaderCircle, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { withBasePath } from "@/lib/config/base-path";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { MarketplaceListingDetail, MarketplaceOperatorStatus } from "@/types/marketplace";

const operatorStatuses: MarketplaceOperatorStatus[] = ["new", "watched", "ignored", "contacted", "purchased"];

export function ListingDetailPanel({
  detail,
  compact = false,
  onUpdated
}: {
  detail: MarketplaceListingDetail;
  compact?: boolean;
  onUpdated?: (next: MarketplaceListingDetail) => void;
}) {
  const [operatorStatus, setOperatorStatus] = useState<MarketplaceOperatorStatus>(detail.result.operatorStatus);
  const [manualNotes, setManualNotes] = useState(detail.result.manualNotes);
  const [isSaving, setIsSaving] = useState(false);

  async function onSave() {
    setIsSaving(true);

    try {
      const response = await fetch(withBasePath(`/api/marketplace-deals/listings/${detail.result.listingId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorStatus, manualNotes })
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "Unable to update listing status.");
      }

      const updatedDetail: MarketplaceListingDetail = {
        ...detail,
        result: {
          ...detail.result,
          operatorStatus,
          manualNotes
        }
      };
      onUpdated?.(updatedDetail);
      toast.success("Listing status saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save listing status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{detail.result.title}</CardTitle>
              <CardDescription className="mt-2">
                {detail.result.source.replaceAll("_", " ")} · {detail.result.location} · {detail.result.postedAt ? formatDateTime(detail.result.postedAt) : "posted time unknown"}
              </CardDescription>
            </div>
            <Badge variant={detail.result.analysis.dealScore >= 80 ? "success" : detail.result.analysis.dealScore >= 60 ? "info" : "warning"}>
              Score {detail.result.analysis.dealScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
            <Metric label="Listed" value={formatCurrency(detail.result.listedPrice, detail.result.currency)} />
            <Metric label="Fair value" value={formatCurrency(detail.result.analysis.fairValueMid, detail.result.currency)} />
            <Metric label="Upside" value={formatCurrency(detail.result.analysis.priceDeltaAmount, detail.result.currency)} />
            <Metric label="Confidence" value={`${Math.round(detail.result.analysis.confidence * 100)}%`} />
          </div>

          <div className="flex flex-wrap gap-2">
            {detail.result.analysis.riskFlags.map((flag) => (
              <Badge key={flag.code} variant={flag.severity === "high" ? "danger" : flag.severity === "medium" ? "warning" : "default"}>
                {flag.label}
              </Badge>
            ))}
            {!detail.result.analysis.riskFlags.length ? <Badge variant="success">No major risk flags</Badge> : null}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">AI reasoning</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{detail.result.analysis.reasoning}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.result.imageUrls.slice(0, compact ? 2 : 4).map((imageUrl) => (
                  <div key={imageUrl} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={detail.result.title} className="h-48 w-full object-cover" />
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{detail.result.description || "No seller description available."}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Parsed attributes</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.entries(detail.result.analysis.parsedAttributes).map(([key, value]) => (
                    <div key={key} className="rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">{key}</p>
                      <p className="mt-1 text-sm text-slate-800">{Array.isArray(value) ? value.join(", ") : String(value ?? "n/a")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Deal formula</p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <Breakdown label="Discount vs fair value" value={detail.result.analysis.scoreBreakdown.discountScore} />
                  <Breakdown label="Comparable match strength" value={detail.result.analysis.scoreBreakdown.compScore} />
                  <Breakdown label="Condition confidence" value={detail.result.analysis.scoreBreakdown.conditionScore} />
                  <Breakdown label="Resale margin" value={detail.result.analysis.scoreBreakdown.marginScore} />
                  <Breakdown label="Freshness" value={detail.result.analysis.scoreBreakdown.freshnessScore} />
                  <Breakdown label="Risk penalty" value={-detail.result.analysis.scoreBreakdown.riskPenalty} tone="negative" />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Comparable listings used</p>
                  <span className="text-xs text-[var(--muted)]">{detail.result.comps.length} comps</span>
                </div>
                <div className="mt-3 space-y-3">
                  {detail.result.comps.map((comp) => (
                    <div key={`${comp.compSource}-${comp.compSourceListingId}`} className="rounded-xl border border-[var(--border)] bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{comp.compTitle}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {comp.compSource.replaceAll("_", " ")} · {comp.compLocation}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(comp.compPrice, comp.compCurrency)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={comp.compType === "exact" ? "success" : comp.compType === "near" ? "info" : "default"}>{comp.compType}</Badge>
                        <Badge variant="default">{Math.round(comp.similarityScore * 100)}% match</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{comp.matchReasons.join(", ") || "Category-level comparable."}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Operator actions</p>
                  <a
                    href={detail.result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]"
                  >
                    Open source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                    <select
                      value={operatorStatus}
                      onChange={(event) => setOperatorStatus(event.target.value as MarketplaceOperatorStatus)}
                      className="h-10 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-slate-900 outline-none"
                    >
                      {operatorStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Manual notes</label>
                    <Textarea value={manualNotes} onChange={(event) => setManualNotes(event.target.value)} placeholder="Add notes about seller response, pickup plan, damage checks, or negotiation." />
                  </div>
                  <Button onClick={onSave} disabled={isSaving}>
                    {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save operator state
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {detail.recentScans.length ? (
            <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Recent scan history for this listing</p>
              <div className="mt-3 grid gap-2">
                {detail.recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{scan.queryLabel}</p>
                      <p className="text-xs text-[var(--muted)]">{formatDateTime(scan.startedAt)}</p>
                    </div>
                    <Input readOnly value={`Score snapshot ${detail.result.analysis.dealScore}`} className="h-8 max-w-[160px] text-xs" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Breakdown({ label, value, tone = "positive" }: { label: string; value: number; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={tone === "negative" ? "font-semibold text-rose-700" : "font-semibold text-slate-900"}>
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
}
