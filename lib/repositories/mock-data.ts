import type {
  Ad,
  AdAccount,
  AdInsightDaily,
  AdSet,
  AuditLog,
  AutoResponderRule,
  Campaign,
  CommandExecution,
  CommandTemplate,
  ConnectedAsset,
  ConnectedBusiness,
  Contact,
  Conversation,
  ConversationNote,
  IntegrationTarget,
  Lead,
  LeadActivity,
  LeadDestination,
  LeadForm,
  Message,
  MessageArchiveRecord,
  RawWebhookEvent,
  SyncJob
} from "@/types/domain";

export const connectedBusinesses: ConnectedBusiness[] = [
  {
    id: "biz_001",
    name: "Byo Roofer Holdings",
    businessManagerId: "bm_44219013",
    status: "active",
    syncStatus: "healthy",
    webhookHealth: "healthy",
    grantedScopes: ["pages_manage_metadata", "pages_messaging", "instagram_manage_messages", "ads_read", "leads_retrieval"],
    connectedAssetCount: 5,
    lastSyncedAt: "2026-03-30T14:10:00.000Z"
  }
];

export const connectedAssets: ConnectedAsset[] = [
  {
    id: "asset_fb_001",
    businessId: "biz_001",
    type: "facebook_page",
    assetId: "page_884201",
    name: "Byo Roofer",
    status: "active",
    syncStatus: "healthy",
    webhookHealth: "healthy",
    grantedScopes: ["pages_manage_metadata", "pages_messaging"],
    tokenLastRotatedAt: "2026-03-11T08:00:00.000Z",
    lastSyncedAt: "2026-03-30T14:08:00.000Z"
  },
  {
    id: "asset_ig_001",
    businessId: "biz_001",
    type: "instagram_professional",
    assetId: "ig_221901",
    name: "@byoroofer",
    status: "active",
    syncStatus: "healthy",
    webhookHealth: "healthy",
    grantedScopes: ["instagram_basic", "instagram_manage_messages"],
    tokenLastRotatedAt: "2026-03-11T08:00:00.000Z",
    lastSyncedAt: "2026-03-30T14:09:00.000Z"
  },
  {
    id: "asset_ad_001",
    businessId: "biz_001",
    type: "ad_account",
    assetId: "act_5512908",
    name: "Primary US Ad Account",
    status: "active",
    syncStatus: "lagging",
    webhookHealth: "unknown",
    grantedScopes: ["ads_read"],
    tokenLastRotatedAt: "2026-03-09T08:00:00.000Z",
    lastSyncedAt: "2026-03-30T13:21:00.000Z"
  },
  {
    id: "asset_form_001",
    businessId: "biz_001",
    type: "lead_form",
    assetId: "form_991",
    name: "Roof Quote Request",
    status: "active",
    syncStatus: "healthy",
    webhookHealth: "healthy",
    grantedScopes: ["leads_retrieval"],
    tokenLastRotatedAt: "2026-03-09T08:00:00.000Z",
    lastSyncedAt: "2026-03-30T14:03:00.000Z"
  }
];

export const contacts: Contact[] = [
  {
    id: "contact_001",
    displayName: "Avery Stone",
    primaryEmail: "avery@example.com",
    primaryPhone: "(312) 555-0141",
    source: "facebook",
    stage: "qualified",
    owner: "Jordan Perez",
    tags: ["storm-damage", "high-value"],
    lastActivityAt: "2026-03-30T13:56:00.000Z"
  },
  {
    id: "contact_002",
    displayName: "Harper Bell",
    primaryEmail: "harper@example.com",
    primaryPhone: "(773) 555-0103",
    source: "instagram",
    stage: "proposal",
    owner: "Casey Nguyen",
    tags: ["insurance", "follow-up"],
    lastActivityAt: "2026-03-30T12:18:00.000Z"
  },
  {
    id: "contact_003",
    displayName: "Parker Dawson",
    primaryEmail: "parker@example.com",
    primaryPhone: "(708) 555-0188",
    source: "lead_form",
    stage: "new",
    owner: "Jordan Perez",
    tags: ["new-lead"],
    lastActivityAt: "2026-03-30T14:01:00.000Z"
  }
];

