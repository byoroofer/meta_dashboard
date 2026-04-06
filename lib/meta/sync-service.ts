import { buildCanonicalArchiveSnapshot } from "@/lib/archive/canonical";
import { archiveCommunicationEvent } from "@/lib/archive/communication-archive";
import { getMetaMessagingPageOverridePageIds, getMetaMessagingPageToken } from "@/lib/config/env";
import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import { MetaBusinessClient } from "@/lib/meta/client";

type Row = Record<string, unknown>;
type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function statusFromAccountStatus(value?: number) {
  return value === 1 ? "active" : "warning";
}

// /me/adaccounts returns id as "act_XXXXXXX"; owned_ad_accounts returns
// account_id (numeric) and id as "act_XXXXXXX". Normalize to bare numeric ID.
function normalizeAdAccountId(adAccount: { id?: string; account_id?: string }): string {
  const raw = str(adAccount.account_id || adAccount.id);
  return raw.startsWith("act_") ? raw.slice(4) : raw;
}

function deliveryStatus(value?: string) {
  const normalized = (value ?? "").toUpperCase();

  if (normalized.includes("ACTIVE")) return "active";
  if (normalized.includes("PAUSED")) return "paused";
  return "completed";
}

function buildAudienceSummary(targeting: unknown) {
  const record = targeting && typeof targeting === "object" ? (targeting as Row) : {};
  const geo = record.geo_locations && typeof record.geo_locations === "object" ? (record.geo_locations as Row) : {};
  const countries = Array.isArray(geo.countries) ? (geo.countries as string[]).join(", ") : "";
  return countries || "Audience targeting imported from Meta";
}

function extractLeadValue(fields: Array<{ name?: string; values?: string[] }> | undefined, names: string[]) {
  const lower = new Set(names.map((name) => name.toLowerCase()));
  const match = (fields ?? []).find((item) => lower.has(str(item.name).toLowerCase()));
  return match?.values?.[0] ?? "";
}

function extractLeadCount(actions: Array<{ action_type?: string; value?: string }> | undefined) {
  const leadAction = (actions ?? []).find((item) => str(item.action_type).toLowerCase() === "lead");
  return num(leadAction?.value);
}

function buildThreadId(assetExternalId: string, participantExternalId: string) {
  return `${assetExternalId}:${participantExternalId}`;
}

function pickConversationParticipant(
  participants: Array<{ id?: string; name?: string; username?: string }> | undefined,
  assetExternalId: string
) {
  return (participants ?? []).find((participant) => str(participant.id) && str(participant.id) !== assetExternalId) ?? null;
}

function messageAttachmentType(attachment: Record<string, unknown>) {
  const mimeType = str(attachment.mime_type).toLowerCase();

  if (mimeType.startsWith("image/") || attachment.image_data) return "image";
  if (mimeType.startsWith("video/") || attachment.video_data) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
}

