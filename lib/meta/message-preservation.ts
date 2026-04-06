import { randomUUID } from "crypto";

import { archiveCommunicationEvent } from "@/lib/archive/communication-archive";
import { buildCanonicalArchiveSnapshot } from "@/lib/archive/canonical";
import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import type { BuiltRawEventRecord } from "@/lib/meta/webhooks";

interface NormalizedAttachment {
  attachmentType: string;
  externalAttachmentId: string | null;
  fileName: string;
  mimeType: string;
  metadata: Record<string, unknown>;
}

interface NormalizedMessageEvent {
  platform: "facebook" | "instagram";
  assetExternalId: string;
  participantExternalId: string;
  externalThreadId: string;
  externalMessageId: string;
  direction: "inbound" | "outbound";
  senderLabel: string;
  body: string;
  sentAt: string;
  attachments: NormalizedAttachment[];
  rawMessage: Record<string, unknown>;
}

function webhookArchiveEventType(rawEvent: BuiltRawEventRecord) {
  if (rawEvent.platform === "leadgen") return "leadgen_webhook";
  if (rawEvent.eventType === "read") return "message_read";
  if (rawEvent.eventType === "delivery") return "message_delivery";
  if (rawEvent.eventType === "messages") return "message_webhook";
  return rawEvent.eventType || "webhook_event";
}

function normalizeMessagePayload(rawEvent: BuiltRawEventRecord) {
  if (!Array.isArray(rawEvent.payload.entry)) {
    return [] as NormalizedMessageEvent[];
  }

  const normalized: NormalizedMessageEvent[] = [];

  for (const entry of rawEvent.payload.entry) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const typedEntry = entry as { id?: string; messaging?: Array<Record<string, unknown>> };
    const assetExternalId = String(typedEntry.id ?? "");

    if (!assetExternalId || !Array.isArray(typedEntry.messaging)) {
      continue;
    }

    for (const event of typedEntry.messaging) {
      const message = event.message;

      if (!message || typeof message !== "object") {
        continue;
      }

      const messageRecord = message as Record<string, unknown>;
      const externalMessageId = String(messageRecord.mid ?? "");

      if (!externalMessageId) {
        continue;
      }

      const senderId = String((event.sender as Record<string, unknown> | undefined)?.id ?? "");
      const recipientId = String((event.recipient as Record<string, unknown> | undefined)?.id ?? "");
      const direction = senderId === assetExternalId ? "outbound" : "inbound";
      const participantExternalId = direction === "inbound" ? senderId : recipientId;
      const timestamp = typeof event.timestamp === "number" ? event.timestamp : Number(event.timestamp ?? Date.now());
      const sentAt = Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
      const attachments = Array.isArray(messageRecord.attachments)
        ? messageRecord.attachments.map((attachment, index) => {
            const typedAttachment = attachment as Record<string, unknown>;
            const payload = (typedAttachment.payload as Record<string, unknown> | undefined) ?? {};
            const kind = String(typedAttachment.type ?? "file");

            return {
              attachmentType: kind,
              externalAttachmentId: String(payload.attachment_id ?? "") || null,
              fileName: `${kind}-${index + 1}`,
              mimeType: kind === "image" ? "image/jpeg" : "application/octet-stream",
              metadata: {
                url: payload.url,
                stickerId: payload.sticker_id
              }
            } satisfies NormalizedAttachment;
          })
        : [];

      normalized.push({
        platform: rawEvent.platform === "instagram" ? "instagram" : "facebook",
        assetExternalId,
        participantExternalId,
        externalThreadId: `${assetExternalId}:${participantExternalId}`,
        externalMessageId,
        direction,
        senderLabel: direction === "inbound" ? participantExternalId : assetExternalId,
        body: String(messageRecord.text ?? "") || "[attachment only]",
        sentAt,
        attachments,
        rawMessage: messageRecord
      });
    }
  }

  return normalized;
}

async function resolveConnectedAsset(client: ReturnType<typeof getSupabaseAdminClient>, assetExternalId: string, platform: "facebook" | "instagram") {
  if (!client) {
    return null;
  }

  const assetType = platform === "instagram" ? "instagram_professional" : "facebook_page";
  const { data } = await client
    .from("connected_assets")
    .select("id,business_id,asset_name,asset_type")
    .eq("external_asset_id", assetExternalId)
    .eq("asset_type", assetType)
    .maybeSingle();

  return data;
}

