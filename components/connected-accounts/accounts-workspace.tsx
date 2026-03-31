import { Database, Globe, MessageSquareShare, Network, ShieldCheck } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog, ConnectedAsset, ConnectedBusiness, OverviewMetric } from "@/types/domain";

const targetTypeIcons = {
  meta_asset: MessageSquareShare,
  website: Globe,
  database: Database,
  table: Network
} as const;

function formatOptionalDate(value: string | null) {
  return value ? formatDateTime(value) : "No activity yet";
}

export function AccountsWorkspace({
  businesses,
  assets,
  recentAudit,
  controlMetrics,
  commandCoverage,
  systemCoverage
}: {
  businesses: ConnectedBusiness[];
  assets: ConnectedAsset[];
  recentAudit: AuditLog[];
  controlMetrics: OverviewMetric[];
  commandCoverage: Array<{
    id: string;
    name: string;
    targetType: "meta_asset" | "website" | "database" | "table";
    status: "active" | "warning" | "paused";
    connectionLabel: string;
    commandCount: number;
    approvalCount: number;
    latestExecutionAt: string | null;
    nextStep: string;
    capabilities: string[];
  }>;
  systemCoverage: Array<{
    targetType: "meta_asset" | "website" | "database" | "table";
    targetCount: number;
    activeTargets: number;
    templateCount: number;
    approvalCount: number;
    latestExecutionAt: string | null;
  }>;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business connectivity"
        title="Connected Accounts"
        description="Supported Meta assets, website endpoints, databases, and internal tables that this portal can observe and eventually command through guarded server-side integrations."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {controlMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Connected businesses</CardTitle>
            <CardDescription>Business-level connection state for the assets this dashboard can operate on.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Business", "Status", "Sync", "Webhook", "Scopes", "Last sync"]}
              rows={businesses.map((business) => [
                business.name,
                <StatusBadge key={`${business.id}-status`} value={business.status} />,
                <StatusBadge key={`${business.id}-sync`} value={business.syncStatus} />,
                <StatusBadge key={`${business.id}-webhook`} value={business.webhookHealth} />,
                `${business.grantedScopes.length} scopes`,
                formatDateTime(business.lastSyncedAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Asset inventory</CardTitle>
            <CardDescription>Pages, Instagram professional accounts, ad accounts, and lead forms only.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Asset", "Type", "Status", "Sync", "Webhook", "Rotated"]}
              rows={assets.map((asset) => [
                asset.name,
                asset.type.replaceAll("_", " "),
                <StatusBadge key={`${asset.id}-status`} value={asset.status} />,
                <StatusBadge key={`${asset.id}-sync`} value={asset.syncStatus} />,
                <StatusBadge key={`${asset.id}-webhook`} value={asset.webhookHealth} />,
                formatDateTime(asset.tokenLastRotatedAt)
              ])}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
              Portal target readiness
            </CardTitle>
            <CardDescription>Every external or internal system the portal will command once live credentials and contracts are in place.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commandCoverage.map((item) => {
                const Icon = targetTypeIcons[item.targetType];

                return (
                  <div key={item.id} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[var(--accent)]" />
                          <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                          <StatusBadge value={item.status} />
                        </div>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {item.connectionLabel} - {item.commandCount} command templates - {item.approvalCount} approval-gated
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-700">{item.nextStep}</p>
                      </div>
                      <div className="min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[var(--muted)]">
                        <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">Capabilities</p>
                        <p className="mt-2 leading-6 text-slate-700">{item.capabilities.join(", ")}</p>
                        <p className="mt-3 text-slate-500">Latest activity: {formatOptionalDate(item.latestExecutionAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Command coverage by system type</CardTitle>
            <CardDescription>How far each system class is prepared for live portal dispatch.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["System type", "Targets", "Active", "Templates", "Approval gates", "Latest activity"]}
              rows={systemCoverage.map((item) => [
                item.targetType.replaceAll("_", " "),
                `${item.targetCount}`,
                `${item.activeTargets}`,
                `${item.templateCount}`,
                `${item.approvalCount}`,
                formatOptionalDate(item.latestExecutionAt)
              ])}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent account audit</CardTitle>
          <CardDescription>Security-sensitive account lifecycle actions, portal readiness changes, and archive-related operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={["Action", "Target", "Actor", "Outcome", "Occurred", "Detail"]}
            rows={recentAudit.map((entry) => [
              entry.action,
              `${entry.targetType}:${entry.targetId}`,
              entry.actor,
              <StatusBadge key={`${entry.id}-outcome`} value={entry.outcome} />,
              formatDateTime(entry.occurredAt),
              entry.detail
            ])}
          />
        </CardContent>
      </Card>
    </div>
  );
}