function splitDisplayName(displayName: string) {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { firstName: null, lastName: null };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function mergeObjects(...values: Array<Record<string, unknown> | null | undefined>) {
  const merged: Record<string, unknown> = {};

  for (const value of values) {
    if (!value) continue;
    for (const [key, entry] of Object.entries(value)) {
      if (entry === undefined) continue;
      merged[key] = entry;
    }
  }

  return merged;
}

async function resolveOrCreateContact(client: ReturnType<typeof getSupabaseAdminClient>, input: {
  externalContactKey?: string;
  displayName: string;
  source: "facebook" | "instagram" | "lead_form";
  email?: string;
  phone?: string;
  firstName?: string | null;
  lastName?: string | null;
  customAttributes?: Record<string, unknown>;
}) {
  if (!client) return null;

  const externalContactKey = str(input.externalContactKey);
  const email = str(input.email);
  const phone = str(input.phone);
  const derivedName = splitDisplayName(input.displayName);
  const firstName = input.firstName ?? derivedName.firstName;
  const lastName = input.lastName ?? derivedName.lastName;
  const customAttributes = mergeObjects(input.customAttributes);

  if (externalContactKey) {
    const existingByKey = await client
      .from("contacts")
      .select("id,custom_attributes")
      .eq("external_contact_key", externalContactKey)
      .maybeSingle();

    if (existingByKey.error) throw existingByKey.error;
    if (existingByKey.data) {
      const existingCustomAttributes =
        existingByKey.data.custom_attributes && typeof existingByKey.data.custom_attributes === "object" && !Array.isArray(existingByKey.data.custom_attributes)
          ? (existingByKey.data.custom_attributes as Row)
          : {};
      await client
        .from("contacts")
        .update({
          display_name: input.displayName,
          primary_email: email || null,
          primary_phone: phone || null,
          first_name: firstName,
          last_name: lastName,
          custom_attributes: mergeObjects(existingCustomAttributes, customAttributes),
          last_activity_at: new Date().toISOString()
        })
        .eq("id", existingByKey.data.id);

      return existingByKey.data.id as string;
    }
  }

  if (email) {
    const existingByEmail = await client.from("contacts").select("id,custom_attributes").eq("primary_email", email).maybeSingle();
    if (existingByEmail.error) throw existingByEmail.error;
    if (existingByEmail.data) {
      const existingCustomAttributes =
        existingByEmail.data.custom_attributes && typeof existingByEmail.data.custom_attributes === "object" && !Array.isArray(existingByEmail.data.custom_attributes)
          ? (existingByEmail.data.custom_attributes as Row)
          : {};
      await client
        .from("contacts")
        .update({
          display_name: input.displayName,
          primary_phone: phone || null,
          first_name: firstName,
          last_name: lastName,
          custom_attributes: mergeObjects(existingCustomAttributes, customAttributes),
          last_activity_at: new Date().toISOString()
        })
        .eq("id", existingByEmail.data.id);
      return existingByEmail.data.id as string;
    }
  }

  if (phone) {
    const existingByPhone = await client.from("contacts").select("id,custom_attributes").eq("primary_phone", phone).maybeSingle();
    if (existingByPhone.error) throw existingByPhone.error;
    if (existingByPhone.data) {
      const existingCustomAttributes =
        existingByPhone.data.custom_attributes && typeof existingByPhone.data.custom_attributes === "object" && !Array.isArray(existingByPhone.data.custom_attributes)
          ? (existingByPhone.data.custom_attributes as Row)
          : {};
      await client
        .from("contacts")
        .update({
          display_name: input.displayName,
          primary_email: email || null,
          first_name: firstName,
          last_name: lastName,
          custom_attributes: mergeObjects(existingCustomAttributes, customAttributes),
          last_activity_at: new Date().toISOString()
        })
        .eq("id", existingByPhone.data.id);
      return existingByPhone.data.id as string;
    }
  }

  const inserted = await client
    .from("contacts")
    .insert({
      external_contact_key: externalContactKey || null,
      display_name: input.displayName,
      primary_email: email || null,
      primary_phone: phone || null,
      first_name: firstName,
      last_name: lastName,
      source: input.source,
      stage: "new",
      custom_attributes: customAttributes,
      last_activity_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (inserted.error) throw inserted.error;
  return str((inserted.data as Row).id);
}

async function upsertConversationRecord(client: ReturnType<typeof getSupabaseAdminClient>, input: {
  connectedAssetId: string;
  contactId: string | null;
  platform: "facebook" | "instagram";
  externalThreadId: string;
  subject: string;
  lastMessageAt: string;
}) {
  if (!client) return null;

  const existing = await client
    .from("conversations")
    .select("id")
    .eq("platform", input.platform)
    .eq("external_thread_id", input.externalThreadId)
    .maybeSingle();

  if (existing.error) throw existing.error;

  if (existing.data) {
    const updated = await client
      .from("conversations")
      .update({
        connected_asset_id: input.connectedAssetId,
        contact_id: input.contactId,
        subject: input.subject,
        last_message_at: input.lastMessageAt
      })
      .eq("id", existing.data.id)
      .select("id")
      .single();

    if (updated.error) throw updated.error;
    return str((updated.data as Row).id);
  }

  const inserted = await client
    .from("conversations")
    .insert({
      connected_asset_id: input.connectedAssetId,
      contact_id: input.contactId,
      platform: input.platform,
      external_thread_id: input.externalThreadId,
      subject: input.subject,
      status: "open",
      unread_count: 0,
      last_message_at: input.lastMessageAt
    })
    .select("id")
    .single();

  if (inserted.error) throw inserted.error;
  return str((inserted.data as Row).id);
}

async function upsertHistoricalMessage(client: ReturnType<typeof getSupabaseAdminClient>, input: {
  connectedBusinessId?: string | null;
  connectedAssetId?: string | null;
  conversationId: string;
  externalMessageId: string;
  direction: "inbound" | "outbound";
  senderLabel: string;
  actorExternalId?: string | null;
  counterpartyExternalId?: string | null;
  contactId?: string | null;
  externalThreadId?: string | null;
  sourcePlatform: "facebook" | "instagram";
  body: string;
  sentAt: string;
  attachments: Array<{
    attachmentType: string;
    externalAttachmentId: string | null;
    fileName: string;
    mimeType: string;
    storagePath: string;
    metadata: Record<string, unknown>;
  }>;
  archivePayload: Record<string, unknown>;
}) {
  if (!client) return null;

  const existing = await client
    .from("messages")
    .select("id")
    .eq("external_message_id", input.externalMessageId)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return str((existing.data as Row).id);

  const inserted = await client
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      external_message_id: input.externalMessageId,
      direction: input.direction,
      sender_label: input.senderLabel,
      body: input.body,
      delivery_status: input.direction === "inbound" ? "delivered" : "sent",
      message_state: "active",
      sent_at: input.sentAt
    })
    .select("id")
    .single();

  if (inserted.error) throw inserted.error;
  const messageId = str((inserted.data as Row).id);

  if (input.attachments.length) {
    const attachmentInsert = await client.from("message_attachments").insert(
      input.attachments.map((attachment) => ({
        message_id: messageId,
        attachment_type: attachment.attachmentType,
        external_attachment_id: attachment.externalAttachmentId,
        storage_path: attachment.storagePath,
        file_name: attachment.fileName,
        mime_type: attachment.mimeType,
        metadata: attachment.metadata
      }))
    );

    if (attachmentInsert.error) throw attachmentInsert.error;
  }

  const archive = buildCanonicalArchiveSnapshot(input.archivePayload);
  const archiveInsert = await client.from("message_archive").insert({
    message_id: messageId,
    canonical_payload: archive.canonicalPayload,
    snapshot_sha256: archive.snapshotHash,
    canonical_version: 1,
    retention_class: "standard"
  });

  if (archiveInsert.error) throw archiveInsert.error;

  await archiveCommunicationEvent({
    connectedBusinessId: input.connectedBusinessId ?? null,
    connectedAssetId: input.connectedAssetId ?? null,
    conversationId: input.conversationId,
    messageId,
    contactId: input.contactId ?? null,
    sourcePlatform: input.sourcePlatform,
    channel: input.sourcePlatform,
    direction: input.direction,
    eventType: "historical_message_imported",
    externalEventId: input.externalMessageId,
    externalThreadId: input.externalThreadId ?? null,
    externalMessageId: input.externalMessageId,
    actorExternalId: input.actorExternalId ?? null,
    actorLabel: input.senderLabel,
    counterpartyExternalId: input.counterpartyExternalId ?? null,
    occurredAt: input.sentAt,
    canonicalPayload: archive.canonicalPayload as Record<string, unknown>,
    rawPayload: input.archivePayload,
    attachments: input.attachments.map((attachment) => ({
      attachmentType: attachment.attachmentType,
      externalAttachmentId: attachment.externalAttachmentId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      storagePath: attachment.storagePath,
      metadata: attachment.metadata
    }))
  });

  return messageId;
}

async function importConversationHistoryForPage(input: {
  client: AdminClient;
  businessId: string;
  pageClient: MetaBusinessClient;
  pageId: string;
  pageAssetId: string;
  pageAssetName: string;
  instagramAssetId?: string;
  instagramExternalAssetId?: string;
  instagramAssetName?: string;
  counts: Record<string, number>;
  platforms?: Array<"facebook" | "instagram">;
  conversationSourceDiagnostics: ConversationSourceDiagnostic[];
}) {
  const {
    client,
    businessId,
    pageClient,
    pageId,
    pageAssetId,
    pageAssetName,
    instagramAssetId,
    instagramExternalAssetId,
    instagramAssetName,
    counts,
    platforms,
    conversationSourceDiagnostics
  } = input;
  const allowedPlatforms = platforms?.length ? new Set(platforms) : null;
  const participantProfileCache = new Map<string, Record<string, unknown> | null>();

  const sources = [
    {
      platform: "facebook" as const,
      enabled: !allowedPlatforms || allowedPlatforms.has("facebook"),
      connectedAssetId: pageAssetId,
      requestNodeId: pageId,
      assetExternalId: pageId,
      assetName: pageAssetName
    },
    {
      platform: "instagram" as const,
      enabled: Boolean(instagramAssetId && instagramExternalAssetId) && (!allowedPlatforms || allowedPlatforms.has("instagram")),
      connectedAssetId: instagramAssetId ?? pageAssetId,
      requestNodeId: pageId,
      assetExternalId: instagramExternalAssetId ?? "",
      assetName: instagramAssetName ?? "Instagram"
    }
  ];

  for (const source of sources) {
    if (!source.enabled) continue;

    const diagnostic: ConversationSourceDiagnostic = {
      pageId,
      pageAssetId,
      pageName: pageAssetName,
      platform: source.platform,
      connectedAssetId: source.connectedAssetId,
      assetExternalId: source.assetExternalId,
      assetName: source.assetName,
      requestedNodeId: source.requestNodeId,
      status: "success",
      conversationCount: 0,
      importedConversationCount: 0,
      skippedConversationCount: 0,
      importedMessageCount: 0,
      indexPageCount: 0,
      firstPageRowCount: 0,
      hadPaging: false,
      lastNextUrl: null,
      errorMessage: null
    };

    let pushedDiagnostic = false;

    try {
      // Keep the import split into four light request shapes:
      // 1. thread index, 2. thread detail, 3. message pages, 4. participant profile.
      const conversationIndex = await pageClient.getConversationsWithDiagnostics(source.requestNodeId, source.platform);
      const conversations = conversationIndex.data;

      diagnostic.conversationCount = conversationIndex.rowCount;
      diagnostic.indexPageCount = conversationIndex.pageCount;
      diagnostic.firstPageRowCount = conversationIndex.firstPageRowCount;
      diagnostic.hadPaging = conversationIndex.hadPaging;
      diagnostic.lastNextUrl = conversationIndex.lastNextUrl;

      for (const conversation of conversations) {
        const conversationDetails = await pageClient
          .getConversationDetails(conversation.id, source.platform)
          .catch(() => conversation);

        const participant = pickConversationParticipant(
          conversationDetails.participants?.data ?? conversationDetails.senders?.data ?? conversation.participants?.data ?? conversation.senders?.data,
          source.assetExternalId
        );

        if (!participant?.id) {
          diagnostic.skippedConversationCount += 1;
          continue;
        }

        const participantProfileCacheKey = `${source.platform}:${participant.id}`;
        let participantProfile = participantProfileCache.get(participantProfileCacheKey);

        if (participantProfile === undefined) {
          participantProfile = await pageClient
            .getParticipantProfile(participant.id)
            .then((profile) => profile as unknown as Record<string, unknown>)
            .catch(() => null);
          participantProfileCache.set(participantProfileCacheKey, participantProfile);
        }

        const participantDisplayName = str(
          participantProfile?.name || participant.name || participantProfile?.username || participant.username,
          str(participant.id)
        );
        const derivedName = splitDisplayName(participantDisplayName);

        const contactId = await resolveOrCreateContact(client, {
          externalContactKey: str(participant.id),
          displayName: participantDisplayName,
          source: source.platform,
          email: "",
          phone: "",
          firstName: derivedName.firstName,
          lastName: derivedName.lastName,
          customAttributes: {
            metaParticipantId: str(participant.id),
            metaPlatform: source.platform,
            metaUsername: str(participantProfile?.username || participant.username) || null,
            metaProfilePic: str(participantProfile?.profile_pic) || null,
            metaConversationParticipant: participant,
            metaParticipantProfile: participantProfile ?? null,
            lastMetaSyncAt: new Date().toISOString()
          }
        });

        if (contactId) {
          counts.contacts += 1;
        }

        const threadId = buildThreadId(source.assetExternalId, str(participant.id));
        const conversationId = await upsertConversationRecord(client, {
          connectedAssetId: source.connectedAssetId,
          contactId,
          platform: source.platform,
          externalThreadId: threadId,
          subject: str(conversationDetails.snippet || conversation.snippet, `${participantDisplayName} conversation`).slice(0, 80),
          lastMessageAt: str(conversationDetails.updated_time || conversation.updated_time, new Date().toISOString())
        });

        if (!conversationId) {
          diagnostic.skippedConversationCount += 1;
          continue;
        }

        counts.conversations += 1;
        diagnostic.importedConversationCount += 1;

        await archiveCommunicationEvent({
          connectedBusinessId: businessId,
          connectedAssetId: source.connectedAssetId,
          conversationId,
          contactId,
          sourcePlatform: source.platform,
          channel: source.platform,
          direction: null,
          eventType: "historical_thread_snapshot",
          externalEventId: conversation.id,
          externalThreadId: threadId,
          actorExternalId: source.assetExternalId,
          actorLabel: source.assetName,
          counterpartyExternalId: str(participant.id),
          counterpartyLabel: participantDisplayName,
          occurredAt: str(conversationDetails.updated_time || conversation.updated_time, new Date().toISOString()),
          canonicalPayload: {
            platform: source.platform,
            pageId,
            assetExternalId: source.assetExternalId,
            conversation: conversationDetails,
            participant: participant,
            participantProfile: participantProfile ?? null
          },
          rawPayload: {
            indexConversation: conversation,
            detailConversation: conversationDetails,
            participant,
            participantProfile: participantProfile ?? null
          }
        });

        if (participantProfile) {
          await archiveCommunicationEvent({
            connectedBusinessId: businessId,
            connectedAssetId: source.platform === "facebook" ? pageAssetId : instagramAssetId ?? pageAssetId,
            conversationId,
            contactId,
            sourcePlatform: source.platform,
            channel: source.platform,
            direction: null,
            eventType: "historical_counterparty_profile_snapshot",
            externalEventId: str(participant.id),
            externalThreadId: threadId,
            counterpartyExternalId: str(participant.id),
            counterpartyLabel: participantDisplayName,
            occurredAt: new Date().toISOString(),
            canonicalPayload: {
              platform: source.platform,
              participantId: str(participant.id),
              participantLabel: participantDisplayName,
              profile: participantProfile
            },
            rawPayload: participantProfile
          });
        }

        const messages = await pageClient.getConversationMessages(conversation.id, source.platform);

        for (const message of messages) {
          const from = message.from;
          const externalMessageId = str(message.id);

          if (!externalMessageId) {
            continue;
          }

          const direction = str(from?.id) === source.assetExternalId ? "outbound" : "inbound";
          const senderLabel =
            direction === "outbound"
              ? str(from?.name, source.assetName)
              : str(from?.name || from?.username, participantDisplayName);

          const attachments = (message.attachments?.data ?? []).map((attachment, index) => {
            const typedAttachment = attachment as Record<string, unknown>;
            return {
              attachmentType: messageAttachmentType(typedAttachment),
              externalAttachmentId: str(typedAttachment.id) || null,
              fileName: str(typedAttachment.name, `${messageAttachmentType(typedAttachment)}-${index + 1}`),
              mimeType: str(typedAttachment.mime_type, "application/octet-stream"),
              storagePath: str(typedAttachment.file_url),
              metadata: {
                fileUrl: typedAttachment.file_url
              }
            };
          });

          const body = str(message.message, attachments.length ? "[attachment only]" : "");

          const insertedMessageId = await upsertHistoricalMessage(client, {
            connectedBusinessId: businessId,
            connectedAssetId: source.connectedAssetId,
            conversationId,
            externalMessageId,
            direction,
            senderLabel,
            actorExternalId: str(from?.id),
            counterpartyExternalId: str(participant.id),
            contactId,
            externalThreadId: threadId,
            sourcePlatform: source.platform,
            body,
            sentAt: str(message.created_time, str(conversation.updated_time, new Date().toISOString())),
            attachments,
            archivePayload: {
              importedViaRequests: [
                "thread_index",
                "thread_detail",
                "message_pages",
                "participant_profile"
              ],
              direction,
              senderLabel,
              body,
              conversationDetails,
              participant,
              participantProfile: participantProfile ?? null,
              recipients: message.to?.data ?? [],
              attachments,
              rawMessage: message,
              importedFrom: "meta-history-backfill"
            }
          });

          if (insertedMessageId) {
            counts.messages += 1;
            diagnostic.importedMessageCount += 1;
          }
        }
      }
    } catch (error) {
      diagnostic.status = "error";
      diagnostic.errorMessage = error instanceof Error ? error.message : "Conversation history import failed.";
      conversationSourceDiagnostics.push(diagnostic);
      pushedDiagnostic = true;
      throw error;
    }

    if (!pushedDiagnostic) {
      conversationSourceDiagnostics.push(diagnostic);
    }
  }
}

async function syncPageData(input: {
  client: AdminClient;
  meta: MetaBusinessClient;
  businessId: string;
  page: {
    id: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: { id: string; username?: string; name?: string } | null;
    tasks?: string[];
  };
  startedAt: string;
  counts: Record<string, number>;
  inboxHistorySkips: Array<{
    pageId: string;
    pageAssetId: string;
    pageName: string;
    message: string;
  }>;
  conversationSourceDiagnostics: ConversationSourceDiagnostic[];
  linkableAssetIds?: string[];
  preferProvidedPageData?: boolean;
  conversationPlatforms?: Array<"facebook" | "instagram">;
  includeLeads?: boolean;
}) {
  const {
    client,
    meta,
    businessId,
    page,
    startedAt,
    counts,
    inboxHistorySkips,
    conversationSourceDiagnostics,
    linkableAssetIds,
    preferProvidedPageData = false,
    conversationPlatforms,
    includeLeads = true
  } = input;
  const configuredMessagingPageToken = getMetaMessagingPageToken(page.id);
  const pageDetails =
    preferProvidedPageData || page.access_token || configuredMessagingPageToken
      ? page
      : await meta.getPageDetails(page.id).catch(() => page);
  const messagingPageToken = configuredMessagingPageToken || str(pageDetails.access_token);
  const pageClient = messagingPageToken ? meta.withPageToken(messagingPageToken) : meta;
  const hydratedPageDetails =
    messagingPageToken && (!str(pageDetails.name) || !pageDetails.instagram_business_account)
      ? await pageClient.getPageDetails(page.id).catch(() => pageDetails)
      : pageDetails;

  const pageUpsert = await client
    .from("connected_assets")
    .upsert(
      {
        business_id: businessId,
        asset_type: "facebook_page",
        external_asset_id: page.id,
        asset_name: str(hydratedPageDetails.name || page.name, "Facebook Page"),
        connection_status: "active",
        sync_status: "healthy",
        webhook_health: "unknown",
        granted_scopes: page.tasks ?? [],
        last_synced_at: startedAt
      },
      { onConflict: "asset_type,external_asset_id" }
    )
    .select("id")
    .single();

  if (pageUpsert.error) throw pageUpsert.error;
  const pageAssetId = str((pageUpsert.data as Row).id);
  linkableAssetIds?.push(pageAssetId);
  counts.assets += 1;

  const ig = hydratedPageDetails.instagram_business_account ?? page.instagram_business_account;
  let instagramAssetId: string | undefined;
  let instagramExternalAssetId: string | undefined;
  let instagramAssetName: string | undefined;

  if (ig?.id) {
    const igUpsert = await client
      .from("connected_assets")
      .upsert(
        {
          business_id: businessId,
          asset_type: "instagram_professional",
          external_asset_id: ig.id,
          asset_name: str(ig.name || ig.username, "Instagram professional"),
          connection_status: "active",
          sync_status: "healthy",
          webhook_health: "unknown",
          granted_scopes: [],
          last_synced_at: startedAt
        },
        { onConflict: "asset_type,external_asset_id" }
      )
      .select("id")
      .single();

    if (igUpsert.error) throw igUpsert.error;
    instagramAssetId = str((igUpsert.data as Row).id);
    instagramExternalAssetId = str(ig.id);
    instagramAssetName = str(ig.name || ig.username, "Instagram professional");
    linkableAssetIds?.push(instagramAssetId);
    counts.assets += 1;
  }

  if (messagingPageToken) {
    try {
      await importConversationHistoryForPage({
        client,
        businessId,
        pageClient,
        pageId: page.id,
        pageAssetId,
        pageAssetName: str(hydratedPageDetails.name || page.name, "Facebook Page"),
        instagramAssetId,
        instagramExternalAssetId,
        instagramAssetName,
        counts,
        platforms: conversationPlatforms,
        conversationSourceDiagnostics
      });
    } catch (historyError) {
      const msg = historyError instanceof Error ? historyError.message : "";
      if (msg.includes("403") || msg.includes("190") || msg.includes("200") || msg.includes("10")) {
        counts.inboxHistorySkipped += 1;
        inboxHistorySkips.push({
          pageId: page.id,
          pageAssetId,
          pageName: str(hydratedPageDetails.name || page.name, "Facebook Page"),
          message: msg || "Inbox history import skipped due to Meta access error."
        });
      } else {
        throw historyError;
      }
    }
  }

  if (!includeLeads) {
    return;
  }

  const leadFormClient = messagingPageToken ? pageClient : meta;
  let leadForms: Awaited<ReturnType<typeof meta.getLeadForms>> = [];
  try {
    leadForms = await leadFormClient.getLeadForms(page.id);
  } catch (leadFormError) {
    const msg = leadFormError instanceof Error ? leadFormError.message : "";
    if (!msg.includes("403") && !msg.includes("190") && !msg.includes("200")) {
      throw leadFormError;
    }
  }

  for (const form of leadForms) {
    const formUpsert = await client
      .from("lead_forms")
      .upsert(
        {
          connected_asset_id: pageAssetId,
          external_form_id: form.id,
          form_name: str(form.name, "Lead form"),
          status: str(form.status, "active").toLowerCase() === "active" ? "active" : "paused"
        },
        { onConflict: "external_form_id" }
      )
      .select("id")
      .single();

    if (formUpsert.error) throw formUpsert.error;
    counts.leadForms += 1;
    const formId = str((formUpsert.data as Row).id);

    let leads: Awaited<ReturnType<typeof leadFormClient.getLeads>> = [];
    try {
      leads = await leadFormClient.getLeads(form.id);
    } catch (leadsError) {
      const msg = leadsError instanceof Error ? leadsError.message : "";
      if (!msg.includes("403") && !msg.includes("200")) {
        throw leadsError;
      }
    }

    for (const lead of leads) {
      const fullName = extractLeadValue(lead.field_data, ["full_name", "name", "full name"]);
      const email = extractLeadValue(lead.field_data, ["email"]);
      const phone = extractLeadValue(lead.field_data, ["phone_number", "phone", "mobile_phone"]);
      const contactId = await resolveOrCreateContact(client, {
        externalContactKey: `meta_lead:${lead.id}`,
        displayName: fullName || email || phone || `Lead ${lead.id}`,
        source: "lead_form",
        email,
        phone
      });

      const leadUpsert = await client
        .from("leads")
        .upsert(
          {
            contact_id: contactId,
            lead_form_id: formId,
            external_lead_id: lead.id,
            full_name: fullName,
            email,
            phone,
            campaign_name: str(lead.campaign_name),
            adset_name: str(lead.adset_name),
            ad_name: str(lead.ad_name),
            status: "new",
            raw_submission: {
              field_data: lead.field_data ?? [],
              created_time: lead.created_time,
              campaign_name: lead.campaign_name,
              adset_name: lead.adset_name,
              ad_name: lead.ad_name
            },
            source_channel: "meta_lead_form",
            source_platform: "meta",
            created_at: str(lead.created_time, startedAt)
          },
          { onConflict: "external_lead_id" }
        )
        .select("id")
        .single();

      if (leadUpsert.error) throw leadUpsert.error;
      counts.leads += 1;
    }
  }
}

type SyncCounts = {
  businesses: number;
  assets: number;
  contacts: number;
  conversations: number;
  messages: number;
  inboxHistorySkipped: number;
  adAccounts: number;
  links: number;
  campaigns: number;
  adsets: number;
  ads: number;
  insights: number;
  leadForms: number;
  leads: number;
  leadsSkipped: number;
};

type InboxHistorySkip = {
  pageId: string;
  pageAssetId: string;
  pageName: string;
  message: string;
};

type ConversationSourceDiagnostic = {
  pageId: string;
  pageAssetId: string;
  pageName: string;
  platform: "facebook" | "instagram";
  connectedAssetId: string;
  assetExternalId: string;
  assetName: string;
  requestedNodeId: string;
  status: "success" | "error";
  conversationCount: number;
  importedConversationCount: number;
  skippedConversationCount: number;
  importedMessageCount: number;
  indexPageCount: number;
  firstPageRowCount: number;
  hadPaging: boolean;
  lastNextUrl: string | null;
  errorMessage: string | null;
};

type SyncablePage = {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string; name?: string } | null;
  tasks?: string[];
};