export const conversations: Conversation[] = [
  {
    id: "conv_001",
    platform: "facebook",
    businessId: "biz_001",
    assetId: "asset_fb_001",
    contactId: "contact_001",
    contactName: "Avery Stone",
    subject: "Storm damage estimate",
    preview: "Can someone review photos from the hail damage this morning?",
    unreadCount: 2,
    status: "open",
    assignedTo: "Jordan Perez",
    tags: ["storm-damage", "escalated"],
    lastMessageAt: "2026-03-30T13:56:00.000Z"
  },
  {
    id: "conv_002",
    platform: "instagram",
    businessId: "biz_001",
    assetId: "asset_ig_001",
    contactId: "contact_002",
    contactName: "Harper Bell",
    subject: "Insurance question",
    preview: "Do you work directly with State Farm for roof replacements?",
    unreadCount: 0,
    status: "pending",
    assignedTo: "Casey Nguyen",
    tags: ["insurance"],
    lastMessageAt: "2026-03-30T12:18:00.000Z"
  },
  {
    id: "conv_003",
    platform: "instagram",
    businessId: "biz_001",
    assetId: "asset_ig_001",
    contactId: "contact_003",
    contactName: "Parker Dawson",
    subject: "Lead follow-up",
    preview: "Checking if your team can inspect our detached garage too.",
    unreadCount: 1,
    status: "open",
    assignedTo: "Jordan Perez",
    tags: ["garage", "upsell"],
    lastMessageAt: "2026-03-30T14:01:00.000Z"
  }
];

export const messages: Message[] = [
  {
    id: "msg_001",
    conversationId: "conv_001",
    direction: "inbound",
    senderLabel: "Avery Stone",
    body: "Can someone review photos from the hail damage this morning?",
    status: "delivered",
    sentAt: "2026-03-30T13:44:00.000Z",
    archivedAt: "2026-03-30T13:44:03.000Z",
    attachments: [
      {
        id: "att_001",
        messageId: "msg_001",
        kind: "image",
        fileName: "hail-damage-front-slope.jpg",
        mimeType: "image/jpeg",
        sizeLabel: "3.8 MB",
        url: "#"
      }
    ]
  },
  {
    id: "msg_002",
    conversationId: "conv_001",
    direction: "outbound",
    senderLabel: "Jordan Perez",
    body: "Yes. We archived the images and can have an estimator call you within the hour.",
    status: "sent",
    sentAt: "2026-03-30T13:48:00.000Z",
    archivedAt: "2026-03-30T13:48:01.000Z",
    attachments: []
  },
  {
    id: "msg_003",
    conversationId: "conv_001",
    direction: "inbound",
    senderLabel: "Avery Stone",
    body: "Perfect, thank you. The claim number is ready too.",
    status: "delivered",
    sentAt: "2026-03-30T13:56:00.000Z",
    archivedAt: "2026-03-30T13:56:02.000Z",
    attachments: []
  },
  {
    id: "msg_004",
    conversationId: "conv_002",
    direction: "inbound",
    senderLabel: "Harper Bell",
    body: "Do you work directly with State Farm for roof replacements?",
    status: "delivered",
    sentAt: "2026-03-30T12:04:00.000Z",
    archivedAt: "2026-03-30T12:04:01.000Z",
    attachments: []
  },
  {
    id: "msg_005",
    conversationId: "conv_002",
    direction: "outbound",
    senderLabel: "Casey Nguyen",
    body: "We coordinate documentation for most carriers, including State Farm. I can send over our process summary.",
    status: "sent",
    sentAt: "2026-03-30T12:18:00.000Z",
    archivedAt: "2026-03-30T12:18:02.000Z",
    attachments: []
  },
  {
    id: "msg_006",
    conversationId: "conv_003",
    direction: "inbound",
    senderLabel: "Parker Dawson",
    body: "Checking if your team can inspect our detached garage too.",
    status: "delivered",
    sentAt: "2026-03-30T14:01:00.000Z",
    archivedAt: "2026-03-30T14:01:01.000Z",
    attachments: []
  }
];

