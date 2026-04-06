import { getSupabaseAdminClient } from "@/lib/db/supabase/admin";
import type { DashboardScope } from "@/lib/dashboard/scope";
import type {
  Ad,
  AdAccount,
  AdInsightDaily,
  AdSet,
  AuditLog,
  AutoResponderRule,
  Campaign,
  CommunicationArchiveAttachment,
  CommunicationArchiveEvent,
  ConnectedAsset,
  ConnectedBusiness,
  CommandExecution,
  CommandTemplate,
  Contact,
  Conversation,
  ConversationNote,
  IntegrationTarget,
  Lead,
  LeadActivity,
  LeadDestination,
  Message,
  MessageArchiveRecord,
  MessageAttachment,
  RawWebhookEvent,
  SyncJob
} from "@/types/domain";
import type { MetaAssetType } from "@/types/meta";

type Row = Record<string, unknown>;

const mockAdAccounts: AdAccount[] = [];
const mockAdInsightsDaily: AdInsightDaily[] = [];
const mockAdSets: AdSet[] = [];
const mockAds: Ad[] = [];
const mockAuditLogs: AuditLog[] = [];
const mockAutoResponderRules: AutoResponderRule[] = [];
const mockCampaigns: Campaign[] = [];
const mockCommunicationArchiveEvents: CommunicationArchiveEvent[] = [];
const mockConnectedAssets: ConnectedAsset[] = [];
const mockConnectedBusinesses: ConnectedBusiness[] = [];
const mockCommandExecutions: CommandExecution[] = [];
const mockCommandTemplates: CommandTemplate[] = [];
const mockContacts: Contact[] = [];
const mockConversationNotes: ConversationNote[] = [];
const mockConversations: Conversation[] = [];
const mockIntegrationTargets: IntegrationTarget[] = [];
const mockLeadActivities: LeadActivity[] = [];
const mockLeadDestinations: LeadDestination[] = [];
const mockLeadForms: Array<{ id: string; assetId: string }> = [];
const mockLeads: Lead[] = [];
const mockMessageArchive: MessageArchiveRecord[] = [];
const mockMessages: Message[] = [];
const mockRawWebhookEvents: RawWebhookEvent[] = [];
const mockSyncJobs: SyncJob[] = [];

export interface DashboardScopeOptions {
  businesses: Array<{ id: string; name: string }>;
  assets: Array<{ id: string; name: string; type: ConnectedAsset["type"]; businessId: string }>;
  adAccounts: Array<{ id: string; name: string; businessIds?: string[]; businessNames?: string[] }>;
}

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const nullable = (value: unknown) => (typeof value === "string" ? value : null);
const iso = (value: unknown) => (typeof value === "string" && value ? value : new Date().toISOString());
const arr = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
const obj = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {});
const num = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

async function liveOrFallback<T>(live: () => Promise<T>, fallback: () => T | Promise<T>) {
  if (!getSupabaseAdminClient()) return fallback();
  try {
    return await live();
  } catch {
    return fallback();
  }
}

async function userMap() {
  const client = getSupabaseAdminClient();
  if (!client) return new Map<string, string>();
  const result = await client.from("app_users").select("id,full_name,email");
  if (result.error) throw result.error;
  return new Map((result.data ?? []).map((row) => [str((row as Row).id), str((row as Row).full_name) || str((row as Row).email) || "User"]));
}