export interface SyncMetaDataOptions {
  businessId?: string;
  assetId?: string;
}

function createSyncCounts(): SyncCounts {
  return {
    businesses: 0,
    assets: 0,
    contacts: 0,
    conversations: 0,
    messages: 0,
    inboxHistorySkipped: 0,
    adAccounts: 0,
    links: 0,
    campaigns: 0,
    adsets: 0,
    ads: 0,
    insights: 0,
    leadForms: 0,
    leads: 0,
    leadsSkipped: 0
  };
}

function buildSyncDetail(
  counts: SyncCounts,
  inboxHistorySkips: InboxHistorySkip[],
  conversationSourceDiagnostics: ConversationSourceDiagnostic[],
  prefix = "Imported"
) {
  const firstDiagnostic = conversationSourceDiagnostics[0];
  const diagnosticSummary = firstDiagnostic
    ? ` First source: ${firstDiagnostic.platform} ${firstDiagnostic.assetName} returned ${firstDiagnostic.conversationCount} conversations across ${firstDiagnostic.indexPageCount} index pages and imported ${firstDiagnostic.importedConversationCount} threads / ${firstDiagnostic.importedMessageCount} messages${firstDiagnostic.errorMessage ? ` (${firstDiagnostic.errorMessage.slice(0, 140)})` : ""}.`
    : "";

  return `${prefix} ${counts.businesses} businesses, ${counts.assets} assets, ${counts.conversations} conversations, ${counts.messages} messages, ${counts.adAccounts} ad accounts, ${counts.campaigns} campaigns, ${counts.adsets} ad sets, ${counts.ads} ads, ${counts.insights} insight rows, ${counts.leadForms} lead forms, and ${counts.leads} leads. Skipped inbox history on ${counts.inboxHistorySkipped} pages when access was missing.${inboxHistorySkips[0] ? ` First skip: ${inboxHistorySkips[0].pageName} - ${inboxHistorySkips[0].message.slice(0, 180)}` : ""}${diagnosticSummary}`;
}