export const conversationNotes: ConversationNote[] = [
  {
    id: "note_001",
    conversationId: "conv_001",
    author: "Jordan Perez",
    body: "Priority because storm hit same ZIP code as our active canvassing route.",
    createdAt: "2026-03-30T13:52:00.000Z"
  },
  {
    id: "note_002",
    conversationId: "conv_002",
    author: "Casey Nguyen",
    body: "Waiting on insurance FAQ PDF before sending final reply.",
    createdAt: "2026-03-30T12:19:00.000Z"
  }
];

export const autoResponderRules: AutoResponderRule[] = [
  {
    id: "ar_001",
    name: "After-hours acknowledgement",
    assetTypes: ["facebook_page", "instagram_professional"],
    trigger: "after_business_hours",
    status: "active",
    responseWindowLabel: "Within 10 seconds",
    summary: "Sends a branded acknowledgement, ETA, and lead intake link when a new inbound message arrives outside staffed hours.",
    keywords: [],
    suppressWhenAssigned: true,
    deliveryChannel: "direct_reply",
    lastTriggeredAt: "2026-03-30T02:12:00.000Z"
  },
  {
    id: "ar_002",
    name: "Storm damage keyword flow",
    assetTypes: ["facebook_page", "instagram_professional"],
    trigger: "keyword_match",
    status: "active",
    responseWindowLabel: "Within 5 seconds",
    summary: "Replies with inspection intake steps and routes the thread for human follow-up when hail, storm, leak, or emergency terms are detected.",
    keywords: ["hail", "storm", "leak", "emergency"],
    suppressWhenAssigned: true,
    deliveryChannel: "direct_reply",
    lastTriggeredAt: "2026-03-30T13:44:05.000Z"
  },
  {
    id: "ar_003",
    name: "First-touch Instagram greeting",
    assetTypes: ["instagram_professional"],
    trigger: "first_inbound_message",
    status: "paused",
    responseWindowLabel: "Within 15 seconds",
    summary: "Greets first-time IG message senders and offers website estimate booking as the primary CTA.",
    keywords: [],
    suppressWhenAssigned: false,
    deliveryChannel: "direct_reply",
    lastTriggeredAt: "2026-03-28T17:21:00.000Z"
  }
];

export const rawWebhookEvents: RawWebhookEvent[] = [
  {
    id: "evt_001",
    platform: "facebook",
    eventType: "messages",
    receivedAt: "2026-03-30T13:44:02.000Z",
    dedupeKey: "30b5f8918d0a601afe3cb8245e2f5a3a",
    processingStatus: "processed",
    payloadPreview: "{entry:[{messaging:[{message:{mid:'m_1'}}]}]}"
  },
  {
    id: "evt_002",
    platform: "leadgen",
    eventType: "leadgen",
    receivedAt: "2026-03-30T14:00:30.000Z",
    dedupeKey: "d571f4ac1f12ff6b1908fd5abc7b3301",
    processingStatus: "processed",
    payloadPreview: "{entry:[{changes:[{field:'leadgen'}]}]}"
  },
  {
    id: "evt_003",
    platform: "instagram",
    eventType: "mentions",
    receivedAt: "2026-03-30T14:02:50.000Z",
    dedupeKey: "0cbdb276f31bd3f656922924b4697a1a",
    processingStatus: "skipped",
    payloadPreview: "{entry:[{messaging:[{message:{mid:'m_ig_4'}}]}]}"
  }
];

export const messageArchive: MessageArchiveRecord[] = [
  {
    id: "arc_001",
    messageId: "msg_001",
    snapshotHash: "a80cf42c2fb9b7098fbd3110fc9526a8505dc95a6ce50f313d6624d7189264da",
    canonicalVersion: 1,
    createdAt: "2026-03-30T13:44:03.000Z",
    retentionClass: "standard"
  },
  {
    id: "arc_002",
    messageId: "msg_002",
    snapshotHash: "0ef84121b62964fb937e21d7720cf4b7f0d6dd16fba89f69b12d5300fdcf5d9d",
    canonicalVersion: 1,
    createdAt: "2026-03-30T13:48:01.000Z",
    retentionClass: "operational"
  },
  {
    id: "arc_003",
    messageId: "msg_003",
    snapshotHash: "fc8bb38e30efd3f4e7ca584ab9f93c0d0cba0c4f1fe0d80ba5bd7ac5ea2416df",
    canonicalVersion: 1,
    createdAt: "2026-03-30T13:56:02.000Z",
    retentionClass: "standard"
  }
];

