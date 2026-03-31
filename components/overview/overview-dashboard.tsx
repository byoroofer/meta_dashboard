import { Activity, DatabaseZap, Shield, Webhook } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { ConnectedAsset, OverviewMetric, SyncJob } from "@/types/domain";

export function OverviewDashboard({
  metrics,
  syncJobs,
  connectedAssets,
  alerts
}: {
  metrics: OverviewMetric[];
  syncJobs: SyncJob[];
  connectedAssets: ConnectedAsset[];
  alerts: { id: string; title: string; body: string; tone: "neutral" | "warning" }[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations center"
        title="Overview"
        description="High-signal business operations view across messaging, lead intake, ad performance, sync health, and archive integrity."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Webhook className="h-5 w-5 text-[var(--accent)]" />
              Processing pipeline
            </CardTitle>
            <CardDescription>Every business message and webhook stays recoverable from raw receipt to archive snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { icon: Webhook, title: "Ingest", body: "Raw webhook payloads are stored exactly as received with dedupe keys." },
              { icon: Activity, title: "Normalize", body: "Operational tables power the inbox, leads, contacts, and ads surfaces." },
              { icon: DatabaseZap, title: "Archive", body: "Canonical snapshots are hashed to preserve message history immutably." },
              { icon: Shield, title: "Audit", body: "Security-sensitive actions and processing events are captured for traceability." }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <item.icon className="h-5 w-5 text-[var(--accent-strong)]" />
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Attention queue</CardTitle>
            <CardDescription>Operational items that need a human or system follow-up next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-white">{alert.title}</h3>
                  <StatusBadge value={alert.tone === "warning" ? "warning" : "queued"} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{alert.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Sync jobs</CardTitle>
            <CardDescription>Queue and polling placeholders for webhook processing and scheduled sync routines.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Scope", "Status", "Started", "Detail"]}
              rows={syncJobs.map((job) => [
                job.scope,
                <StatusBadge key={`${job.id}-status`} value={job.status} />,
                formatDateTime(job.startedAt),
                job.detail
              ])}
            />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Connected assets</CardTitle>
            <CardDescription>Health and sync visibility across the supported Meta business asset footprint.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Asset", "Type", "Connection", "Sync", "Webhook", "Last Sync"]}
              rows={connectedAssets.map((asset) => [
                asset.name,
                asset.type.replaceAll("_", " "),
                <StatusBadge key={`${asset.id}-conn`} value={asset.status} />,
                <StatusBadge key={`${asset.id}-sync`} value={asset.syncStatus} />,
                <StatusBadge key={`${asset.id}-webhook`} value={asset.webhookHealth} />,
                formatDateTime(asset.lastSyncedAt)
              ])}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