async function resolveOrCreateContact(client: ReturnType<typeof getSupabaseAdminClient>, participantExternalId: string, platform: "facebook" | "instagram") {
  if (!client) {
    return null;
  }

  const { data: existing } = await client
    .from("contacts")
    .select("id")
    .eq("external_contact_key", participantExternalId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data, error } = await client
    .from("contacts")
    .insert({
      external_contact_key: participantExternalId,
      display_name: participantExternalId,
      source: platform,
      stage: "new"
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function resolveOrCreateConversation(
  client: ReturnType<typeof getSupabaseAdminClient>,
  input: {
    connectedAssetId: string;
    contactId: string | null;
    platform: "facebook" | "instagram";
    externalThreadId: string;
    body: string;
    lastMessageAt: string;
    direction: "inbound" | "outbound";
  }
) {
  if (!client) {
    return null;
  }

  const { data: existing } = await client
    .from("conversations")
    .select("id,unread_count")
    .eq("platform", input.platform)
    .eq("external_thread_id", input.externalThreadId)
    .maybeSingle();

  if (existing) {
    const unreadCount = input.direction === "inbound" ? Number(existing.unread_count ?? 0) + 1 : Number(existing.unread_count ?? 0);

    const { data, error } = await client
      .from("conversations")
      .update({
        contact_id: input.contactId,
        subject: input.body.slice(0, 80),
        last_message_at: input.lastMessageAt,
        unread_count: unreadCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await client
    .from("conversations")
    .insert({
      connected_asset_id: input.connectedAssetId,
      contact_id: input.contactId,
      platform: input.platform,
      external_thread_id: input.externalThreadId,
      subject: input.body.slice(0, 80),
      status: "open",
      unread_count: input.direction === "inbound" ? 1 : 0,
      last_message_at: input.lastMessageAt
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function insertMessageCopy(
  client: ReturnType<typeof getSupabaseAdminClient>,
  conversationId: string,
  normalized: NormalizedMessageEvent,
  context?: { rawWebhookEventId?: string | null; connectedAssetId?: string | null; contactId?: string | null }
) {
  if (!client) {
    return null;
  }

  const { data: existing } = await client
    .from("messages")
    .select("id")
    .eq("external_message_id", normalized.externalMessageId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data, error } = await client
    .from("messages")
    .insert({
      conversation_id: conversationId,
      external_message_id: normalized.externalMessageId,
      direction: normalized.direction,
      sender_label: normalized.senderLabel,
      body: normalized.body,
      delivery_status: normalized.direction === "outbound" ? "queued" : "delivered",
      message_state: "active",
      sent_at: normalized.sentAt
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  if (normalized.attachments.length) {
    const attachmentsPayload = normalized.attachments.map((attachment) => ({
      message_id: data.id,
      attachment_type: attachment.attachmentType,
      external_attachment_id: attachment.externalAttachmentId,
      file_name: attachment.fileName,
      mime_type: attachment.mimeType,
      metadata: attachment.metadata
    }));

    const { error: attachmentError } = await client.from("message_attachments").insert(attachmentsPayload);

    if (attachmentError) {
      throw attachmentError;
    }
  }

  const archive = buildCanonicalArchiveSnapshot({
    conversationId,
    direction: normalized.direction,
    senderLabel: normalized.senderLabel,
    body: normalized.body,
    attachments: normalized.attachments,
    rawMessage: normalized.rawMessage
  });

  const { error: archiveError } = await client.from("message_archive").insert({
    message_id: data.id,
    canonical_payload: archive.canonicalPayload,
    snapshot_sha256: archive.snapshotHash,
    canonical_version: 1,
    retention_class: "standard"
  });

  if (archiveError) {
    throw archiveError;
  }

  await archiveCommunicationEvent({
    rawWebhookEventId: context?.rawWebhookEventId ?? null,
    connectedAssetId: context?.connectedAssetId ?? null,
    conversationId,
    messageId: data.id,
    contactId: context?.contactId ?? null,
    sourcePlatform: normalized.platform,
    channel: normalized.platform,
    direction: normalized.direction,
    eventType: normalized.direction === "inbound" ? "message_received" : "message_sent",
    externalEventId: normalized.externalMessageId,
    externalThreadId: normalized.externalThreadId,
    externalMessageId: normalized.externalMessageId,
    actorExternalId: normalized.direction === "inbound" ? normalized.participantExternalId : normalized.assetExternalId,
    actorLabel: normalized.senderLabel,
    counterpartyExternalId: normalized.direction === "inbound" ? normalized.assetExternalId : normalized.participantExternalId,
    counterpartyLabel: normalized.direction === "inbound" ? normalized.assetExternalId : normalized.participantExternalId,
    occurredAt: normalized.sentAt,
    canonicalPayload: archive.canonicalPayload as Record<string, unknown>,
    rawPayload: normalized.rawMessage,
    attachments: normalized.attachments.map((attachment) => ({
      attachmentType: attachment.attachmentType,
      externalAttachmentId: attachment.externalAttachmentId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      storagePath: null,
      metadata: attachment.metadata
    }))
  });

  return data;
}

async function insertAuditLog(client: ReturnType<typeof getSupabaseAdminClient>, input: { action: string; targetType: string; targetId: string; outcome: "success" | "warning" | "error"; detail: string; }) {
  if (!client) {
    return;
  }

  await client.from("audit_logs").insert({
    actor_label: "system",
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    outcome: input.outcome,
    detail: input.detail
  });
}

export async function persistInboundWebhookEvent(input: {
  rawEvent: BuiltRawEventRecord;
  rawBody: string;
  headers: Record<string, string>;
  signatureHeader: string | null;
  signatureValid: boolean;
}) {
  const client = getSupabaseAdminClient();
  const normalizedMessages = normalizeMessagePayload(input.rawEvent);

  if (!client) {
    return {
      persistenceMode: "disabled" as const,
      rawEventId: null,
      signatureValid: input.signatureValid,
      rawEventStored: false,
      messagesCopied: 0,
      warnings: ["Supabase service role configuration is missing."]
    };
  }

  const receivedAt = new Date().toISOString();
  const { data: rawEventRow, error: rawEventError } = await client
    .from("raw_webhook_events")
    .upsert(
      {
        dedupe_key: input.rawEvent.dedupeKey,
        platform: input.rawEvent.platform,
        event_type: input.rawEvent.eventType,
        delivery_id: input.rawEvent.deliveryId,
        signature_header: input.signatureHeader,
        request_headers: input.headers,
        raw_payload: input.rawEvent.payload,
        raw_payload_text: input.rawBody,
        payload_sha256: input.rawEvent.payloadSha256,
        processing_status: input.signatureValid ? "received" : "failed",
        processing_error: input.signatureValid ? null : "Invalid Meta webhook signature",
        received_at: receivedAt
      },
      { onConflict: "dedupe_key" }
    )
    .select("id")
    .single();

  if (rawEventError) {
    throw rawEventError;
  }

  await archiveCommunicationEvent({
    rawWebhookEventId: rawEventRow.id,
    sourcePlatform: input.rawEvent.platform === "leadgen" ? "meta" : input.rawEvent.platform,
    channel: input.rawEvent.platform === "instagram" ? "instagram" : input.rawEvent.platform === "facebook" ? "facebook" : "meta",
    eventType: webhookArchiveEventType(input.rawEvent),
    externalEventId: input.rawEvent.deliveryId,
    occurredAt: receivedAt,
    canonicalPayload: input.rawEvent.archive.canonicalPayload as Record<string, unknown>,
    rawPayload: input.rawEvent.payload
  });

  if (!input.signatureValid) {
    await insertAuditLog(client, {
      action: "webhook.signature_failed",
      targetType: "raw_webhook_event",
      targetId: input.rawEvent.dedupeKey,
      outcome: "warning",
      detail: "Raw webhook stored but normalization stopped because signature verification failed."
    });

    return {
      persistenceMode: "database" as const,
      rawEventId: rawEventRow.id,
      signatureValid: false,
      rawEventStored: true,
      messagesCopied: 0,
      warnings: ["Signature verification failed."]
    };
  }

  let messagesCopied = 0;
  const warnings: string[] = [];

  for (const normalized of normalizedMessages) {
    const asset = await resolveConnectedAsset(client, normalized.assetExternalId, normalized.platform);

    if (!asset) {
      warnings.push(`No connected asset found for external asset ${normalized.assetExternalId}.`);
      continue;
    }

    const contact = await resolveOrCreateContact(client, normalized.participantExternalId, normalized.platform);
    const conversation = await resolveOrCreateConversation(client, {
      connectedAssetId: asset.id,
      contactId: contact?.id ?? null,
      platform: normalized.platform,
      externalThreadId: normalized.externalThreadId,
      body: normalized.body,
      lastMessageAt: normalized.sentAt,
      direction: normalized.direction
    });

    if (!conversation) {
      warnings.push(`Conversation creation failed for message ${normalized.externalMessageId}.`);
      continue;
    }

    const insertedMessage = await insertMessageCopy(client, conversation.id, normalized, {
      rawWebhookEventId: rawEventRow.id,
      connectedAssetId: asset.id,
      contactId: contact?.id ?? null
    });

    if (insertedMessage) {
      messagesCopied += 1;
      await insertAuditLog(client, {
        action: normalized.direction === "inbound" ? "message.copy_inbound" : "message.copy_outbound",
        targetType: "message",
        targetId: normalized.externalMessageId,
        outcome: "success",
        detail: "Message copy persisted and archived."
      });
    }
  }

  await client
    .from("raw_webhook_events")
    .update({
      processing_status: warnings.length ? "processed" : "processed",
      processed_at: new Date().toISOString(),
      processing_error: warnings.length ? warnings.join(" | ") : null
    })
    .eq("id", rawEventRow.id);

  return {
    persistenceMode: "database" as const,
    rawEventId: rawEventRow.id,
    signatureValid: true,
    rawEventStored: true,
    messagesCopied,
    warnings
  };
}

export async function persistOutboundMessageCopy(input: {
  conversationId: string;
  body: string;
  actorLabel: string;
}) {
  const client = getSupabaseAdminClient();

  if (!client) {
    return {
      persistenceMode: "disabled" as const,
      copied: false,
      messageId: null,
      archiveId: null,
      warning: "Supabase service role configuration is missing."
    };
  }

  const { data: conversation } = await client
    .from("conversations")
    .select("id")
    .eq("id", input.conversationId)
    .maybeSingle();

  if (!conversation) {
    return {
      persistenceMode: "database" as const,
      copied: false,
      messageId: null,
      archiveId: null,
      warning: "Conversation was not found in Supabase."
    };
  }

  const queuedAt = new Date().toISOString();
  const externalMessageId = `outbound_${randomUUID()}`;
  const { data: messageRow, error: messageError } = await client
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      external_message_id: externalMessageId,
      direction: "outbound",
      sender_label: input.actorLabel,
      body: input.body,
      delivery_status: "queued",
      message_state: "active",
      sent_at: queuedAt
    })
    .select("id")
    .single();

  if (messageError) {
    throw messageError;
  }

  const archive = buildCanonicalArchiveSnapshot({
    direction: "outbound",
    senderLabel: input.actorLabel,
    body: input.body,
    queuedAt,
    externalMessageId
  });

  const { data: archiveRow, error: archiveError } = await client
    .from("message_archive")
    .insert({
      message_id: messageRow.id,
      canonical_payload: archive.canonicalPayload,
      snapshot_sha256: archive.snapshotHash,
      canonical_version: 1,
      retention_class: "operational"
    })
    .select("id")
    .single();

  if (archiveError) {
    throw archiveError;
  }

  await archiveCommunicationEvent({
    conversationId: conversation.id,
    messageId: messageRow.id,
    sourcePlatform: "meta",
    channel: "meta",
    direction: "outbound",
    eventType: "outbound_message_queued",
    externalEventId: externalMessageId,
    externalMessageId,
    actorLabel: input.actorLabel,
    occurredAt: queuedAt,
    canonicalPayload: archive.canonicalPayload as Record<string, unknown>,
    rawPayload: {
      direction: "outbound",
      senderLabel: input.actorLabel,
      body: input.body,
      queuedAt,
      externalMessageId
    }
  });

  await insertAuditLog(client, {
    action: "message.copy_outbound",
    targetType: "message",
    targetId: externalMessageId,
    outcome: "success",
    detail: "Outbound message copy persisted before live transport dispatch."
  });

  return {
    persistenceMode: "database" as const,
    copied: true,
    messageId: messageRow.id,
    archiveId: archiveRow.id,
    warning: null
  };
}