export const leadForms: LeadForm[] = [
  {
    id: "form_001",
    assetId: "asset_form_001",
    formName: "Roof Quote Request",
    externalFormId: "991",
    status: "active"
  }
];

export const leads: Lead[] = [
  {
    id: "lead_001",
    contactId: "contact_003",
    formId: "form_001",
    fullName: "Parker Dawson",
    email: "parker@example.com",
    phone: "(708) 555-0188",
    campaignName: "Spring Storm Recovery",
    adsetName: "South Chicago Homeowners",
    adName: "Free Roof Inspection",
    status: "new",
    owner: "Jordan Perez",
    createdAt: "2026-03-30T13:58:00.000Z"
  },
  {
    id: "lead_002",
    contactId: "contact_001",
    formId: "form_001",
    fullName: "Avery Stone",
    email: "avery@example.com",
    phone: "(312) 555-0141",
    campaignName: "Storm Damage Claims",
    adsetName: "Northwest Suburbs",
    adName: "Claim Support Offer",
    status: "qualified",
    owner: "Jordan Perez",
    createdAt: "2026-03-29T16:11:00.000Z"
  }
];

export const leadActivities: LeadActivity[] = [
  {
    id: "activity_001",
    leadId: "lead_001",
    type: "note",
    summary: "Lead form captured from mobile campaign. Needs garage upsell discovery.",
    createdAt: "2026-03-30T14:00:00.000Z",
    actor: "System"
  },
  {
    id: "activity_002",
    leadId: "lead_002",
    type: "status_change",
    summary: "Moved from new to qualified after claim number was confirmed.",
    createdAt: "2026-03-30T13:57:00.000Z",
    actor: "Jordan Perez"
  }
];

export const leadDestinations: LeadDestination[] = [
  {
    id: "dest_001",
    name: "Main quote intake endpoint",
    destinationType: "website_endpoint",
    status: "active",
    websiteLabel: "byoroofer.com",
    destinationUrl: "https://www.byoroofer.com/api/meta/leads",
    mappedFields: ["full_name", "email", "phone", "campaign_name", "form_name"],
    retryPolicy: "3 retries over 15 minutes",
    lastDeliveredAt: "2026-03-30T14:00:35.000Z",
    lastDeliveryOutcome: "success"
  },
  {
    id: "dest_002",
    name: "Emergency roof inspection form",
    destinationType: "website_form",
    status: "warning",
    websiteLabel: "storm.byoroofer.com",
    destinationUrl: "https://storm.byoroofer.com/inspection-request",
    mappedFields: ["full_name", "phone", "damage_type", "postal_code"],
    retryPolicy: "Immediate retry plus ops alert",
    lastDeliveredAt: "2026-03-29T22:14:00.000Z",
    lastDeliveryOutcome: "warning"
  }
];

export const integrationTargets: IntegrationTarget[] = [
  {
    id: "target_001",
    name: "Byo Roofer Facebook Page",
    targetType: "meta_asset",
    status: "active",
    connectionLabel: "facebook page",
    summary: "Primary business messaging target for inbound DMs, comments workflows, and outbound reply orchestration.",
    capabilities: ["sync_messages", "send_reply", "refresh_profile"],
    lastHeartbeatAt: "2026-03-30T14:10:00.000Z"
  },
  {
    id: "target_002",
    name: "Byo Roofer Main Website",
    targetType: "website",
    status: "active",
    connectionLabel: "HTTPS API",
    summary: "Receives qualified leads, booking commands, and status updates into the public website intake system.",
    capabilities: ["push_lead", "sync_booking_status", "trigger_form_prefill"],
    lastHeartbeatAt: "2026-03-30T14:07:00.000Z"
  },
  {
    id: "target_003",
    name: "Client CRM Postgres",
    targetType: "database",
    status: "warning",
    connectionLabel: "postgres",
    summary: "Destination for lead and contact sync once schema mappings and credentials are finalized.",
    capabilities: ["insert_contact", "update_pipeline_stage", "run_sync_job"],
    lastHeartbeatAt: "2026-03-30T13:12:00.000Z"
  },
  {
    id: "target_004",
    name: "Operational Lead Table",
    targetType: "table",
    status: "active",
    connectionLabel: "supabase table",
    summary: "Internal normalized lead table used for routing, enrichment, and website dispatch decisions.",
    capabilities: ["append_row", "mark_status", "requeue_delivery"],
    lastHeartbeatAt: "2026-03-30T14:11:00.000Z"
  }
];

