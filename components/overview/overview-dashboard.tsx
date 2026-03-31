import { Activity, Globe, MessageSquareReply, Shield, Webhook } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type {
  AutoResponderRule,
  ConnectedAsset,
  LeadDestination,
  OverviewMetric,
  RawWebhookEvent,
  SyncJob
} from "@/types/domain";

export function OverviewDashboard({
  metrics,
  syncJobs,
  connectedAssets,
  autoResponderRules,
  leadDestinations,
  rawEvents,
  alerts
}: {
  metrics: OverviewMetric[];
  syncJobs: SyncJob[];
  connectedAssets: ConnectedAsset[];
  autoResponderRules: AutoResponderRule[];
  leadDestinations: LeadDestination[];
  rawEvents: RawWebhookEvent[];
  alerts: { id: string; title: string; body: string; tone: "neutral" | "warning" }[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations center"
        title="Overview"
        description="Meta-style business workspace for messaging, lead capture, website delivery, ads visibility, and archive integrity."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-[var(--accent)]" />
              Message preservation pipeline
            </CardTitle>
            <CardDescription>Operational flow follows the same admin-first logic throughout the product: receive, preserve, normalize, route, archive.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { icon: Webhook, title: "Receive", body: "Capture the raw webhook payload before any mutation or validation step." },
              { icon: Activity, title: "Normalize", body: "Project business-safe records into inbox, contacts, leads, and reporting tables." },
              { icon: MessageSquareReply, title: "Respond", body: "Apply auto-responder rules only on supported Pages and professional accounts." },
              { icon: Shield, title: "Archive", body: "Hash the canonical message snapshot and retain the event-processing trail." }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                <item.icon className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attention queue</CardTitle>
            <CardDescription>Operational tasks that look like Meta Business Suite to-dos: sync, routing, automation, and delivery exceptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{alert.body}</p>
                  </div>
                  <StatusBadge value={alert.tone === "warning" ? "warning" : "queued"} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Auto responders</CardTitle>
            <CardDescription>Scoped to supported business Pages and Instagram professional accounts only.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Rule", "Trigger", "Status", "Response window", "Last triggered"]}
              rows={autoResponderRules.map((rule) => [
                rule.name,
                rule.trigger.replaceAll("_", " "),
                <StatusBadge key={`${rule.id}-status`} value={rule.status} />,
                rule.responseWindowLabel,
                formatDateTime(rule.lastTriggeredAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--accent)]" />
              Website lead delivery
            </CardTitle>
            <CardDescription>Lead records can be delivered into website endpoints and forms once field maps and auth are finalized.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Destination", "Type", "Status", "Outcome", "Last delivered"]}
              rows={leadDestinations.map((destination) => [
                destination.name,
                destination.destinationType.replaceAll("_", " "),
                <StatusBadge key={`${destination.id}-status`} value={destination.status} />,
                <StatusBadge key={`${destination.id}-outcome`} value={destination.lastDeliveryOutcome} />,
                formatDateTime(destination.lastDeliveredAt)
              ])}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sync jobs</CardTitle>
            <CardDescription>Queue placeholders for webhook processing, reporting syncs, and website delivery retries.</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Connected assets</CardTitle>
            <CardDescription>Health and sync visibility across the Meta asset footprint attached to the business.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Asset", "Type", "Connection", "Sync", "Webhook", "Last sync"]}
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

      <Card>
        <CardHeader>
          <CardTitle>Recent raw events</CardTitle>
          <CardDescription>Raw event browsing remains available so inbound business activity is always recoverable.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={["Platform", "Type", "Status", "Received", "Dedupe key"]}
            rows={rawEvents.map((event) => [
              event.platform,
              event.eventType,
              <StatusBadge key={`${event.id}-status`} value={event.processingStatus} />,
              formatDateTime(event.receivedAt),
              event.dedupeKey
            ])}
          />
        </CardContent>
      </Card>
    </div>
  );
}
