import { Activity, Globe, PanelsTopLeft, Shield, Webhook } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type {
  AutoResponderRule,
  CommandExecution,
  CommandTemplate,
  ConnectedAsset,
  IntegrationTarget,
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
  integrationTargets,
  commandTemplates,
  commandExecutions,
  alerts
}: {
  metrics: OverviewMetric[];
  syncJobs: SyncJob[];
  connectedAssets: ConnectedAsset[];
  autoResponderRules: AutoResponderRule[];
  leadDestinations: LeadDestination[];
  rawEvents: RawWebhookEvent[];
  integrationTargets: IntegrationTarget[];
  commandTemplates: CommandTemplate[];
  commandExecutions: CommandExecution[];
  alerts: { id: string; title: string; body: string; tone: "neutral" | "warning" }[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations center"
        title="Overview"
        description="Portal control plane for Meta business assets, client websites, databases, and operational tables, with preserved messaging and API-ready dispatch boundaries."
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
              <PanelsTopLeft className="h-5 w-5 text-[var(--accent)]" />
              Portal command center
            </CardTitle>
            <CardDescription>The dashboard is structured as the operator portal that can dispatch controlled commands into Meta, websites, databases, and internal tables.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { icon: Webhook, title: "Meta actions", body: "Queue supported business replies, refresh asset sync, and coordinate inbound event handling through server routes." },
              { icon: Globe, title: "Website actions", body: "Push qualified leads, trigger booking flows, and send structured payloads into company websites." },
              { icon: Activity, title: "Database actions", body: "Prepare controlled stage updates and sync commands for client CRM or analytics databases." },
              { icon: Shield, title: "Table actions", body: "Run safe internal table mutations like requeues, status changes, and archival bookkeeping." }
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
            <CardDescription>Operational tasks that need review before live command dispatch expands across client systems.</CardDescription>
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
            <CardTitle>Integration targets</CardTitle>
            <CardDescription>Every live or planned destination the portal will command.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Target", "Type", "Status", "Connection", "Heartbeat"]}
              rows={integrationTargets.map((target) => [
                target.name,
                target.targetType.replaceAll("_", " "),
                <StatusBadge key={`${target.id}-status`} value={target.status} />,
                target.connectionLabel,
                formatDateTime(target.lastHeartbeatAt)
              ])}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Command templates</CardTitle>
            <CardDescription>Ready-to-wire command contracts the portal can dispatch when APIs and credentials are connected.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Command", "Target type", "Status", "Approval", "Last used"]}
              rows={commandTemplates.map((template) => [
                template.name,
                template.targetType.replaceAll("_", " "),
                <StatusBadge key={`${template.id}-status`} value={template.status} />,
                template.requiresApproval ? "required" : "not required",
                formatDateTime(template.lastUsedAt)
              ])}
            />
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
            <CardTitle>Command executions</CardTitle>
            <CardDescription>Recent portal actions across Meta, website, database, and table targets.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Command", "Target", "Status", "Requested by", "Requested", "Result"]}
              rows={commandExecutions.map((execution) => [
                execution.commandLabel,
                execution.targetName,
                <StatusBadge key={`${execution.id}-status`} value={execution.status} />,
                execution.requestedBy,
                formatDateTime(execution.requestedAt),
                execution.resultSummary
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

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sync jobs</CardTitle>
            <CardDescription>Queue placeholders for webhook processing, portal dispatch, reporting syncs, and website delivery retries.</CardDescription>
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
      </section>
    </div>
  );
}