export const commandTemplates: CommandTemplate[] = [
  {
    id: "cmd_tpl_001",
    name: "Send business reply",
    targetType: "meta_asset",
    commandKey: "meta.send_business_reply",
    status: "active",
    summary: "Queue a supported outbound message from the portal to a connected Meta business asset.",
    requiresApproval: false,
    inputShapeLabel: "conversationId, body, actorLabel",
    lastUsedAt: "2026-03-30T13:48:00.000Z"
  },
  {
    id: "cmd_tpl_002",
    name: "Push lead to website",
    targetType: "website",
    commandKey: "website.push_lead",
    status: "active",
    summary: "Deliver a normalized lead payload from the portal into a client website endpoint or form workflow.",
    requiresApproval: true,
    inputShapeLabel: "leadId, destinationId, payloadOverride?",
    lastUsedAt: "2026-03-30T14:00:35.000Z"
  },
  {
    id: "cmd_tpl_003",
    name: "Update client database stage",
    targetType: "database",
    commandKey: "database.update_pipeline_stage",
    status: "draft",
    summary: "Apply a controlled stage/status mutation into a connected client database once mappings are approved.",
    requiresApproval: true,
    inputShapeLabel: "recordId, nextStage, targetSchema",
    lastUsedAt: "2026-03-29T17:24:00.000Z"
  },
  {
    id: "cmd_tpl_004",
    name: "Requeue website delivery",
    targetType: "table",
    commandKey: "table.requeue_delivery",
    status: "active",
    summary: "Requeue a failed website delivery from the portal against the normalized lead delivery tables.",
    requiresApproval: false,
    inputShapeLabel: "deliveryEventId",
    lastUsedAt: "2026-03-30T14:16:00.000Z"
  }
];

export const commandExecutions: CommandExecution[] = [
  {
    id: "cmd_exec_001",
    commandTemplateId: "cmd_tpl_002",
    targetId: "target_002",
    targetName: "Byo Roofer Main Website",
    commandLabel: "Push lead to website",
    requestedBy: "Morgan Lee",
    requestedAt: "2026-03-30T14:00:30.000Z",
    completedAt: "2026-03-30T14:00:35.000Z",
    status: "succeeded",
    resultSummary: "Lead 001 accepted by website intake endpoint."
  },
  {
    id: "cmd_exec_002",
    commandTemplateId: "cmd_tpl_004",
    targetId: "target_004",
    targetName: "Operational Lead Table",
    commandLabel: "Requeue website delivery",
    requestedBy: "System",
    requestedAt: "2026-03-30T14:16:00.000Z",
    completedAt: null,
    status: "running",
    resultSummary: "Retry worker is replaying one failed website form delivery."
  },
  {
    id: "cmd_exec_003",
    commandTemplateId: "cmd_tpl_001",
    targetId: "target_001",
    targetName: "Byo Roofer Facebook Page",
    commandLabel: "Send business reply",
    requestedBy: "Jordan Perez",
    requestedAt: "2026-03-30T13:48:00.000Z",
    completedAt: "2026-03-30T13:48:02.000Z",
    status: "succeeded",
    resultSummary: "Outbound reply logged in portal and handed off to Meta send pipeline placeholder."
  }
];

export const adAccounts: AdAccount[] = [
  {
    id: "adacct_001",
    name: "Primary US Ad Account",
    externalAccountId: "act_5512908",
    currency: "USD",
    status: "active",
    spendToday: 1680,
    spendMonth: 28450
  }
];

export const campaigns: Campaign[] = [
  {
    id: "cmp_001",
    adAccountId: "adacct_001",
    name: "Spring Storm Recovery",
    objective: "Leads",
    status: "active",
    dailyBudget: 950,
    spend: 12740,
    results: 84
  },
  {
    id: "cmp_002",
    adAccountId: "adacct_001",
    name: "Storm Damage Claims",
    objective: "Leads",
    status: "active",
    dailyBudget: 750,
    spend: 9310,
    results: 61
  }
];

