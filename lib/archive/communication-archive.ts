import { buildCanonicalArchiveSnapshot } from "@/lib/archive/canonical";
import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";

type Row = Record<string, unknown>;

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export async function archiveCommunicationEvent(input: {
  rawWebhookEventId?: string | null;
  connectedBusinessId?: string | null;
  connectedAssetId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  contactId?: string | null;
  sourcePlatform: "facebook" | "instagram" | "messenger" | "meta" | "unknown";
  channel: "facebook" | "instagram" | "messenger" | "meta";
  direction?: "inbound" | "outbound" | null;
  eventType: string;
  externalEventId?: string | null;
  externalThreadId?: string | null;
  externalMessageId?: string | null;
  actorExternalId?: string | null;
  actorLabel?: string | null;
  counterpartyExternalId?: string | null;
  counterpartyLabel?: string | null;
  occurredAt?: string | null;
  canonicalPayload: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
  attachments?: Array<{
    attachmentType: string;
    externalAttachmentId?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    storagePath?: string | null;
    metadata?: Record<string, unknown>;
  }>;
}) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const archive = buildCanonicalArchiveSnapshot(input.canonicalPayload);
  const inserted = await client
    .from("communication_archive_events")
    .insert({
      raw_webhook_event_id: input.rawWebhookEventId ?? null,
      connected_business_id: input.connectedBusinessId ?? null,
      connected_asset_id: input.connectedAssetId ?? null,
      conversation_id: input.conversationId ?? null,
      message_id: input.messageId ?? null,
      contact_id: input.contactId ?? null,
      source_platform: input.sourcePlatform,
      channel: input.channel,
      direction: input.direction ?? null,
      event_type: input.eventType,
      external_event_id: input.externalEventId ?? null,
      external_thread_id: input.externalThreadId ?? null,
      external_message_id: input.externalMessageId ?? null,
      actor_external_id: input.actorExternalId ?? null,
      actor_label: input.actorLabel ?? null,
      counterparty_external_id: input.counterpartyExternalId ?? null,
      counterparty_label: input.counterpartyLabel ?? null,
      occurred_at: input.occurredAt ?? null,
      payload_sha256: archive.snapshotHash,
      canonical_payload: archive.canonicalPayload,
      raw_payload: input.rawPayload
    })
    .select("id")
    .single();

  if (inserted.error) {
    throw inserted.error;
  }

  const archiveEventId = str((inserted.data as Row).id);

  if (input.attachments?.length) {
    const attachmentInsert = await client.from("communication_archive_attachments").insert(
      input.attachments.map((attachment) => ({
        archive_event_id: archiveEventId,
        attachment_type: attachment.attachmentType,
        external_attachment_id: attachment.externalAttachmentId ?? null,
        file_name: attachment.fileName ?? null,
        mime_type: attachment.mimeType ?? null,
        storage_path: attachment.storagePath ?? null,
        metadata: attachment.metadata ?? {}
      }))
    );

    if (attachmentInsert.error) {
      throw attachmentInsert.error;
    }
  }

  return archiveEventId;
}