async function scopeAssetIds(scope?: DashboardScope) {
  const client = getSupabaseAdminClient();
  if (!client) return null;
  if (scope?.assetId) {
    let query = client.from("connected_assets").select("id").eq("id", scope.assetId);
    if (scope.businessId) query = query.eq("business_id", scope.businessId);
    const assetResult = await query;
    if (assetResult.error) throw assetResult.error;
    return (assetResult.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
  }
  if (!scope?.businessId) return null;
  const result = await client.from("connected_assets").select("id").eq("business_id", scope.businessId);
  if (result.error) throw result.error;
  return (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
}

async function scopeLeadFormIds(scope?: DashboardScope) {
  const client = getSupabaseAdminClient();
  const assetIds = await scopeAssetIds(scope);
  if (!client || assetIds === null) return null;
  if (!assetIds.length) return [];
  const result = await client.from("lead_forms").select("id").in("connected_asset_id", assetIds);
  if (result.error) throw result.error;
  return (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
}

async function adAccountLinks() {
  const client = getSupabaseAdminClient();
  if (!client) return [];

  const result = await client
    .from("ad_account_asset_links")
    .select("ad_account_id,connected_asset_id,relationship_type,connected_assets(id,asset_name,business_id)");

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []) as Row[];
}

function mapBusiness(row: Row, assetCount: number): ConnectedBusiness {
  return {
    id: str(row.id),
    name: str(row.business_name, "Unnamed business"),
    businessManagerId: str(row.external_business_id),
    status: str(row.status, "pending") as ConnectedBusiness["status"],
    syncStatus: str(row.sync_status, "pending") as ConnectedBusiness["syncStatus"],
    webhookHealth: str(row.webhook_health, "unknown") as ConnectedBusiness["webhookHealth"],
    grantedScopes: arr(row.granted_scopes),
    connectedAssetCount: assetCount,
    lastSyncedAt: iso(row.last_synced_at ?? row.updated_at)
  };
}

function mapAsset(row: Row): ConnectedAsset {
  return {
    id: str(row.id),
    businessId: str(row.business_id),
    type: str(row.asset_type, "facebook_page") as MetaAssetType,
    assetId: str(row.external_asset_id),
    name: str(row.asset_name, "Unnamed asset"),
    status: str(row.connection_status, "pending") as ConnectedAsset["status"],
    syncStatus: str(row.sync_status, "pending") as ConnectedAsset["syncStatus"],
    webhookHealth: str(row.webhook_health, "unknown") as ConnectedAsset["webhookHealth"],
    grantedScopes: arr(row.granted_scopes),
    tokenLastRotatedAt: iso(row.token_last_rotated_at ?? row.updated_at),
    lastSyncedAt: iso(row.last_synced_at ?? row.updated_at)
  };
}

function mapContact(row: Row, owner: string): Contact {
  return {
    id: str(row.id),
    displayName: str(row.display_name, "Unknown contact"),
    primaryEmail: str(row.primary_email),
    primaryPhone: str(row.primary_phone),
    source: str(row.source, "manual") as Contact["source"],
    stage: str(row.stage, "new") as Contact["stage"],
    owner,
    tags: arr(row.tags),
    lastActivityAt: iso(row.last_activity_at ?? row.updated_at),
    firstName: nullable(row.first_name),
    lastName: nullable(row.last_name),
    alternatePhone: nullable(row.alternate_phone),
    companyName: nullable(row.company_name),
    jobTitle: nullable(row.job_title),
    street1: nullable(row.street_1),
    street2: nullable(row.street_2),
    city: nullable(row.city),
    state: nullable(row.state),
    postalCode: nullable(row.postal_code),
    country: nullable(row.country),
    leadStatus: nullable(row.lead_status),
    pipelineStage: nullable(row.pipeline_stage),
    lifecycleStage: nullable(row.lifecycle_stage),
    leadScore: num(row.lead_score),
    priorityLevel: nullable(row.priority_level),
    preferredContactMethod: (nullable(row.preferred_contact_method) as Contact["preferredContactMethod"]) ?? null,
    preferredContactTime: nullable(row.preferred_contact_time),
    doNotCall: Boolean(row.do_not_call),
    doNotEmail: Boolean(row.do_not_email),
    doNotSms: Boolean(row.do_not_sms),
    marketingOptIn: Boolean(row.marketing_opt_in),
    firstTouchSource: nullable(row.first_touch_source),
    firstTouchCampaign: nullable(row.first_touch_campaign),
    lastTouchSource: nullable(row.last_touch_source),
    lastTouchCampaign: nullable(row.last_touch_campaign),
    latestSessionId: nullable(row.latest_session_id),
    latestVisitorId: nullable(row.latest_visitor_id),
    segment: nullable(row.segment),
    notes: nullable(row.notes),
    customAttributes: obj(row.custom_attributes)
  };
}

function mapLead(row: Row, owner: string): Lead {
  return {
    id: str(row.id),
    contactId: str(row.contact_id),
    formId: str(row.lead_form_id),
    fullName: str(row.full_name),
    email: str(row.email),
    phone: str(row.phone),
    campaignName: str(row.campaign_name),
    adsetName: str(row.adset_name),
    adName: str(row.ad_name),
    status: str(row.status, "new") as Lead["status"],
    owner,
    createdAt: iso(row.created_at),
    visitorProfileId: nullable(row.visitor_profile_id),
    sessionId: nullable(row.session_id),
    formSubmissionId: nullable(row.form_submission_id),
    sourceChannel: nullable(row.source_channel),
    sourcePlatform: nullable(row.source_platform),
    convertedAt: nullable(row.converted_at)
  };
}

function mapArchive(row: Row): MessageArchiveRecord {
  return {
    id: str(row.id),
    messageId: str(row.message_id),
    snapshotHash: str(row.snapshot_sha256),
    canonicalVersion: num(row.canonical_version, 1),
    createdAt: iso(row.created_at),
    retentionClass: str(row.retention_class, "standard") as MessageArchiveRecord["retentionClass"],
    canonicalPayload: obj(row.canonical_payload)
  };
}

function mapCommunicationArchiveAttachment(row: Row): CommunicationArchiveAttachment {
  const metadata = obj(row.metadata);

  return {
    id: str(row.id),
    archiveEventId: str(row.archive_event_id),
    kind: str(row.attachment_type, "file"),
    externalAttachmentId: nullable(row.external_attachment_id),
    fileName: str(row.file_name, "attachment"),
    mimeType: str(row.mime_type, "application/octet-stream"),
    url: str(row.storage_path) || str(metadata.url) || str(metadata.fileUrl),
    metadata
  };
}

function mapCommunicationArchiveEvent(
  row: Row,
  attachmentCount: number,
  attachments: CommunicationArchiveAttachment[],
  contact: Contact | null
): CommunicationArchiveEvent {
  return {
    id: str(row.id),
    connectedBusinessId: nullable(row.connected_business_id),
    connectedAssetId: nullable(row.connected_asset_id),
    conversationId: nullable(row.conversation_id),
    messageId: nullable(row.message_id),
    contactId: nullable(row.contact_id),
    sourcePlatform: str(row.source_platform, "unknown") as CommunicationArchiveEvent["sourcePlatform"],
    channel: str(row.channel, "meta") as CommunicationArchiveEvent["channel"],
    direction: row.direction ? (str(row.direction) as CommunicationArchiveEvent["direction"]) : null,
    eventType: str(row.event_type, "event"),
    externalEventId: nullable(row.external_event_id),
    externalThreadId: nullable(row.external_thread_id),
    externalMessageId: nullable(row.external_message_id),
    actorExternalId: nullable(row.actor_external_id),
    actorLabel: nullable(row.actor_label),
    counterpartyExternalId: nullable(row.counterparty_external_id),
    counterpartyLabel: nullable(row.counterparty_label) ?? contact?.displayName ?? null,
    occurredAt: nullable(row.occurred_at),
    archivedAt: iso(row.archived_at ?? row.created_at),
    retentionLocked: Boolean(row.retention_locked),
    payloadSha256: str(row.payload_sha256),
    attachmentCount,
    canonicalPayload: obj(row.canonical_payload),
    rawPayload: obj(row.raw_payload),
    attachments,
    contact
  };
}

function previewFromArchiveEvent(row: Row) {
  const canonicalPayload = obj(row.canonical_payload);
  const rawPayload = obj(row.raw_payload);
  const canonicalConversation = obj(canonicalPayload.conversation);
  const rawDetailConversation = obj(rawPayload.detailConversation);
  const rawIndexConversation = obj(rawPayload.indexConversation);

  return (
    str(canonicalPayload.body) ||
    str(canonicalConversation.snippet) ||
    str(rawDetailConversation.snippet) ||
    str(rawIndexConversation.snippet)
  );
}

function mockByBusiness<T>(items: T[], predicate: (item: T, businessId: string) => boolean, scope?: DashboardScope) {
  if (!scope?.businessId) return items;
  return items.filter((item) => predicate(item, scope.businessId!));
}

export const dashboardRepository = {
  getScopeOptions: async (): Promise<DashboardScopeOptions> =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const [businessesResult, assetsResult, accountsResult, links] = await Promise.all([
          client.from("connected_businesses").select("id,business_name").order("business_name"),
          client.from("connected_assets").select("id,business_id,asset_name,asset_type").order("asset_name"),
          client.from("ad_accounts").select("id,account_name").order("account_name"),
          adAccountLinks()
        ]);
        if (businessesResult.error || assetsResult.error || accountsResult.error) {
          throw businessesResult.error ?? assetsResult.error ?? accountsResult.error;
        }
        const businessNames = new Map((businessesResult.data ?? []).map((row) => [str((row as Row).id), str((row as Row).business_name)]));
        return {
          businesses: (businessesResult.data ?? []).map((row) => ({ id: str((row as Row).id), name: str((row as Row).business_name) })),
          assets: (assetsResult.data ?? []).map((row) => ({
            id: str((row as Row).id),
            name: str((row as Row).asset_name),
            type: str((row as Row).asset_type, "facebook_page") as ConnectedAsset["type"],
            businessId: str((row as Row).business_id)
          })),
          adAccounts: (accountsResult.data ?? []).map((row) => {
            const accountLinks = links.filter((link) => str(link.ad_account_id) === str((row as Row).id));
            const businessIds = Array.from(
              new Set(
                accountLinks
                  .map((link) => {
                    const asset = link.connected_assets as Row | null | undefined;
                    return asset ? str(asset.business_id) : "";
                  })
                  .filter(Boolean)
              )
            );

            return {
              id: str((row as Row).id),
              name: str((row as Row).account_name),
              businessIds,
              businessNames: businessIds.map((businessId) => businessNames.get(businessId) ?? businessId)
            };
          })
        };
      },
      () => ({
        businesses: mockConnectedBusinesses.map((business) => ({ id: business.id, name: business.name })),
        assets: mockConnectedAssets.map((asset) => ({ id: asset.id, name: asset.name, type: asset.type, businessId: asset.businessId })),
        adAccounts: mockAdAccounts.map((account) => ({ id: account.id, name: account.name, businessIds: [], businessNames: [] }))
      })
    ),

  getConnectedBusinesses: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("connected_businesses").select("*").order("business_name");
        if (scope?.businessId) query = query.eq("id", scope.businessId);
        const businessesResult = await query;
        if (businessesResult.error) throw businessesResult.error;
        const ids = (businessesResult.data ?? []).map((row) => str((row as Row).id));
        const assetsResult = ids.length ? await client.from("connected_assets").select("business_id").in("business_id", ids) : { data: [], error: null };
        if (assetsResult.error) throw assetsResult.error;
        const counts = new Map<string, number>();
        for (const row of assetsResult.data ?? []) counts.set(str((row as Row).business_id), (counts.get(str((row as Row).business_id)) ?? 0) + 1);
        return (businessesResult.data ?? []).map((row) => mapBusiness(row as Row, counts.get(str((row as Row).id)) ?? 0));
      },
      () => mockByBusiness(mockConnectedBusinesses, (business, businessId) => business.id === businessId, scope)
    ),

  getConnectedAssets: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("connected_assets").select("*").order("asset_name");
        if (scope?.businessId) query = query.eq("business_id", scope.businessId);
        if (scope?.assetId) query = query.eq("id", scope.assetId);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => mapAsset(row as Row));
      },
      () =>
        (scope?.assetId
          ? mockConnectedAssets.filter((asset) => asset.id === scope.assetId)
          : mockByBusiness(mockConnectedAssets, (asset, businessId) => asset.businessId === businessId, scope))
    ),

  getConnectedAssetById: async (assetId: string, scope?: DashboardScope) =>
    (await dashboardRepository.getConnectedAssets(scope)).find((item) => item.id === assetId) ?? null,

  getContacts: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        let contactIds: string[] | null = null;
        if (scope?.businessId) {
          const assetIds = await scopeAssetIds(scope);
          if (!assetIds?.length) return [];
          const [conversationContacts, leadFormIds] = await Promise.all([
            client.from("conversations").select("contact_id").in("connected_asset_id", assetIds),
            scopeLeadFormIds(scope)
          ]);
          if (conversationContacts.error) throw conversationContacts.error;
          const leadContacts = leadFormIds?.length ? await client.from("leads").select("contact_id").in("lead_form_id", leadFormIds) : { data: [], error: null };
          if (leadContacts.error) throw leadContacts.error;
          contactIds = [...(conversationContacts.data ?? []), ...(leadContacts.data ?? [])].map((row) => str((row as Row).contact_id)).filter(Boolean);
        }
        if (contactIds && !contactIds.length) return [];
        let query = client.from("contacts").select("*").order("last_activity_at", { ascending: false, nullsFirst: false });
        if (contactIds) query = query.in("id", Array.from(new Set(contactIds)));
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => mapContact(row as Row, owners.get(str((row as Row).owner_user_id)) ?? "Unassigned"));
      },
      () =>
        mockByBusiness(
          mockContacts,
          (contact, businessId) =>
            mockConversations.some((conversation) => conversation.contactId === contact.id && conversation.businessId === businessId) ||
            mockLeads.some((lead) => lead.contactId === contact.id && mockLeadForms.some((form) => form.id === lead.formId && mockConnectedAssets.some((asset) => asset.id === form.assetId && asset.businessId === businessId))),
          scope
        )
    ),

  getContactById: async (contactId: string, scope?: DashboardScope) => (await dashboardRepository.getContacts(scope)).find((item) => item.id === contactId) ?? null,

  getConversations: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const [contacts, assets, owners] = await Promise.all([dashboardRepository.getContacts(scope), dashboardRepository.getConnectedAssets(scope), userMap()]);
        const assetIds = scope?.businessId || scope?.assetId ? await scopeAssetIds(scope) : null;
        if (assetIds && !assetIds.length) return [];
        let query = client.from("conversations").select("*").order("last_message_at", { ascending: false, nullsFirst: false });
        if (assetIds) query = query.in("connected_asset_id", assetIds);
        const result = await query;
        if (result.error) throw result.error;
        const conversationIds = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const [tagsResult, latestMessagesResult, archivePreviewResult] = await Promise.all([
          conversationIds.length
            ? client.from("message_tags").select("conversation_id,tag").in("conversation_id", conversationIds)
            : Promise.resolve({ data: [], error: null }),
          conversationIds.length
            ? client
                .from("messages")
                .select("conversation_id,body,sent_at,created_at")
                .in("conversation_id", conversationIds)
                .order("sent_at", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false, nullsFirst: false })
            : Promise.resolve({ data: [], error: null }),
          conversationIds.length
            ? client
                .from("communication_archive_events")
                .select("conversation_id,canonical_payload,raw_payload,occurred_at,archived_at")
                .in("conversation_id", conversationIds)
                .in("event_type", ["historical_message_imported", "historical_thread_snapshot"])
                .order("occurred_at", { ascending: false, nullsFirst: false })
                .order("archived_at", { ascending: false, nullsFirst: false })
            : Promise.resolve({ data: [], error: null })
        ]);
        if (tagsResult.error || latestMessagesResult.error || archivePreviewResult.error) {
          throw tagsResult.error ?? latestMessagesResult.error ?? archivePreviewResult.error;
        }
        const tagMap = new Map<string, string[]>();
        for (const row of tagsResult.data ?? []) {
          const conversationId = str((row as Row).conversation_id);
          tagMap.set(conversationId, [...(tagMap.get(conversationId) ?? []), str((row as Row).tag)]);
        }
        const latestMessagePreviewMap = new Map<string, string>();
        for (const row of latestMessagesResult.data ?? []) {
          const conversationId = str((row as Row).conversation_id);
          if (latestMessagePreviewMap.has(conversationId)) continue;
          const preview = str((row as Row).body).trim();
          if (preview) {
            latestMessagePreviewMap.set(conversationId, preview);
          }
        }
        const archivePreviewMap = new Map<string, string>();
        for (const row of archivePreviewResult.data ?? []) {
          const conversationId = str((row as Row).conversation_id);
          if (archivePreviewMap.has(conversationId)) continue;
          const preview = previewFromArchiveEvent(row as Row).trim();
          if (preview) {
            archivePreviewMap.set(conversationId, preview);
          }
        }
        const contactMap = new Map(contacts.map((contact) => [contact.id, contact]));
        const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const contact = contactMap.get(str(typed.contact_id));
          const asset = assetMap.get(str(typed.connected_asset_id));
          const subject = str(typed.subject, "Conversation");
          const preview =
            latestMessagePreviewMap.get(str(typed.id)) ??
            archivePreviewMap.get(str(typed.id)) ??
            subject;
          return {
            id: str(typed.id),
            platform: str(typed.platform, "facebook") as Conversation["platform"],
            businessId: asset?.businessId ?? "",
            assetId: str(typed.connected_asset_id),
            contactId: str(typed.contact_id),
            contactName: contact?.displayName ?? str(typed.external_thread_id, "Unknown contact"),
            subject,
            preview,
            unreadCount: num(typed.unread_count),
            status: str(typed.status, "open") as Conversation["status"],
            assignedTo: owners.get(str(typed.assigned_user_id)) ?? "Unassigned",
            tags: tagMap.get(str(typed.id)) ?? [],
            lastMessageAt: iso(typed.last_message_at ?? typed.updated_at)
          };
        });
      },
      () =>
        (scope?.assetId
          ? mockConversations.filter((conversation) => conversation.assetId === scope.assetId)
          : mockByBusiness(mockConversations, (conversation, businessId) => conversation.businessId === businessId, scope))
    ),

  getConversationById: async (conversationId: string, scope?: DashboardScope) => (await dashboardRepository.getConversations(scope)).find((item) => item.id === conversationId) ?? null,

  getConversationsByAssetId: async (assetId: string, scope?: DashboardScope) =>
    (await dashboardRepository.getConversations(scope)).filter((item) => item.assetId === assetId),

  getMessagesByConversationId: async (conversationId: string) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const result = await client.from("messages").select("*").eq("conversation_id", conversationId).order("sent_at");
        if (result.error) throw result.error;
        const ids = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const attachmentsResult = ids.length ? await client.from("message_attachments").select("*").in("message_id", ids) : { data: [], error: null };
        if (attachmentsResult.error) throw attachmentsResult.error;
        const attachmentMap = new Map<string, MessageAttachment[]>();
        for (const row of attachmentsResult.data ?? []) {
          const typed = row as Row;
          const metadata = obj(typed.metadata);
          const attachment: MessageAttachment = {
            id: str(typed.id),
            messageId: str(typed.message_id),
            kind: str(typed.attachment_type, "file") as MessageAttachment["kind"],
            fileName: str(typed.file_name, "attachment"),
            mimeType: str(typed.mime_type, "application/octet-stream"),
            sizeLabel: num(typed.file_size_bytes) ? `${Math.round(num(typed.file_size_bytes) / 1024)} KB` : "size unavailable",
            url: str(typed.storage_path) || str(metadata.url)
          };
          attachmentMap.set(attachment.messageId, [...(attachmentMap.get(attachment.messageId) ?? []), attachment]);
        }
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            conversationId: str(typed.conversation_id),
            direction: str(typed.direction, "inbound") as Message["direction"],
            senderLabel: str(typed.sender_label, "Unknown sender"),
            body: str(typed.body),
            status: str(typed.delivery_status, "delivered") as Message["status"],
            sentAt: iso(typed.sent_at ?? typed.created_at),
            archivedAt: iso(typed.created_at),
            attachments: attachmentMap.get(str(typed.id)) ?? []
          };
        });
      },
      () => mockMessages.filter((item) => item.conversationId === conversationId)
    ),

  getMessages: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const conversations = await dashboardRepository.getConversations(scope);
        if (!conversations.length && scope?.businessId) return [];

        const messageGroups = await Promise.all(conversations.map((conversation) => dashboardRepository.getMessagesByConversationId(conversation.id)));
        return messageGroups.flat().sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      },
      () =>
        mockByBusiness(
          mockMessages,
          (message, businessId) => {
            const conversation = mockConversations.find((item) => item.id === message.conversationId);
            return conversation?.businessId === businessId;
          },
          scope
        ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    ),

  getConversationNotes: async (conversationId: string) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        const result = await client.from("conversation_notes").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: false });
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            conversationId: str(typed.conversation_id),
            author: owners.get(str(typed.author_user_id)) ?? "System",
            body: str(typed.body),
            createdAt: iso(typed.created_at)
          } satisfies ConversationNote;
        });
      },
      () => mockConversationNotes.filter((item) => item.conversationId === conversationId)
    ),

  getAutoResponderRules: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("auto_responder_rules").select("*").order("updated_at", { ascending: false });
        if (scope?.businessId) query = query.eq("connected_business_id", scope.businessId);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            name: str(typed.rule_name),
            assetTypes: arr(typed.asset_types) as AutoResponderRule["assetTypes"],
            trigger: str(typed.trigger_type, "first_inbound_message") as AutoResponderRule["trigger"],
            status: str(typed.status, "draft") as AutoResponderRule["status"],
            responseWindowLabel: "Immediate reply",
            summary: str(typed.response_template),
            keywords: arr(typed.keyword_matches),
            suppressWhenAssigned: Boolean(typed.suppress_when_assigned),
            deliveryChannel: "direct_reply",
            lastTriggeredAt: iso(typed.updated_at ?? typed.created_at)
          } satisfies AutoResponderRule;
        });
      },
      () => mockAutoResponderRules
    ),

  getRawWebhookEvents: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const assetIds = scope?.businessId ? await scopeAssetIds(scope) : null;
        if (assetIds && !assetIds.length) return [];
        let query = client.from("raw_webhook_events").select("*").order("received_at", { ascending: false }).limit(20);
        if (assetIds) query = query.in("connected_asset_id", assetIds);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            platform: str(typed.platform, "facebook") as RawWebhookEvent["platform"],
            eventType: str(typed.event_type),
            receivedAt: iso(typed.received_at),
            dedupeKey: str(typed.dedupe_key),
            processingStatus: str(typed.processing_status, "received") as RawWebhookEvent["processingStatus"],
            payloadPreview: JSON.stringify(typed.raw_payload ?? {}).slice(0, 140)
          };
        });
      },
      () => mockRawWebhookEvents
    ),

  getMessageArchive: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const conversations = await dashboardRepository.getConversations(scope);
        const conversationIds = conversations.map((item) => item.id);
        if (!conversationIds.length && scope?.businessId) return [];
        const messagesResult = conversationIds.length ? await client.from("messages").select("id").in("conversation_id", conversationIds) : await client.from("messages").select("id");
        if (messagesResult.error) throw messagesResult.error;
        const ids = (messagesResult.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        if (!ids.length) return [];
        const archiveResult = await client.from("message_archive").select("*").in("message_id", ids).order("created_at", { ascending: false });
        if (archiveResult.error) throw archiveResult.error;
        return (archiveResult.data ?? []).map((row) => mapArchive(row as Row));
      },
      () =>
        mockByBusiness(
          mockMessageArchive,
          (record, businessId) => {
            const message = mockMessages.find((item) => item.id === record.messageId);
            const conversation = message ? mockConversations.find((item) => item.id === message.conversationId) : null;
            return conversation?.businessId === businessId;
          },
          scope
        )
    ),

  getCommunicationArchiveEvents: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let assetIds: string[] | null = null;
        if (scope?.businessId) {
          assetIds = await scopeAssetIds(scope);
          if (!assetIds?.length) return [];
        }

        let query = client
          .from("communication_archive_events")
          .select("*")
          .order("archived_at", { ascending: false })
          .limit(250);

        if (assetIds) {
          query = query.in("connected_asset_id", assetIds);
        }

        const result = await query;
        if (result.error) throw result.error;

        const eventIds = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const attachmentsResult = eventIds.length
          ? await client.from("communication_archive_attachments").select("*").in("archive_event_id", eventIds)
          : { data: [], error: null };

        if (attachmentsResult.error) throw attachmentsResult.error;

        const attachmentCountByEvent = new Map<string, number>();
        const attachmentMap = new Map<string, CommunicationArchiveAttachment[]>();
        for (const row of attachmentsResult.data ?? []) {
          const attachment = mapCommunicationArchiveAttachment(row as Row);
          const archiveEventId = attachment.archiveEventId;
          attachmentCountByEvent.set(archiveEventId, (attachmentCountByEvent.get(archiveEventId) ?? 0) + 1);
          attachmentMap.set(archiveEventId, [...(attachmentMap.get(archiveEventId) ?? []), attachment]);
        }

        const contactIds = Array.from(
          new Set((result.data ?? []).map((row) => str((row as Row).contact_id)).filter(Boolean))
        );
        const owners = contactIds.length ? await userMap() : new Map<string, string>();
        const contactsResult = contactIds.length
          ? await client.from("contacts").select("*").in("id", contactIds)
          : { data: [], error: null };

        if (contactsResult.error) throw contactsResult.error;

        const contactMap = new Map<string, Contact>();
        for (const row of contactsResult.data ?? []) {
          const typed = row as Row;
          contactMap.set(str(typed.id), mapContact(typed, owners.get(str(typed.owner_user_id)) ?? "Unassigned"));
        }

        return (result.data ?? []).map((row) =>
          mapCommunicationArchiveEvent(
            row as Row,
            attachmentCountByEvent.get(str((row as Row).id)) ?? 0,
            attachmentMap.get(str((row as Row).id)) ?? [],
            contactMap.get(str((row as Row).contact_id)) ?? null
          )
        );
      },
      () =>
        mockByBusiness(
          mockCommunicationArchiveEvents,
          () => true,
          scope
        )
    ),

  getLeads: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        const leadFormIds = await scopeLeadFormIds(scope);
        if (leadFormIds && !leadFormIds.length) return [];
        let query = client.from("leads").select("*").order("created_at", { ascending: false });
        if (leadFormIds) query = query.in("lead_form_id", leadFormIds);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => mapLead(row as Row, owners.get(str((row as Row).owner_user_id)) ?? "Unassigned"));
      },
      () =>
        (scope?.assetId
          ? mockLeads.filter((lead) => {
              const form = mockLeadForms.find((item) => item.id === lead.formId);
              return form?.assetId === scope.assetId;
            })
          : mockByBusiness(
              mockLeads,
              (lead, businessId) => {
                const form = mockLeadForms.find((item) => item.id === lead.formId);
                const asset = form ? mockConnectedAssets.find((item) => item.id === form.assetId) : null;
                return asset?.businessId === businessId;
              },
              scope
            ))
    ),

  getLeadsByAssetId: async (assetId: string, scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const asset = await dashboardRepository.getConnectedAssetById(assetId, scope);
        if (!asset) return [];

        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        const formsResult = await client.from("lead_forms").select("id").eq("connected_asset_id", assetId);
        if (formsResult.error) throw formsResult.error;

        const leadFormIds = (formsResult.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        if (!leadFormIds.length) return [];

        const leadsResult = await client.from("leads").select("*").in("lead_form_id", leadFormIds).order("created_at", { ascending: false });
        if (leadsResult.error) throw leadsResult.error;

        return (leadsResult.data ?? []).map((row) => mapLead(row as Row, owners.get(str((row as Row).owner_user_id)) ?? "Unassigned"));
      },
      () =>
        mockLeads.filter((lead) => {
          const form = mockLeadForms.find((item) => item.id === lead.formId);
          const asset = form ? mockConnectedAssets.find((item) => item.id === form.assetId) : null;
          if (!asset || asset.id !== assetId) return false;
          return !scope?.businessId || asset.businessId === scope.businessId;
        })
    ),

  getLeadById: async (leadId: string, scope?: DashboardScope) => (await dashboardRepository.getLeads(scope)).find((item) => item.id === leadId) ?? null,

  getLeadActivities: async (leadId: string) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        const result = await client.from("lead_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false });
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            leadId: str(typed.lead_id),
            type: str(typed.activity_type, "note") as LeadActivity["type"],
            summary: str(typed.summary),
            createdAt: iso(typed.created_at),
            actor: owners.get(str(typed.actor_user_id)) ?? "System"
          };
        });
      },
      () => mockLeadActivities.filter((item) => item.leadId === leadId)
    ),

  getLeadDestinations: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("lead_delivery_destinations").select("*").order("destination_name");
        if (scope?.businessId) query = query.eq("connected_business_id", scope.businessId);
        const result = await query;
        if (result.error) throw result.error;
        const ids = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const eventsResult = ids.length ? await client.from("lead_delivery_events").select("destination_id,status,delivered_at,created_at").in("destination_id", ids).order("created_at", { ascending: false }) : { data: [], error: null };
        if (eventsResult.error) throw eventsResult.error;
        const latest = new Map<string, Row>();
        for (const row of eventsResult.data ?? []) if (!latest.has(str((row as Row).destination_id))) latest.set(str((row as Row).destination_id), row as Row);
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const event = latest.get(str(typed.id));
          const status = str(event?.status, "warning");
          return {
            id: str(typed.id),
            name: str(typed.destination_name),
            destinationType: str(typed.destination_type, "website_endpoint") as LeadDestination["destinationType"],
            status: str(typed.status, "warning") as LeadDestination["status"],
            websiteLabel: str(typed.website_label),
            destinationUrl: str(typed.destination_url),
            mappedFields: arr(typed.mapped_fields),
            retryPolicy: str(typed.retry_policy, "No retry policy configured"),
            lastDeliveredAt: iso(event?.delivered_at ?? typed.updated_at),
            lastDeliveryOutcome: (status === "success" ? "success" : status === "error" ? "error" : "warning") as LeadDestination["lastDeliveryOutcome"]
          };
        });
      },
      () => mockLeadDestinations
    ),

  getIntegrationTargets: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("integration_targets").select("*").order("target_name");
        if (scope?.businessId) query = query.eq("connected_business_id", scope.businessId);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            name: str(typed.target_name),
            targetType: str(typed.target_type, "table") as IntegrationTarget["targetType"],
            status: str(typed.status, "warning") as IntegrationTarget["status"],
            connectionLabel: str(typed.connection_label, "unlabeled connection"),
            summary: str(typed.summary, "No summary provided."),
            capabilities: arr(typed.capabilities),
            lastHeartbeatAt: iso(typed.last_heartbeat_at ?? typed.updated_at)
          };
        });
      },
      () => mockIntegrationTargets
    ),

  getIntegrationTargetById: async (targetId: string, scope?: DashboardScope) => (await dashboardRepository.getIntegrationTargets(scope)).find((item) => item.id === targetId) ?? null,

  getCommandTemplates: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("command_templates").select("*").order("template_name");
        if (scope?.businessId) query = query.eq("connected_business_id", scope.businessId);
        const result = await query;
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            name: str(typed.template_name),
            targetType: str(typed.target_type, "table") as CommandTemplate["targetType"],
            commandKey: str(typed.command_key),
            status: str(typed.status, "draft") as CommandTemplate["status"],
            summary: str(typed.summary, "No summary provided."),
            requiresApproval: Boolean(typed.requires_approval),
            inputShapeLabel: str(typed.input_shape_label, "unspecified payload"),
            lastUsedAt: iso(typed.updated_at ?? typed.created_at)
          };
        });
      },
      () => mockCommandTemplates
    ),

  getCommandTemplateById: async (templateId: string, scope?: DashboardScope) => (await dashboardRepository.getCommandTemplates(scope)).find((item) => item.id === templateId) ?? null,

  getCommandExecutions: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const [targets, templates] = await Promise.all([dashboardRepository.getIntegrationTargets(scope), dashboardRepository.getCommandTemplates(scope)]);
        let query = client.from("command_executions").select("*").order("requested_at", { ascending: false }).limit(12);
        if (scope?.businessId && targets.length) query = query.in("integration_target_id", targets.map((item) => item.id));
        const result = await query;
        if (result.error) throw result.error;
        const targetMap = new Map(targets.map((item) => [item.id, item]));
        const templateMap = new Map(templates.map((item) => [item.id, item]));
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          return {
            id: str(typed.id),
            commandTemplateId: str(typed.command_template_id),
            targetId: str(typed.integration_target_id),
            targetName: targetMap.get(str(typed.integration_target_id))?.name ?? "Unknown target",
            commandLabel: templateMap.get(str(typed.command_template_id))?.name ?? "Unknown command",
            requestedBy: str(typed.requested_by_label, "system"),
            requestedAt: iso(typed.requested_at),
            completedAt: nullable(typed.completed_at),
            status: str(typed.status, "queued") as CommandExecution["status"],
            resultSummary: str(typed.result_summary, "No result summary recorded.")
          };
        });
      },
      () => mockCommandExecutions
    ),

  getAdAccounts: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        let query = client.from("ad_accounts").select("*").order("account_name");
        if (scope?.adAccountId) query = query.eq("id", scope.adAccountId);
        else if (scope?.businessId) {
          const assetIds = await scopeAssetIds(scope);
          if (!assetIds?.length) return [];
          const links = await client.from("ad_account_asset_links").select("ad_account_id").in("connected_asset_id", assetIds);
          if (links.error) throw links.error;
          const accountIds = Array.from(new Set((links.data ?? []).map((row) => str((row as Row).ad_account_id)).filter(Boolean)));
          if (!accountIds.length) return [];
          query = query.in("id", accountIds);
        }
        const result = await query;
        if (result.error) throw result.error;
        const ids = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const insightsResult = ids.length ? await client.from("ad_insights_daily").select("*").eq("entity_type", "account").in("entity_id", ids) : { data: [], error: null };
        if (insightsResult.error) throw insightsResult.error;
        const links = ids.length ? await adAccountLinks() : [];
        const [assets, businesses] = await Promise.all([
          dashboardRepository.getConnectedAssets(),
          dashboardRepository.getConnectedBusinesses()
        ]);
        const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
        const businessMap = new Map(businesses.map((business) => [business.id, business.name]));
        const today = new Date().toISOString().slice(0, 10);
        const spend = new Map<string, { today: number; month: number }>();
        for (const row of insightsResult.data ?? []) {
          const entityId = str((row as Row).entity_id);
          const entry = spend.get(entityId) ?? { today: 0, month: 0 };
          entry.month += num((row as Row).spend);
          if (str((row as Row).insight_date) === today) entry.today += num((row as Row).spend);
          spend.set(entityId, entry);
        }
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const metrics = spend.get(str(typed.id)) ?? { today: 0, month: 0 };
          const accountLinks = links.filter((link) => str(link.ad_account_id) === str(typed.id));
          const linkedAssets = accountLinks
            .map((link) => {
              const asset = link.connected_assets as Row | null | undefined;
              return asset ? assetMap.get(str(asset.id)) : null;
            })
            .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
          const linkedBusinesses = Array.from(new Set(linkedAssets.map((asset) => asset.businessId)));
          return {
            id: str(typed.id),
            name: str(typed.account_name),
            externalAccountId: str(typed.external_account_id),
            currency: str(typed.currency, "USD"),
            status: str(typed.status, "pending") as AdAccount["status"],
            spendToday: metrics.today,
            spendMonth: metrics.month,
            linkedAssetIds: linkedAssets.map((asset) => asset.id),
            linkedAssetNames: linkedAssets.map((asset) => asset.name),
            linkedBusinessIds: linkedBusinesses,
            linkedBusinessNames: linkedBusinesses.map((businessId) => businessMap.get(businessId) ?? businessId)
          };
        });
      },
      () => (scope?.adAccountId ? mockAdAccounts.filter((item) => item.id === scope.adAccountId) : mockAdAccounts)
    ),

  getCampaigns: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const accounts = await dashboardRepository.getAdAccounts(scope);
        const ids = accounts.map((item) => item.id);
        if (!ids.length && (scope?.businessId || scope?.adAccountId)) return [];
        let query = client.from("campaigns").select("*").order("campaign_name");
        if (ids.length) query = query.in("ad_account_id", ids);
        const result = await query;
        if (result.error) throw result.error;
        const insightIds = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const insightsResult = insightIds.length ? await client.from("ad_insights_daily").select("*").eq("entity_type", "campaign").in("entity_id", insightIds) : { data: [], error: null };
        if (insightsResult.error) throw insightsResult.error;
        const metrics = new Map<string, { spend: number; results: number }>();
        for (const row of insightsResult.data ?? []) {
          const id = str((row as Row).entity_id);
          metrics.set(id, { spend: (metrics.get(id)?.spend ?? 0) + num((row as Row).spend), results: (metrics.get(id)?.results ?? 0) + num((row as Row).leads) });
        }
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const metric = metrics.get(str(typed.id)) ?? { spend: 0, results: 0 };
          return {
            id: str(typed.id),
            adAccountId: str(typed.ad_account_id),
            name: str(typed.campaign_name),
            objective: str(typed.objective, "Unknown"),
            status: str(typed.status, "paused") as Campaign["status"],
            dailyBudget: num(typed.budget_daily),
            spend: metric.spend,
            results: metric.results
          };
        });
      },
      () => (scope?.adAccountId ? mockCampaigns.filter((item) => item.adAccountId === scope.adAccountId) : mockCampaigns)
    ),

  getAdSets: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const campaignIds = (await dashboardRepository.getCampaigns(scope)).map((item) => item.id);
        if (!campaignIds.length && (scope?.businessId || scope?.adAccountId)) return [];
        let query = client.from("adsets").select("*").order("adset_name");
        if (campaignIds.length) query = query.in("campaign_id", campaignIds);
        const result = await query;
        if (result.error) throw result.error;
        const insightIds = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const insightsResult = insightIds.length ? await client.from("ad_insights_daily").select("*").eq("entity_type", "adset").in("entity_id", insightIds) : { data: [], error: null };
        if (insightsResult.error) throw insightsResult.error;
        const metrics = new Map<string, { spend: number; results: number }>();
        for (const row of insightsResult.data ?? []) {
          const id = str((row as Row).entity_id);
          metrics.set(id, { spend: (metrics.get(id)?.spend ?? 0) + num((row as Row).spend), results: (metrics.get(id)?.results ?? 0) + num((row as Row).leads) });
        }
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const metric = metrics.get(str(typed.id)) ?? { spend: 0, results: 0 };
          return {
            id: str(typed.id),
            campaignId: str(typed.campaign_id),
            name: str(typed.adset_name),
            status: str(typed.status, "paused") as AdSet["status"],
            audience: str(typed.audience_summary, "Audience summary unavailable"),
            spend: metric.spend,
            results: metric.results
          };
        });
      },
      () => {
        const campaignIds = new Set((scope?.adAccountId ? mockCampaigns.filter((item) => item.adAccountId === scope.adAccountId) : mockCampaigns).map((item) => item.id));
        return mockAdSets.filter((item) => !campaignIds.size || campaignIds.has(item.campaignId));
      }
    ),

  getAds: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const adsetIds = (await dashboardRepository.getAdSets(scope)).map((item) => item.id);
        if (!adsetIds.length && (scope?.businessId || scope?.adAccountId)) return [];
        let query = client.from("ads").select("*").order("ad_name");
        if (adsetIds.length) query = query.in("adset_id", adsetIds);
        const result = await query;
        if (result.error) throw result.error;
        const insightIds = (result.data ?? []).map((row) => str((row as Row).id)).filter(Boolean);
        const insightsResult = insightIds.length ? await client.from("ad_insights_daily").select("*").eq("entity_type", "ad").in("entity_id", insightIds) : { data: [], error: null };
        if (insightsResult.error) throw insightsResult.error;
        const metrics = new Map<string, { spend: number; clicks: number; ctr: number }>();
        for (const row of insightsResult.data ?? []) {
          const id = str((row as Row).entity_id);
          metrics.set(id, { spend: (metrics.get(id)?.spend ?? 0) + num((row as Row).spend), clicks: (metrics.get(id)?.clicks ?? 0) + num((row as Row).clicks), ctr: num((row as Row).ctr, metrics.get(id)?.ctr ?? 0) });
        }
        return (result.data ?? []).map((row) => {
          const typed = row as Row;
          const metric = metrics.get(str(typed.id)) ?? { spend: 0, clicks: 0, ctr: 0 };
          return {
            id: str(typed.id),
            adsetId: str(typed.adset_id),
            name: str(typed.ad_name),
            status: str(typed.status, "paused") as Ad["status"],
            creativeLabel: str(typed.creative_name, "Creative"),
            spend: metric.spend,
            clicks: metric.clicks,
            ctr: metric.ctr
          };
        });
      },
      () => {
        const adsetIds = new Set((scope?.adAccountId ? mockAdSets.filter((item) => mockCampaigns.some((campaign) => campaign.id === item.campaignId && campaign.adAccountId === scope.adAccountId)) : mockAdSets).map((item) => item.id));
        return mockAds.filter((item) => !adsetIds.size || adsetIds.has(item.adsetId));
      }
    ),

  getAdInsightsDaily: async (scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const allowed = new Set<string>();
        for (const item of await dashboardRepository.getAdAccounts(scope)) allowed.add(`account:${item.id}`);
        for (const item of await dashboardRepository.getCampaigns(scope)) allowed.add(`campaign:${item.id}`);
        for (const item of await dashboardRepository.getAdSets(scope)) allowed.add(`adset:${item.id}`);
        for (const item of await dashboardRepository.getAds(scope)) allowed.add(`ad:${item.id}`);
        if (!allowed.size && (scope?.businessId || scope?.adAccountId)) return [];
        const result = await client.from("ad_insights_daily").select("*").order("insight_date", { ascending: false }).limit(60);
        if (result.error) throw result.error;
        return (result.data ?? [])
          .filter((row) => !allowed.size || allowed.has(`${str((row as Row).entity_type)}:${str((row as Row).entity_id)}`))
          .map((row) => ({ id: str((row as Row).id), entityType: str((row as Row).entity_type) as AdInsightDaily["entityType"], entityId: str((row as Row).entity_id), date: str((row as Row).insight_date), impressions: num((row as Row).impressions), clicks: num((row as Row).clicks), leads: num((row as Row).leads), spend: num((row as Row).spend), ctr: num((row as Row).ctr), cpl: num((row as Row).cpl) }));
      },
      () => mockAdInsightsDaily
    ),

  getSyncJobs: async (_scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const result = await client.from("sync_jobs").select("*").order("created_at", { ascending: false }).limit(20);
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => ({ id: str((row as Row).id), scope: str((row as Row).scope), status: str((row as Row).status, "queued") as SyncJob["status"], startedAt: iso((row as Row).started_at ?? (row as Row).created_at), completedAt: nullable((row as Row).completed_at), detail: str((row as Row).detail, "No detail recorded.") }));
      },
      () => mockSyncJobs
    ),

  getAuditLogs: async (_scope?: DashboardScope) =>
    liveOrFallback(
      async () => {
        const client = getSupabaseAdminClient()!;
        const owners = await userMap();
        const result = await client.from("audit_logs").select("*").order("occurred_at", { ascending: false }).limit(20);
        if (result.error) throw result.error;
        return (result.data ?? []).map((row) => ({ id: str((row as Row).id), actor: owners.get(str((row as Row).actor_user_id)) ?? str((row as Row).actor_label, "system"), action: str((row as Row).action), targetType: str((row as Row).target_type), targetId: str((row as Row).target_id), occurredAt: iso((row as Row).occurred_at), outcome: str((row as Row).outcome, "success") as AuditLog["outcome"], detail: str((row as Row).detail, "No detail recorded.") }));
      },
      () => mockAuditLogs
    )
};
