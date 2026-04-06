import { Archive, Clock3, LockKeyhole, Radio, ReceiptText } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { CommunicationArchiveEvent, Message, MessageArchiveRecord, RawWebhookEvent } from "@/types/domain";

function truncate(value: string, length = 160) {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function extractBody(payload?: Record<string, unknown>) {
  if (!payload) return "";

  for (const key of ["body", "message", "text"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  const rawMessage = payload.rawMessage;
  if (rawMessage && typeof rawMessage === "object") {
    const typed = rawMessage as Record<string, unknown>;
    for (const key of ["message", "text"]) {
      const value = typed[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return "";
}

function formatPayload(payload?: Record<string, unknown>) {
  if (!payload || !Object.keys(payload).length) {
    return "";
  }

  return JSON.stringify(payload, null, 2);
}

function renderActor(event: CommunicationArchiveEvent) {
  const lines = [event.actorLabel || "unknown actor", event.actorExternalId || null].filter(Boolean);

  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div key={`${event.id}-actor-${index}`} className={index === 0 ? "font-medium text-slate-900" : "text-xs text-[var(--muted)]"}>
          {line}
        </div>
      ))}
    </div>
  );
}

function renderCounterparty(event: CommunicationArchiveEvent) {
  const lines = [
    event.contact?.displayName || event.counterpartyLabel || "unknown counterparty",
    event.contact?.primaryEmail || null,
    event.contact?.primaryPhone || null,
    event.counterpartyExternalId || null
  ].filter(Boolean);

  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div key={`${event.id}-counterparty-${index}`} className={index === 0 ? "font-medium text-slate-900" : "text-xs text-[var(--muted)]"}>
          {line}
        </div>
      ))}
    </div>
  );
}

function renderArchiveContent(event: CommunicationArchiveEvent) {
  const body = extractBody(event.canonicalPayload) || extractBody(event.rawPayload);

  return (
    <div className="space-y-1">
      <div className="font-medium text-slate-900">{event.externalMessageId || event.externalThreadId || event.id}</div>
      <div className="max-w-xl text-xs text-[var(--muted)]">{body ? truncate(body, 180) : "No body retained"}</div>
    </div>
  );
}