export const adsets: AdSet[] = [
  {
    id: "adset_001",
    campaignId: "cmp_001",
    name: "South Chicago Homeowners",
    status: "active",
    audience: "Homeowners 35+",
    spend: 6840,
    results: 41
  },
  {
    id: "adset_002",
    campaignId: "cmp_002",
    name: "Northwest Suburbs",
    status: "active",
    audience: "Insurance claim intent",
    spend: 4980,
    results: 33
  }
];

export const ads: Ad[] = [
  {
    id: "ad_001",
    adsetId: "adset_001",
    name: "Free Roof Inspection",
    status: "active",
    creativeLabel: "Carousel v3",
    spend: 3220,
    clicks: 412,
    ctr: 3.7
  },
  {
    id: "ad_002",
    adsetId: "adset_002",
    name: "Claim Support Offer",
    status: "active",
    creativeLabel: "Video explainer",
    spend: 2710,
    clicks: 288,
    ctr: 2.9
  }
];

export const adInsightsDaily: AdInsightDaily[] = [
  {
    id: "ins_001",
    entityType: "campaign",
    entityId: "cmp_001",
    date: "2026-03-30",
    impressions: 18400,
    clicks: 412,
    leads: 14,
    spend: 830,
    ctr: 2.24,
    cpl: 59.29
  },
  {
    id: "ins_002",
    entityType: "campaign",
    entityId: "cmp_002",
    date: "2026-03-30",
    impressions: 15380,
    clicks: 288,
    leads: 11,
    spend: 620,
    ctr: 1.87,
    cpl: 56.36
  }
];

export const syncJobs: SyncJob[] = [
  {
    id: "sync_001",
    scope: "webhook-processor",
    status: "running",
    startedAt: "2026-03-30T14:05:00.000Z",
    completedAt: null,
    detail: "Processing latest IG DM delivery receipts."
  },
  {
    id: "sync_002",
    scope: "ads-insights-daily",
    status: "queued",
    startedAt: "2026-03-30T14:15:00.000Z",
    completedAt: null,
    detail: "Waiting to hydrate campaign-level metrics for 2026-03-30."
  },
  {
    id: "sync_003",
    scope: "website-lead-delivery",
    status: "queued",
    startedAt: "2026-03-30T14:16:00.000Z",
    completedAt: null,
    detail: "Retrying one website form delivery after validation mismatch."
  },
  {
    id: "sync_004",
    scope: "portal-command-dispatch",
    status: "running",
    startedAt: "2026-03-30T14:17:00.000Z",
    completedAt: null,
    detail: "Portal command queue monitoring Meta, website, and database targets."
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: "audit_001",
    actor: "Morgan Lee",
    action: "token.rotate",
    targetType: "connected_asset",
    targetId: "asset_fb_001",
    occurredAt: "2026-03-29T17:03:00.000Z",
    outcome: "success",
    detail: "Rotated long-lived page token and refreshed metadata scope manifest."
  },
  {
    id: "audit_002",
    actor: "Jordan Perez",
    action: "conversation.assign",
    targetType: "conversation",
    targetId: "conv_001",
    occurredAt: "2026-03-30T13:49:00.000Z",
    outcome: "success",
    detail: "Assigned Avery Stone thread to Jordan Perez."
  },
  {
    id: "audit_003",
    actor: "System",
    action: "archive.hash",
    targetType: "message_archive",
    targetId: "arc_003",
    occurredAt: "2026-03-30T13:56:02.000Z",
    outcome: "success",
    detail: "Canonical archive snapshot hashed and persisted after inbound message normalization."
  },
  {
    id: "audit_004",
    actor: "Morgan Lee",
    action: "auto_responder.update",
    targetType: "auto_responder_rule",
    targetId: "ar_002",
    occurredAt: "2026-03-30T11:42:00.000Z",
    outcome: "success",
    detail: "Updated keyword flow copy to drive emergency traffic into the inspection intake path."
  },
  {
    id: "audit_005",
    actor: "Morgan Lee",
    action: "portal.command_dispatch",
    targetType: "integration_target",
    targetId: "target_002",
    occurredAt: "2026-03-30T14:00:35.000Z",
    outcome: "success",
    detail: "Portal pushed a normalized lead into the website intake endpoint."
  }
];
