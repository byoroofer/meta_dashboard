import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { MessageArchiveRecord, RawWebhookEvent } from "@/types/domain";

export function ArchiveWorkspace({
  mode,
  events,
  messageArchive
}: {
  mode: "overview" | "events" | "messages";
  events: RawWebhookEvent[];
  messageArchive: MessageArchiveRecord[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Archive integrity"
        title={mode === "overview" ? "Archive" : mode === "events" ? "Raw Events" : "Archived Messages"}
        description="Raw event preservation, canonical message snapshots, and processing traceability for recovery and auditability."
      />

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Preservation model</CardTitle>
            <CardDescription>Explicit server-side lifecycle for every supported inbound or outbound business message.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "1. Receive raw webhook payload",
              "2. Persist raw payload exactly as received",
              "3. Verify signature and dedupe event",
              "4. Normalize to operations tables",
              "5. Build canonical archive snapshot",
              "6. Hash and persist archive record",
              "7. Log processing outcome and audit trail"
            ].map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                {step}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="text-white">Raw event preview</CardTitle>
            <CardDescription>Exact JSON persistence is handled server-side; the UI exposes a browsable event surface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-black/30 p-4 font-[var(--font-mono)] text-xs leading-6 text-[var(--muted)]">
                <div className="mb-2 flex items-center justify-between gap-3 font-sans text-sm">
                  <span className="font-medium text-white">{event.eventType}</span>
                  <StatusBadge value={event.processingStatus} />
                </div>
                <div>{event.payloadPreview}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white">{mode === "messages" ? "Message archive" : "Raw event ledger"}</CardTitle>
          <CardDescription>
            {mode === "messages"
              ? "Canonical archive snapshots are versioned and hashed."
              : "Webhook events are retained before any normalization step mutates them."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "messages" ? (
            <DataTable
              columns={["Archive ID", "Message ID", "Snapshot Hash", "Version", "Retention", "Created"]}
              rows={messageArchive.map((item) => [
                item.id,
                item.messageId,
                item.snapshotHash.slice(0, 18) + "...",
                `${item.canonicalVersion}`,
                item.retentionClass,
                formatDateTime(item.createdAt)
              ])}
            />
          ) : (
            <DataTable
              columns={["Event ID", "Platform", "Type", "Status", "Received", "Dedupe key"]}
              rows={events.map((event) => [
                event.id,
                event.platform,
                event.eventType,
                <StatusBadge key={`${event.id}-status`} value={event.processingStatus} />,
                formatDateTime(event.receivedAt),
                event.dedupeKey
              ])}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
