import { BarChart3, CircleDollarSign, MousePointerClick, TrendingUp } from "lucide-react";

import { MetaSyncButton } from "@/components/meta/meta-sync-button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/utils";
import type { Ad, AdAccount, AdInsightDaily, AdSet, Campaign } from "@/types/domain";

export function AdsWorkspace({
  mode,
  accounts,
  campaigns,
  adsets,
  ads,
  insights
}: {
  mode: "overview" | "campaigns" | "adsets" | "ads";
  accounts: AdAccount[];
  campaigns: Campaign[];
  adsets: AdSet[];
  ads: Ad[];
  insights: AdInsightDaily[];
}) {
  const orderedInsights = [...insights].sort((a, b) => a.date.localeCompare(b.date));
  const totalSpend = accounts.reduce((sum, account) => sum + account.spendMonth, 0);
  const totalImpressions = insights.reduce((sum, item) => sum + item.impressions, 0);
  const totalClicks = ads.reduce((sum, item) => sum + item.clicks, 0);
  const avgCtr = insights.length ? insights.reduce((sum, item) => sum + item.ctr, 0) / insights.length : 0;

  const overviewRows = [
    ["Ad accounts", `${accounts.length}`, formatCurrency(totalSpend)],
    ["Campaigns", `${campaigns.length}`, `${campaigns.reduce((sum, item) => sum + item.results, 0)} results`],
    ["Ad sets", `${adsets.length}`, `${adsets.reduce((sum, item) => sum + item.results, 0)} results`],
    ["Ads", `${ads.length}`, `${totalClicks} clicks`]
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ad reporting"
        title={mode === "overview" ? "Ads" : mode.charAt(0).toUpperCase() + mode.slice(1)}
        description="Connected Meta ad account views with campaign, ad set, ad, and daily insight structures in the same Business Center visual system."
        actions={<MetaSyncButton />}
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account snapshot</CardTitle>
            <CardDescription>Budget, spend, and operational connection status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Account", "Linked businesses", "Linked assets", "Status", "Spend today", "Spend month"]}
              rows={accounts.map((account) => [
                account.name,
                account.linkedBusinessNames?.join(", ") || "Unlinked",
                account.linkedAssetNames?.join(", ") || "No linked assets",
                <StatusBadge key={`${account.id}-status`} value={account.status} />,
                formatCurrency(account.spendToday),
                formatCurrency(account.spendMonth)
              ])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rollup</CardTitle>
            <CardDescription>High-level performance summary for the current adapter.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <TrendCard
                title="Spend trend"
                value={formatCurrency(totalSpend)}
                detail={`${orderedInsights.length} daily points`}
                icon={CircleDollarSign}
                data={orderedInsights.map((item) => item.spend)}
                tone="accent"
              />
              <TrendCard
                title="Impression trend"
                value={formatNumber(totalImpressions)}
                detail={`${campaigns.length} campaigns in scope`}
                icon={BarChart3}
                data={orderedInsights.map((item) => item.impressions)}
                tone="success"
              />
              <TrendCard
                title="Total clicks"
                value={formatNumber(totalClicks)}
                detail={`${ads.length} ads tracked`}
                icon={MousePointerClick}
                data={orderedInsights.map((item) => item.clicks)}
                tone="warning"
              />
              <TrendCard
                title="Average CTR"
                value={`${avgCtr.toFixed(2)}%`}
                detail="Across visible daily insights"
                icon={TrendingUp}
                data={orderedInsights.map((item) => item.ctr)}
                tone="neutral"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "campaigns" ? "Campaigns" : mode === "adsets" ? "Ad Sets" : mode === "ads" ? "Ads" : "Daily insights"}
          </CardTitle>
          <CardDescription>
            {mode === "overview" ? "Daily metrics table" : `Operational ${mode} view with status and performance placeholders.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "campaigns" ? (
            <DataTable
              columns={["Campaign", "Objective", "Status", "Budget", "Spend", "Results"]}
              rows={campaigns.map((item) => [
                item.name,
                item.objective,
                <StatusBadge key={`${item.id}-status`} value={item.status} />,
                formatCurrency(item.dailyBudget),
                formatCurrency(item.spend),
                formatNumber(item.results)
              ])}
            />
          ) : mode === "adsets" ? (
            <DataTable
              columns={["Ad set", "Audience", "Status", "Spend", "Results"]}
              rows={adsets.map((item) => [
                item.name,
                item.audience,
                <StatusBadge key={`${item.id}-status`} value={item.status} />,
                formatCurrency(item.spend),
                formatNumber(item.results)
              ])}
            />
          ) : mode === "ads" ? (
            <DataTable
              columns={["Ad", "Creative", "Status", "Spend", "Clicks", "CTR"]}
              rows={ads.map((item) => [
                item.name,
                item.creativeLabel,
                <StatusBadge key={`${item.id}-status`} value={item.status} />,
                formatCurrency(item.spend),
                formatNumber(item.clicks),
                `${item.ctr}%`
              ])}
            />
          ) : insights.length ? (
            <DataTable
              columns={["Date", "Entity", "Impressions", "Clicks", "Leads", "Spend", "CTR", "CPL"]}
              rows={insights.map((item) => [
                formatShortDate(item.date),
                item.entityId,
                formatNumber(item.impressions),
                formatNumber(item.clicks),
                formatNumber(item.leads),
                formatCurrency(item.spend),
                `${item.ctr}%`,
                formatCurrency(item.cpl)
              ])}
            />
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No daily insights yet"
              description="Run a Meta sync to populate spend, impression, CTR, and CPL history for the selected scope."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entity rollup</CardTitle>
          <CardDescription>Snapshot of entity counts and outcome volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={["Entity", "Count", "Performance"]} rows={overviewRows} />
        </CardContent>
      </Card>
    </div>
  );
}

function TrendCard({
  title,
  value,
  detail,
  data,
  tone,
  icon: Icon
}: {
  title: string;
  value: string;
  detail: string;
  data: number[];
  tone: "accent" | "success" | "warning" | "neutral";
  icon: typeof CircleDollarSign;
}) {
  const toneClassName =
    tone === "success"
      ? "bg-[var(--success-soft)] text-[var(--success)]"
      : tone === "warning"
        ? "bg-[var(--warning-soft)] text-[var(--warning)]"
        : tone === "neutral"
          ? "bg-slate-100 text-slate-700"
          : "bg-[var(--accent-soft)] text-[var(--accent-strong)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <MiniTrendChart data={data} tone={tone} />
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">{detail}</p>
    </div>
  );
}

function MiniTrendChart({
  data,
  tone
}: {
  data: number[];
  tone: "accent" | "success" | "warning" | "neutral";
}) {
  if (!data.length) {
    return <div className="h-20 rounded-xl border border-dashed border-[var(--border)] bg-white" />;
  }

  const width = 220;
  const height = 72;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stroke =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : tone === "neutral"
          ? "var(--muted)"
          : "var(--accent)";

  const points = data
    .map((value, index) => {
      const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-20 w-full overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
