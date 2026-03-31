import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { AuditLog } from "@/types/domain";

export function SettingsWorkspace({
  section,
  auditLogs
}: {
  section: "general" | "security" | "audit";
  auditLogs: AuditLog[];
}) {
  const title = section === "security" ? "Security" : section === "audit" ? "Audit" : "Settings";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin controls"
        title={title}
        description="Server-side security posture, role boundaries, token-handling placeholders, and audit visibility for production hardening."
      />

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Control framework</CardTitle>
            <CardDescription>Core governance controls included in the scaffold from day one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Admin-only route guard scaffold",
              "2FA-ready session model",
              "Server-side token isolation",
              "Audit helper for privileged actions",
              "Archive-first webhook processing design"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Security notes</CardTitle>
            <CardDescription>Production completion items before real Meta credentials and live operator access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Replace the demo admin session with Supabase Auth or your SSO provider.",
              "Use real encryption-at-rest for long-lived Meta tokens, not plaintext storage.",
              "Bind webhook signature verification to Meta's actual HMAC scheme before production.",
              "Enable row-level access and audit append-only patterns in Supabase."
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-amber-400/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {section === "audit" ? (
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Audit trail</CardTitle>
            <CardDescription>Recent security and operational log entries from the mock adapter.</CardDescription>
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
