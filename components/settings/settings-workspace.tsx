import { Bot, Globe, LockKeyhole, PanelsTopLeft, ShieldCheck } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type {
  AuditLog,
  AutoResponderRule,
  CommandExecution,
  CommandTemplate,
  IntegrationTarget,
  LeadDestination
} from "@/types/domain";

export function SettingsWorkspace({
  section,
  auditLogs,
  autoResponderRules,
  leadDestinations,
  integrationTargets,
  commandTemplates,
  commandExecutions
}: {
  section: "general" | "security" | "audit";
  auditLogs: AuditLog[];
  autoResponderRules: AutoResponderRule[];
  leadDestinations: LeadDestination[];
  integrationTargets: IntegrationTarget[];
  commandTemplates: CommandTemplate[];
  commandExecutions: CommandExecution[];
}) {
  const title = section === "security" ? "Security" : section === "audit" ? "Audit" : "Settings";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin controls"
        title={title}
        description="Business Center-style settings for portal targets, automation, website delivery, security posture, and audit visibility."
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
              Control framework
            </CardTitle>
            <CardDescription>Core governance controls included in the scaffold from day one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Admin-only route guard scaffold",
              "2FA-ready session model",
              "Server-side token isolation",
              "Audit helper for privileged actions",
              "Archive-first webhook processing design",
              "Portal command contracts for Meta, websites, databases, and tables"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm text-slate-800">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-[var(--accent)]" />
              Production completion notes
            </CardTitle>
            <CardDescription>Hardening and integration work still required before live operator access and real Meta credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Replace the demo session with Supabase Auth or your SSO provider.",
              "Use real encryption-at-rest for long-lived Meta tokens.",
              "Bind webhook signature verification to Meta's real HMAC flow before go-live.",
              "Finalize website and database write contracts before enabling live command dispatch.",
              "Enable RLS and append-only audit patterns in Supabase."
            ].map((item) => (
              <div key={item} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {section !== "audit" ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PanelsTopLeft className="h-5 w-5 text-[var(--accent)]" />
                  Integration targets
                </CardTitle>
                <CardDescription>The systems this portal is designed to command once credentials and contracts are finalized.</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <PanelsTopLeft className="h-5 w-5 text-[var(--accent)]" />
                  Command templates
                </CardTitle>
                <CardDescription>Reusable command contracts for Meta assets, websites, databases, and internal tables.</CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[var(--accent)]" />
                  Auto-responder rules
                </CardTitle>
                <CardDescription>Automation that acknowledges inbound business messages on supported Pages and professional accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Rule", "Trigger", "Status", "Channel", "Last triggered"]}
                  rows={autoResponderRules.map((rule) => [
                    rule.name,
                    rule.trigger.replaceAll("_", " "),
                    <StatusBadge key={`${rule.id}-status`} value={rule.status} />,
                    rule.deliveryChannel.replaceAll("_", " "),
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
                <CardDescription>Destinations that receive normalized Meta lead records into website-owned intake systems.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Destination", "Type", "Status", "Last outcome", "Last delivered"]}
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

          <Card>
            <CardHeader>
              <CardTitle>Recent portal executions</CardTitle>
              <CardDescription>Latest portal actions across Meta, websites, databases, and internal tables.</CardDescription>
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
        </>
      ) : null}

      {section === "audit" ? (
        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>Recent security, archive, automation, portal, and operational log entries from the current adapter.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={["Action", "Target", "Actor", "Outcome", "Occurred", "Detail"]}
              rows={auditLogs.map((entry) => [
                entry.action,
                `${entry.targetType}:${entry.targetId}`,
                entry.actor,
                <StatusBadge key={`${entry.id}-status`} value={entry.outcome} />,
                formatDateTime(entry.occurredAt),
                entry.detail
              ])}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