async function getBusinessRow(client: AdminClient, businessId: string) {
  const result = await client
    .from("connected_businesses")
    .select("id,external_business_id,business_name")
    .eq("id", businessId)
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) {
    throw new Error("Selected business was not found.");
  }

  return result.data as Row;
}

async function getAssetRow(client: AdminClient, assetId: string) {
  const result = await client
    .from("connected_assets")
    .select("id,business_id,asset_type,external_asset_id,asset_name")
    .eq("id", assetId)
    .maybeSingle();

  if (result.error) throw result.error;
  if (!result.data) {
    throw new Error("Selected asset was not found.");
  }

  return result.data as Row;
}

async function getAccessiblePagesForBusiness(meta: MetaBusinessClient, businessExternalId: string): Promise<SyncablePage[]> {
  if (businessExternalId === "direct_asset_access") {
    return await meta.getDirectPages();
  }

  if (businessExternalId === "configured_page_access") {
    const pages: SyncablePage[] = [];

    for (const pageId of getMetaMessagingPageOverridePageIds()) {
      const pageToken = getMetaMessagingPageToken(pageId);
      if (!pageToken) continue;
      const pageClient = meta.withPageToken(pageToken);
      const page = await pageClient.getPageDetails(pageId).catch(
        () =>
          ({
            id: pageId,
            name: `Configured Page ${pageId}`,
            access_token: pageToken,
            instagram_business_account: null
          }) satisfies SyncablePage
      );
      pages.push(page);
    }

    return pages;
  }

  return await meta.getBusinessPages(businessExternalId);
}

