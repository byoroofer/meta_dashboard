import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
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
  const overviewRows = [
    ["Ad accounts", `${accounts.length}`, formatCurrency(accounts.reduce((sum, account) => sum + account.spendMonth, 0))],
    ["Campaigns", `${campaigns.length}`, `${campaigns.reduce((sum, item) => sum + item.results, 0)} results`],
    ["Ad sets", `${adsets.length}`, `${adsets.reduce((sum, item) => sum + item.results, 0)} results`],
    ["Ads", `${ads.length}`, `${ads.reduce((sum, item) => sum + item.clicks, 0)} clicks`]
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ad reporting"
        title={mode === "overview" ? "Ads" : mode.charAt(0).toUpperCase() + mode.slice(1)}
        description="Connected Meta ad account views with campaign, ad set, ad, and daily insight structures in the same Business Center visual system."
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account snapshot</CardTitle>
            <CardDescription>Budget, spend, and operational connection status.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Account", "Status", "Spend today", "Spend month"]}
              rows={accounts.map((account) => [
                account.name,
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
            <DataTable columns={["Entity", "Count", "Performance"]} rows={overviewRows} />
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
          ) : (
            <DataTable
              columns={["Date", "Entity", "Impressions", "Clicks", "Leads", "Spend", "CTR", "CPL"]}
              rows={insights.map((item) => [
                item.date,
                item.entityId,
                formatNumber(item.impressions),
                formatNumber(item.clicks),
                formatNumber(item.leads),
                formatCurrency(item.spend),
                `${item.ctr}%`,
                formatCurrency(item.cpl)
              ])}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