export function ArchiveWorkspace({
  mode,
  events,
  messageArchive,
  communicationArchive,
  messages
}: {
  mode: "overview" | "events" | "messages";
  events: RawWebhookEvent[];
  messageArchive: MessageArchiveRecord[];
  communicationArchive: CommunicationArchiveEvent[];
  messages: Message[];
}) {
  const inboundCount = communicationArchive.filter((item) => item.direction === "inbound").length;
  const outboundCount = communicationArchive.filter((item) => item.direction === "outbound").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Immutable archive"
        title={mode === "overview" ? "Archive" : mode === "events" ? "Raw Events" : "Archived Communications"}
        description="Separate append-only communication retention for inbound and outbound Meta activity. Archive records remain preserved even if inbox rows are edited, deleted, or archived later."
      />

      <FilterBar
        searchPlaceholder="Search archived threads, counterparties, event types, payloads, or message IDs"
        filters={["Inbound", "Outbound", "Messages", "Read/Delivery", "Locked"]}
      />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Retention model</CardTitle>
            <CardDescription>Archive writes are separate from inbox operations and protected against mutation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Radio, title: "Capture", body: "Inbound raw webhooks and outbound sends write into immutable archive events first-class, not only operational inbox rows." },
              { icon: LockKeyhole, title: "Protect", body: "Archive tables are append-only at the database level. Inbox deletes or edits do not remove prior retained rows." },
              { icon: Archive, title: "Backfill", body: "Historical message imports also write archive rows so existing thread history can be preserved alongside new live traffic." }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4">
                <item.icon className="h-4 w-4 text-[var(--accent)]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archive snapshot</CardTitle>
            <CardDescription>High-level totals for retained communication activity.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Archived events", value: `${communicationArchive.length}`, icon: ReceiptText },
              { label: "Inbound retained", value: `${inboundCount}`, icon: Radio },
              { label: "Outbound retained", value: `${outboundCount}`, icon: Archive },
              { label: "Raw webhook ledger", value: `${events.length}`, icon: Clock3 }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4">
                <item.icon className="h-4 w-4 text-[var(--accent)]" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Immutable communication ledger</CardTitle>
          <CardDescription>Viewable archive of sent and received records retained independently from inbox state.</CardDescription>
        </CardHeader>
        <CardContent>
          {communicationArchive.length ? (
            <DataTable
              columns={["Archived", "Direction", "Event", "Actor", "Counterparty", "Thread/Content", "Attachments", "Retention"]}
              rows={communicationArchive.map((item) => [
                formatDateTime(item.occurredAt ?? item.archivedAt),
                item.direction ? <StatusBadge key={`${item.id}-direction`} value={item.direction} /> : item.channel,
                `${item.eventType} (${item.sourcePlatform})`,
                renderActor(item),
                renderCounterparty(item),
                renderArchiveContent(item),
                `${item.attachmentCount}`,
                item.retentionLocked ? "locked" : "unlocked"
              ])}
            />
          ) : (
            <EmptyState
              icon={Archive}
              title="No immutable archive events yet"
              description="Once inbound or outbound Meta traffic is processed, permanently retained communication records will appear here."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "messages" ? "Archived message copies" : "Raw webhook ledger"}</CardTitle>
          <CardDescription>
            {mode === "messages"
              ? "Scoped message rows are populated here alongside immutable archive events and snapshot metadata."
              : "Raw webhook events are retained with payload previews so you can inspect what Meta delivered before normalization."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "messages" ? (
            messages.length ? (
              <DataTable
                columns={["Sent", "Direction", "Sender", "Status", "Conversation", "Body", "Attachments"]}
                rows={messages.map((item) => [
                  formatDateTime(item.sentAt),
                  <StatusBadge key={`${item.id}-direction`} value={item.direction} />,
                  item.senderLabel,
                  <StatusBadge key={`${item.id}-status`} value={item.status} />,
                  item.conversationId,
                  item.body || "No body",
                  `${item.attachments.length}`
                ])}
              />
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No archived messages yet"
                description="Message rows will appear here after scoped inbound or outbound traffic has been imported or preserved."
              />
            )
          ) : events.length ? (
            <DataTable
              columns={["Event ID", "Platform", "Type", "Status", "Received", "Payload", "Dedupe key"]}
              rows={events.map((event) => [
                event.id,
                event.platform,
                event.eventType,
                <StatusBadge key={`${event.id}-status`} value={event.processingStatus} />,
                formatDateTime(event.receivedAt),
                <span key={`${event.id}-payload`} className="max-w-xl whitespace-normal break-all text-xs text-[var(--muted)]">
                  {event.payloadPreview}
                </span>,
                event.dedupeKey
              ])}
            />
          ) : (
            <EmptyState
              icon={Radio}
              title="No raw webhook events yet"
              description="Webhook events will appear here as soon as Meta delivers inbound payloads to the live endpoint."
            />
          )}
        </CardContent>
      </Card>

      {mode === "messages" ? (
        <Card>
          <CardHeader>
            <CardTitle>Canonical message snapshots</CardTitle>
            <CardDescription>Hash-versioned message snapshots remain available alongside the populated message copy list.</CardDescription>
          </CardHeader>
          <CardContent>
            {messageArchive.length ? (
              <DataTable
                columns={["Created", "Message ID", "Body", "Attachments", "Hash", "Retention"]}
                rows={messageArchive.map((item) => [
                  formatDateTime(item.createdAt),
                  item.messageId,
                  truncate(extractBody(item.canonicalPayload), 160) || "No body retained",
                  `${Array.isArray(item.canonicalPayload?.attachments) ? item.canonicalPayload.attachments.length : 0}`,
                  `${item.snapshotHash.slice(0, 18)}...`,
                  item.retentionClass
                ])}
              />
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No canonical snapshots yet"
                description="Message snapshots will appear here after the first archived inbound or outbound message copy is processed."
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Retained archive contents</CardTitle>
          <CardDescription>Counterparty details, retained message contents, attachments, and archived payload snapshots for the most recent records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {communicationArchive.length ? (
            communicationArchive.slice(0, 12).map((item) => {
              const body = extractBody(item.canonicalPayload) || extractBody(item.rawPayload);
              const canonicalPayload = formatPayload(item.canonicalPayload);
              const rawPayload = formatPayload(item.rawPayload);

              return (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.contact?.displayName || item.counterpartyLabel || item.externalThreadId || item.id}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {formatDateTime(item.occurredAt ?? item.archivedAt)} · {item.eventType} · {item.sourcePlatform}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.direction ? <StatusBadge value={item.direction} /> : null}
                      <StatusBadge value={item.retentionLocked ? "locked" : "unlocked"} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">Counterparty</p>
                      <div className="space-y-1 text-sm text-slate-900">
                        <p>{item.contact?.displayName || item.counterpartyLabel || "Unknown counterparty"}</p>
                        {item.contact?.primaryEmail ? <p className="text-xs text-[var(--muted)]">{item.contact.primaryEmail}</p> : null}
                        {item.contact?.primaryPhone ? <p className="text-xs text-[var(--muted)]">{item.contact.primaryPhone}</p> : null}
                        {item.counterpartyExternalId ? <p className="text-xs text-[var(--muted)]">External ID: {item.counterpartyExternalId}</p> : null}
                        {item.contact?.source ? <p className="text-xs text-[var(--muted)]">Source: {item.contact.source}</p> : null}
                        {item.contact?.companyName ? <p className="text-xs text-[var(--muted)]">Company: {item.contact.companyName}</p> : null}
                        {item.contact?.jobTitle ? <p className="text-xs text-[var(--muted)]">Title: {item.contact.jobTitle}</p> : null}
                        {item.contact?.city || item.contact?.state ? (
                          <p className="text-xs text-[var(--muted)]">
                            Location: {[item.contact.city, item.contact.state, item.contact.country].filter(Boolean).join(", ")}
                          </p>
                        ) : null}
                        {item.contact?.tags?.length ? <p className="text-xs text-[var(--muted)]">Tags: {item.contact.tags.join(", ")}</p> : null}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-xl border border-[var(--border)] bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">Content</p>
                      <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{body || "No body retained for this event."}</p>
                      <div className="grid gap-1 text-xs text-[var(--muted)]">
                        {item.externalEventId ? <p>Event: {item.externalEventId}</p> : null}
                        {item.externalThreadId ? <p>Thread: {item.externalThreadId}</p> : null}
                        {item.externalMessageId ? <p>Message: {item.externalMessageId}</p> : null}
                        {item.actorLabel ? <p>Actor: {item.actorLabel}</p> : null}
                      </div>
                    </div>
                  </div>

                  {item.attachments?.length ? (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">Attachments</p>
                      <div className="mt-2 space-y-2">
                        {item.attachments.map((attachment) => (
                          <div key={attachment.id} className="rounded-lg border border-[var(--border)] bg-slate-50 p-3 text-sm">
                            <p className="font-medium text-slate-900">{attachment.fileName}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {attachment.kind} · {attachment.mimeType}
                            </p>
                            {attachment.url ? <p className="mt-1 break-all text-xs text-[var(--muted)]">{attachment.url}</p> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    <details className="rounded-xl border border-[var(--border)] bg-white p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                        Canonical payload
                      </summary>
                      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                        {canonicalPayload || "No canonical payload retained."}
                      </pre>
                    </details>

                    <details className="rounded-xl border border-[var(--border)] bg-white p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                        Raw payload
                      </summary>
                      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                        {rawPayload || "No raw payload retained."}
                      </pre>
                    </details>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Archive}
              title="No retained archive contents yet"
              description="Archived event contents, counterparty details, and payload snapshots will appear here once communication records are retained."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