async function resolvePagesForScopedSync(input: {
  client: AdminClient;
  meta: MetaBusinessClient;
  businessRow: Row;
  assetId?: string;
}): Promise<{
  pages: SyncablePage[];
  conversationPlatforms?: Array<"facebook" | "instagram">;
  includeLeads: boolean;
}> {
  const { client, meta, businessRow, assetId } = input;
  const businessId = str(businessRow.id);
  const businessExternalId = str(businessRow.external_business_id);
  const accessiblePages = await getAccessiblePagesForBusiness(meta, businessExternalId);

  if (!assetId) {
    const fallbackPages =
      accessiblePages.length
        ? accessiblePages
        : (await (async () => {
            const existingPages = await client
              .from("connected_assets")
              .select("external_asset_id,asset_name")
              .eq("business_id", businessId)
              .eq("asset_type", "facebook_page");

            if (existingPages.error) throw existingPages.error;

            return (existingPages.data ?? []).map((row) => ({
              id: str((row as Row).external_asset_id),
              name: str((row as Row).asset_name, "Facebook Page")
            }));
          })());

    return {
      pages: fallbackPages,
      includeLeads: true
    };
  }

  const assetRow = await getAssetRow(client, assetId);
  const assetType = str(assetRow.asset_type);
  const externalAssetId = str(assetRow.external_asset_id);
  const assetName = str(assetRow.asset_name, "Meta asset");

  if (assetType === "facebook_page") {
    return {
      pages: [
        accessiblePages.find((page) => page.id === externalAssetId) ?? {
          id: externalAssetId,
          name: assetName
        }
      ],
      conversationPlatforms: ["facebook"],
      includeLeads: true
    };
  }

  if (assetType === "instagram_professional") {
    const matchedAccessiblePage = accessiblePages.find((page) => str(page.instagram_business_account?.id) === externalAssetId);
    if (matchedAccessiblePage) {
      return {
        pages: [matchedAccessiblePage],
        conversationPlatforms: ["instagram"],
        includeLeads: false
      };
    }

    const existingPages = await client
      .from("connected_assets")
      .select("external_asset_id,asset_name")
      .eq("business_id", businessId)
      .eq("asset_type", "facebook_page");

    if (existingPages.error) throw existingPages.error;

    for (const row of existingPages.data ?? []) {
      const pageId = str((row as Row).external_asset_id);
      if (!pageId) continue;

      const pageToken = getMetaMessagingPageToken(pageId);
      const pageClient = pageToken ? meta.withPageToken(pageToken) : meta;
      const pageDetails = await pageClient.getPageDetails(pageId).catch(() => null);

      if (pageDetails && str(pageDetails.instagram_business_account?.id) === externalAssetId) {
        return {
          pages: [pageDetails],
          conversationPlatforms: ["instagram"],
          includeLeads: false
        };
      }
    }

    throw new Error(`No Facebook Page mapping was found for Instagram asset ${assetName}.`);
  }

  throw new Error("Scoped inbox sync only supports Facebook Page and Instagram professional assets.");
}

async function syncScopedMetaData(options: SyncMetaDataOptions) {
  const client = getSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase admin client is not configured.");
  }

  const meta = new MetaBusinessClient();
  const startedAt = new Date().toISOString();
  const targetLabel = options.assetId ? `asset ${options.assetId}` : options.businessId ? `business ${options.businessId}` : "selected scope";

  const syncJob = await client
    .from("sync_jobs")
    .insert({
      scope: "meta-scoped-import",
      status: "running",
      detail: `Syncing messaging history and leads for ${targetLabel}.`,
      started_at: startedAt
    })
    .select("id")
    .single();

  if (syncJob.error) {
    throw syncJob.error;
  }

  const counts = createSyncCounts();
  const inboxHistorySkips: InboxHistorySkip[] = [];
  const conversationSourceDiagnostics: ConversationSourceDiagnostic[] = [];

  try {
    const businessRow = options.businessId
      ? await getBusinessRow(client, options.businessId)
      : await getBusinessRow(client, str((await getAssetRow(client, str(options.assetId))).business_id));

    counts.businesses = 1;

    const scopePlan = await resolvePagesForScopedSync({
      client,
      meta,
      businessRow,
      assetId: options.assetId
    });

    for (const page of scopePlan.pages) {
      await syncPageData({
        client,
        meta,
        businessId: str(businessRow.id),
        page,
        startedAt,
        counts,
        inboxHistorySkips,
        conversationSourceDiagnostics,
        preferProvidedPageData: true,
        conversationPlatforms: scopePlan.conversationPlatforms,
        includeLeads: scopePlan.includeLeads
      });
    }

    const metadata = {
      counts,
      inboxHistorySkips,
      conversationSourceDiagnostics,
      scope: options
    };

    await client
      .from("sync_jobs")
      .update({
        status: "succeeded",
        completed_at: new Date().toISOString(),
        detail: buildSyncDetail(counts, inboxHistorySkips, conversationSourceDiagnostics, "Scoped sync imported"),
        metadata
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_scoped",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "success",
      detail: "Scoped Meta sync completed successfully.",
      metadata
    });

    return { syncJobId: str(syncJob.data.id), counts };
  } catch (error) {
    const metadata = {
      counts,
      inboxHistorySkips,
      conversationSourceDiagnostics,
      scope: options
    };

    await client
      .from("sync_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        detail: error instanceof Error ? error.message : "Scoped Meta sync failed.",
        metadata
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_scoped",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "error",
      detail: error instanceof Error ? error.message : "Scoped Meta sync failed.",
      metadata
    });

    throw error;
  }
}

export async function syncMetaData(options?: SyncMetaDataOptions) {
  if (options?.businessId || options?.assetId) {
    return syncScopedMetaData(options);
  }

  const client = getSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase admin client is not configured.");
  }

  const meta = new MetaBusinessClient();
  const startedAt = new Date().toISOString();

  const syncJob = await client
    .from("sync_jobs")
    .insert({
      scope: "meta-full-import",
      status: "running",
      detail: "Importing businesses, assets, inbox history, ad accounts, campaigns, ad sets, ads, insights, lead forms, and leads from Meta.",
      started_at: startedAt
    })
    .select("id")
    .single();

  if (syncJob.error) {
    throw syncJob.error;
  }

  const counts = createSyncCounts();
  const inboxHistorySkips: InboxHistorySkip[] = [];
  const conversationSourceDiagnostics: ConversationSourceDiagnostic[] = [];
  const importedPageIds = new Set<string>();

  try {
    let businesses = await meta.getConnectedBusinesses();

    // If the system user has direct asset access but is not a business portfolio
    // member (common when assets are assigned without business membership), fall
    // back to a synthetic single-business entry derived from the system user's
    // directly accessible pages and ad accounts.
    const useFallback = businesses.length === 0;

    if (useFallback) {
      // Use a stable synthetic business ID so re-imports don't create duplicates.
      businesses = [{ id: "direct_asset_access", name: "Direct Asset Access" }];
    }

    for (const business of businesses) {
      const businessUpsert = await client
        .from("connected_businesses")
        .upsert(
          {
            external_business_id: business.id,
            business_name: str(business.name, "Unnamed business"),
            status: "active",
            sync_status: "healthy",
            webhook_health: "unknown",
            // Do not claim messaging/lead scopes unless we can observe them directly.
            granted_scopes: [],
            last_synced_at: startedAt
          },
          { onConflict: "external_business_id" }
        )
        .select("id")
        .single();

      if (businessUpsert.error) throw businessUpsert.error;
      counts.businesses += 1;
      const businessId = str((businessUpsert.data as Row).id);

      const pages = useFallback
        ? await meta.getDirectPages()
        : await meta.getBusinessPages(business.id);
      const linkableAssetIds: string[] = [];

      for (const page of pages) {
        const pageDetails =
          useFallback || page.access_token
            ? page
            : await meta.getPageDetails(page.id).catch(() => page);
        const messagingPageToken = getMetaMessagingPageToken(page.id) || str(pageDetails.access_token);
        const pageClient = messagingPageToken ? meta.withPageToken(messagingPageToken) : meta;

        const pageUpsert = await client
          .from("connected_assets")
          .upsert(
            {
              business_id: businessId,
              asset_type: "facebook_page",
              external_asset_id: page.id,
              asset_name: str(pageDetails.name || page.name, "Facebook Page"),
              connection_status: "active",
              sync_status: "healthy",
              webhook_health: "unknown",
              granted_scopes: page.tasks ?? [],
              last_synced_at: startedAt
            },
            { onConflict: "asset_type,external_asset_id" }
          )
          .select("id")
          .single();

        if (pageUpsert.error) throw pageUpsert.error;
        const pageAssetId = str((pageUpsert.data as Row).id);
        linkableAssetIds.push(pageAssetId);
        counts.assets += 1;

        const ig = pageDetails.instagram_business_account ?? page.instagram_business_account;
        let instagramAssetId: string | undefined;
        let instagramExternalAssetId: string | undefined;
        let instagramAssetName: string | undefined;
        if (ig?.id) {
          const igUpsert = await client
            .from("connected_assets")
            .upsert(
              {
              business_id: businessId,
              asset_type: "instagram_professional",
              external_asset_id: ig.id,
              asset_name: str(ig.name || ig.username, "Instagram professional"),
              connection_status: "active",
              sync_status: "healthy",
              webhook_health: "unknown",
              granted_scopes: [],
              last_synced_at: startedAt
            },
            { onConflict: "asset_type,external_asset_id" }
          )
            .select("id")
            .single();

          if (igUpsert.error) throw igUpsert.error;
          instagramAssetId = str((igUpsert.data as Row).id);
          instagramExternalAssetId = str(ig.id);
          instagramAssetName = str(ig.name || ig.username, "Instagram professional");
          linkableAssetIds.push(instagramAssetId);
          counts.assets += 1;
        }

        if (messagingPageToken) {
          try {
            await importConversationHistoryForPage({
              client,
              businessId,
              pageClient,
              pageId: page.id,
              pageAssetId,
              pageAssetName: str(pageDetails.name || page.name, "Facebook Page"),
              instagramAssetId,
              instagramExternalAssetId,
              instagramAssetName,
              counts,
              conversationSourceDiagnostics
            });
          } catch (historyError) {
            const msg = historyError instanceof Error ? historyError.message : "";
            if (msg.includes("403") || msg.includes("190") || msg.includes("200") || msg.includes("10")) {
              counts.inboxHistorySkipped += 1;
              inboxHistorySkips.push({
                pageId: page.id,
                pageAssetId,
                pageName: str(pageDetails.name || page.name, "Facebook Page"),
                message: msg || "Inbox history import skipped due to Meta access error."
              });
            } else {
              throw historyError;
            }
          }
        }

        // Lead forms and leads require leads_retrieval permission on the page
        // token. This may not be granted; skip gracefully if forbidden so the
        // rest of the import (pages, ad accounts, campaigns, insights) succeeds.
        const leadFormClient = pageDetails.access_token ? pageClient : meta;
        let leadForms: Awaited<ReturnType<typeof meta.getLeadForms>> = [];
        try {
          leadForms = await leadFormClient.getLeadForms(page.id);
        } catch (leadFormError) {
          const msg = leadFormError instanceof Error ? leadFormError.message : "";
          if (msg.includes("403") || msg.includes("190") || msg.includes("200")) {
            // Permission not granted — skip leads for this page, continue import
          } else {
            throw leadFormError;
          }
        }

        for (const form of leadForms) {
          const formUpsert = await client
            .from("lead_forms")
            .upsert(
              {
                connected_asset_id: pageAssetId,
                external_form_id: form.id,
                form_name: str(form.name, "Lead form"),
                status: str(form.status, "active").toLowerCase() === "active" ? "active" : "paused"
              },
              { onConflict: "external_form_id" }
            )
            .select("id")
            .single();

          if (formUpsert.error) throw formUpsert.error;
          counts.leadForms += 1;
          const formId = str((formUpsert.data as Row).id);

          let leads: Awaited<ReturnType<typeof leadFormClient.getLeads>> = [];
          try {
            leads = await leadFormClient.getLeads(form.id);
          } catch (leadsError) {
            const msg = leadsError instanceof Error ? leadsError.message : "";
            if (msg.includes("403") || msg.includes("200")) {
              // Permission not granted — skip leads for this form
            } else {
              throw leadsError;
            }
          }

          for (const lead of leads) {
            const fullName = extractLeadValue(lead.field_data, ["full_name", "name", "full name"]);
            const email = extractLeadValue(lead.field_data, ["email"]);
            const phone = extractLeadValue(lead.field_data, ["phone_number", "phone", "mobile_phone"]);
            const contactId = await resolveOrCreateContact(client, {
              externalContactKey: `meta_lead:${lead.id}`,
              displayName: fullName || email || phone || `Lead ${lead.id}`,
              source: "lead_form",
              email,
              phone
            });

            const leadUpsert = await client
              .from("leads")
              .upsert(
                {
                  contact_id: contactId,
                  lead_form_id: formId,
                  external_lead_id: lead.id,
                  full_name: fullName,
                  email,
                  phone,
                  campaign_name: str(lead.campaign_name),
                  adset_name: str(lead.adset_name),
                  ad_name: str(lead.ad_name),
                  status: "new",
                  raw_submission: {
                    field_data: lead.field_data ?? [],
                    created_time: lead.created_time,
                    campaign_name: lead.campaign_name,
                    adset_name: lead.adset_name,
                    ad_name: lead.ad_name
                  },
                  source_channel: "meta_lead_form",
                  source_platform: "meta",
                  created_at: str(lead.created_time, startedAt)
                },
                { onConflict: "external_lead_id" }
              )
              .select("id")
              .single();

            if (leadUpsert.error) throw leadUpsert.error;
            counts.leads += 1;
          }
        }

        importedPageIds.add(page.id);
      }

      const adAccounts = useFallback
        ? await meta.getDirectAdAccounts()
        : await meta.getBusinessAdAccounts(business.id);

      for (const adAccount of adAccounts) {
        const adAccountAssetUpsert = await client
          .from("connected_assets")
          .upsert(
            {
              business_id: businessId,
              asset_type: "ad_account",
              external_asset_id: normalizeAdAccountId(adAccount),
              asset_name: str(adAccount.name, "Ad account"),
              connection_status: statusFromAccountStatus(adAccount.account_status),
              sync_status: "healthy",
              webhook_health: "unknown",
              granted_scopes: ["ads_read"],
              last_synced_at: startedAt
            },
            { onConflict: "asset_type,external_asset_id" }
          )
          .select("id")
          .single();

        if (adAccountAssetUpsert.error) throw adAccountAssetUpsert.error;
        const adAccountAssetId = str((adAccountAssetUpsert.data as Row).id);
        counts.assets += 1;

        const adAccountUpsert = await client
          .from("ad_accounts")
          .upsert(
            {
              connected_asset_id: adAccountAssetId,
              external_account_id: normalizeAdAccountId(adAccount),
              account_name: str(adAccount.name, "Ad account"),
              currency: str(adAccount.currency, "USD"),
              status: statusFromAccountStatus(adAccount.account_status)
            },
            { onConflict: "external_account_id" }
          )
          .select("id")
          .single();

        if (adAccountUpsert.error) throw adAccountUpsert.error;
        counts.adAccounts += 1;
        const adAccountId = str((adAccountUpsert.data as Row).id);

        if (linkableAssetIds.length) {
          const linkPayload = linkableAssetIds.map((assetId) => ({
            ad_account_id: adAccountId,
            connected_asset_id: assetId,
            relationship_type: "business_scope"
          }));

          const linksUpsert = await client
            .from("ad_account_asset_links")
            .upsert(linkPayload, { onConflict: "ad_account_id,connected_asset_id" })
            .select("id");

          if (linksUpsert.error) throw linksUpsert.error;
          counts.links += linksUpsert.data?.length ?? linkPayload.length;
        }

        const campaigns = await meta.getCampaigns(normalizeAdAccountId(adAccount));
        const campaignIdsByExternalId = new Map<string, string>();

        for (const campaign of campaigns) {
          const campaignUpsert = await client
            .from("campaigns")
            .upsert(
              {
                ad_account_id: adAccountId,
                external_campaign_id: campaign.id,
                campaign_name: str(campaign.name, "Campaign"),
                objective: str(campaign.objective, "Unknown"),
                status: deliveryStatus(campaign.effective_status || campaign.status),
                budget_daily: num(campaign.daily_budget)
              },
              { onConflict: "external_campaign_id" }
            )
            .select("id")
            .single();

          if (campaignUpsert.error) throw campaignUpsert.error;
          campaignIdsByExternalId.set(campaign.id, str((campaignUpsert.data as Row).id));
          counts.campaigns += 1;
        }

        const adsets = await meta.getAdSets(normalizeAdAccountId(adAccount));
        const adsetIdsByExternalId = new Map<string, string>();

        for (const adset of adsets) {
          const campaignId = campaignIdsByExternalId.get(str(adset.campaign_id)) ?? Array.from(campaignIdsByExternalId.values())[0];
          if (!campaignId) continue;

          const adsetUpsert = await client
            .from("adsets")
            .upsert(
              {
                campaign_id: campaignId,
                external_adset_id: adset.id,
                adset_name: str(adset.name, "Ad set"),
                audience_summary: buildAudienceSummary(adset.targeting),
                status: deliveryStatus(adset.effective_status || adset.status)
              },
              { onConflict: "external_adset_id" }
            )
            .select("id")
            .single();

          if (adsetUpsert.error) throw adsetUpsert.error;
          adsetIdsByExternalId.set(adset.id, str((adsetUpsert.data as Row).id));
          counts.adsets += 1;
        }

        const ads = await meta.getAds(normalizeAdAccountId(adAccount));

        for (const ad of ads) {
          const adsetId = adsetIdsByExternalId.get(str(ad.adset_id)) ?? Array.from(adsetIdsByExternalId.values())[0];
          if (!adsetId) continue;

          const adUpsert = await client
            .from("ads")
            .upsert(
              {
                adset_id: adsetId,
                external_ad_id: ad.id,
                ad_name: str(ad.name, "Ad"),
                creative_name: str(ad.creative?.name || ad.creative?.id, "Creative"),
                status: deliveryStatus(ad.effective_status || ad.status)
              },
              { onConflict: "external_ad_id" }
            )
            .select("id")
            .single();

          if (adUpsert.error) throw adUpsert.error;
          counts.ads += 1;
        }

        const entityTargets = [
          { entityType: "account", entityId: adAccountId, path: `/act_${normalizeAdAccountId(adAccount)}/insights` },
          ...Array.from(campaignIdsByExternalId.entries()).map(([externalId, entityId]) => ({
            entityType: "campaign",
            entityId,
            path: `/${externalId}/insights`
          })),
          ...Array.from(adsetIdsByExternalId.entries()).map(([externalId, entityId]) => ({
            entityType: "adset",
            entityId,
            path: `/${externalId}/insights`
          }))
        ] as const;

        for (const target of entityTargets) {
          const insights = await meta.getInsights(target.path);

          if (!insights.length) {
            continue;
          }

          const payload = insights.map((insight) => ({
            entity_type: target.entityType,
            entity_id: target.entityId,
            insight_date: str(insight.date_start, startedAt.slice(0, 10)),
            impressions: num(insight.impressions),
            clicks: num(insight.clicks),
            leads: extractLeadCount(insight.actions),
            spend: num(insight.spend),
            ctr: num(insight.ctr),
            cpl: extractLeadCount(insight.actions) > 0 ? num(insight.spend) / extractLeadCount(insight.actions) : 0
          }));

          const insightsUpsert = await client
            .from("ad_insights_daily")
            .upsert(payload, { onConflict: "entity_type,entity_id,insight_date" })
            .select("id");

          if (insightsUpsert.error) throw insightsUpsert.error;
          counts.insights += insightsUpsert.data?.length ?? payload.length;
        }
      }
    }

    const missingConfiguredPageIds = getMetaMessagingPageOverridePageIds().filter((pageId) => !importedPageIds.has(pageId));

    if (missingConfiguredPageIds.length) {
      const configuredBusinessUpsert = await client
        .from("connected_businesses")
        .upsert(
          {
            external_business_id: "configured_page_access",
            business_name: "Configured Page Access",
            status: "active",
            sync_status: "healthy",
            webhook_health: "unknown",
            granted_scopes: [],
            last_synced_at: startedAt
          },
          { onConflict: "external_business_id" }
        )
        .select("id")
        .single();

      if (configuredBusinessUpsert.error) throw configuredBusinessUpsert.error;
      counts.businesses += 1;
      const configuredBusinessId = str((configuredBusinessUpsert.data as Row).id);

      for (const pageId of missingConfiguredPageIds) {
        const pageToken = getMetaMessagingPageToken(pageId);
        const pageClient = meta.withPageToken(pageToken);
        const configuredPage = await pageClient.getPageDetails(pageId).catch(() => ({
          id: pageId,
          name: `Configured Page ${pageId}`,
          instagram_business_account: null
        }));

        await syncPageData({
          client,
          meta,
          businessId: configuredBusinessId,
          page: configuredPage,
          startedAt,
          counts,
          inboxHistorySkips,
          conversationSourceDiagnostics,
          preferProvidedPageData: true
        });

        importedPageIds.add(pageId);
      }
    }

    const metadata = {
      counts,
      inboxHistorySkips,
      conversationSourceDiagnostics
    };

    await client
      .from("sync_jobs")
      .update({
        status: "succeeded",
        completed_at: new Date().toISOString(),
        detail: buildSyncDetail(counts, inboxHistorySkips, conversationSourceDiagnostics),
        metadata
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_full",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "success",
      detail: "Meta import completed successfully.",
      metadata
    });

    return { syncJobId: str(syncJob.data.id), counts };
  } catch (error) {
    const metadata = {
      counts,
      inboxHistorySkips,
      conversationSourceDiagnostics
    };

    await client
      .from("sync_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        detail: error instanceof Error ? error.message : "Meta import failed.",
        metadata
      })
      .eq("id", syncJob.data.id);

    await client.from("audit_logs").insert({
      actor_label: "system",
      action: "meta.import_full",
      target_type: "sync_job",
      target_id: str(syncJob.data.id),
      outcome: "error",
      detail: error instanceof Error ? error.message : "Meta import failed.",
      metadata
    });

    throw error;
  }
}
