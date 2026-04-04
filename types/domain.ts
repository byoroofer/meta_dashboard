import type { ConnectionStatus, MetaAssetType, SyncStatus, WebhookHealth } from "@/types/meta";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "analyst";
  lastLoginAt: string;
}

export interface ConnectedBusiness {
  id: string;
  name: string;
  businessManagerId: string;
  status: ConnectionStatus;
  syncStatus: SyncStatus;
  webhookHealth: WebhookHealth;
  grantedScopes: string[];
  connectedAssetCount: number;
  lastSyncedAt: string;
}

export interface ConnectedAsset {
  id: string;
  businessId: string;
  type: MetaAssetType;
  assetId: string;
  name: string;
  status: ConnectionStatus;
  syncStatus: SyncStatus;
  webhookHealth: WebhookHealth;
  grantedScopes: string[];
  tokenLastRotatedAt: string;
  lastSyncedAt: string;
}

export interface Contact {
  id: string;
  displayName: string;
  primaryEmail: string;
  primaryPhone: string;
  source: "facebook" | "instagram" | "lead_form" | "manual";
  stage: "new" | "qualified" | "proposal" | "won" | "lost";
  owner: string;
  tags: string[];
  lastActivityAt: string;
  firstName?: string | null;
  lastName?: string | null;
  alternatePhone?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  leadStatus?: string | null;
  pipelineStage?: string | null;
  lifecycleStage?: string | null;
  leadScore?: number;
  priorityLevel?: string | null;
  preferredContactMethod?: "sms" | "call" | "email" | null;
  preferredContactTime?: string | null;
  doNotCall?: boolean;
  doNotEmail?: boolean;
  doNotSms?: boolean;
  marketingOptIn?: boolean;
  firstTouchSource?: string | null;
  firstTouchCampaign?: string | null;
  lastTouchSource?: string | null;
  lastTouchCampaign?: string | null;
  latestSessionId?: string | null;
  latestVisitorId?: string | null;
  segment?: string | null;
  notes?: string | null;
  customAttributes?: Record<string, unknown>;
}

export interface VisitorProfile {
  id: string;
  anonymousId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  isReturning: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  osName?: string | null;
  osVersion?: string | null;
  deviceType?: "mobile" | "tablet" | "desktop" | string | null;
  deviceBrand?: string | null;
  deviceModel?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  language?: string | null;
  timezone?: string | null;
  geoCountry?: string | null;
  geoRegion?: string | null;
  geoCity?: string | null;
  geoPostalCode?: string | null;
  contactId?: string | null;
  blocked: boolean;
  suspicious: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedSession {
  id: string;
  visitorId?: string | null;
  contactId?: string | null;
  sessionToken: string;
  startedAt: string;
  endedAt?: string | null;
  durationSeconds?: number | null;
  entryUrl?: string | null;
  entryPath?: string | null;
  exitUrl?: string | null;
  exitPath?: string | null;
  referrer?: string | null;
  referrerDomain?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
  sourceChannel?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  ttclid?: string | null;
  landingPage?: string | null;
  landingHost?: string | null;
  landingQuery?: string | null;
  pageViewCount: number;
  eventCount: number;
  ctaClickCount: number;
  formStarted: boolean;
  formSubmitted: boolean;
  converted: boolean;
  convertedAt?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  browserName?: string | null;
  osName?: string | null;
  deviceType?: string | null;
  language?: string | null;
  timezone?: string | null;
  sessionQuality?: "low" | "normal" | "high_intent" | string | null;
  sessionFlags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PageViewRecord {
  id: string;
  sessionId: string;
  visitorId?: string | null;
  contactId?: string | null;
  viewedAt: string;
  url: string;
  path: string;
  title?: string | null;
  referrer?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  dwellSeconds?: number | null;
  scrollPercent?: number | null;
  isEntry: boolean;
  isExit: boolean;
  metadata?: Record<string, unknown>;
}

export interface ConsentRecord {
  id: string;
  visitorId?: string | null;
  contactId?: string | null;
  sessionId?: string | null;
  policyVersion: string;
  consentSource: "cookie_banner" | "form_checkbox" | "preference_center" | "server_default";
  consentAction: "accept_all" | "reject_all" | "save_preferences" | "revoke";
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  consentedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  proof?: Record<string, unknown>;
}

export interface AttributionTouch {
  id: string;
  visitorId?: string | null;
  contactId?: string | null;
  sessionId?: string | null;
  touchType: "first_touch" | "last_touch" | "assist" | "conversion_touch";
  touchedAt: string;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
  channel?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  gclid?: string | null;
  msclkid?: string | null;
  ttclid?: string | null;
  adPlatform?: "meta" | "google" | "microsoft" | "tiktok" | "unknown" | string | null;
  adAccountId?: string | null;
  campaignId?: string | null;
  adsetId?: string | null;
  adId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface TrackedEvent {
  id: string;
  sessionId?: string | null;
  visitorId?: string | null;
  contactId?: string | null;
  eventName: string;
  eventCategory?: string | null;
  eventLabel?: string | null;
  eventValue?: number | null;
  occurredAt: string;
  path?: string | null;
  url?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  consentState?: Record<string, unknown>;
  properties?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  platform: "facebook" | "instagram";
  businessId: string;
  assetId: string;
  contactId: string;
  contactName: string;
  subject: string;
  preview: string;
  unreadCount: number;
  status: "open" | "pending" | "resolved" | "archived";
  assignedTo: string;
  tags: string[];
  lastMessageAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  kind: "image" | "video" | "audio" | "file";
  fileName: string;
  mimeType: string;
  sizeLabel: string;
  url: string;
}

export interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  senderLabel: string;
  body: string;
  status: "delivered" | "queued" | "sent" | "failed" | "edited" | "deleted";
  sentAt: string;
  archivedAt: string;
  attachments: MessageAttachment[];
}

export interface CommunicationLog {
  id: string;
  contactId: string;
  sessionId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  direction: "inbound" | "outbound";
  channel:
    | "sms"
    | "email"
    | "phone"
    | "chat"
    | "messenger"
    | "instagram"
    | "facebook"
    | "website_form"
    | "meta_lead";
  subject?: string | null;
  messageText?: string | null;
  externalMessageId?: string | null;
  externalThreadId?: string | null;
  deliveredAt?: string | null;
  openedAt?: string | null;
  clickedAt?: string | null;
  repliedAt?: string | null;
  status?: "queued" | "sent" | "delivered" | "failed" | "received" | "read" | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ConversationNote {
  id: string;
  conversationId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface ContactNote {
  id: string;
  contactId: string;
  authorUserId?: string | null;
  noteBody: string;
  isPinned: boolean;
  createdAt: string;
}

export interface ContactSegment {
  id: string;
  contactId: string;
  createdByUserId?: string | null;
  segmentName: string;
  segmentReason?: string | null;
  isActive: boolean;
  createdAt: string;
  endedAt?: string | null;
}

export interface AutoResponderRule {
  id: string;
  name: string;
  assetTypes: Array<"facebook_page" | "instagram_professional">;
  trigger: "first_inbound_message" | "after_business_hours" | "keyword_match";
  status: "active" | "paused" | "draft";
  responseWindowLabel: string;
  summary: string;
  keywords: string[];
  suppressWhenAssigned: boolean;
  deliveryChannel: "direct_reply" | "handoff_note";
  lastTriggeredAt: string;
}

export interface RawWebhookEvent {
  id: string;
  platform: "facebook" | "instagram" | "leadgen";
  eventType: string;
  receivedAt: string;
  dedupeKey: string;
  processingStatus: "received" | "processed" | "failed" | "skipped";
  payloadPreview: string;
}

export interface MessageArchiveRecord {
  id: string;
  messageId: string;
  snapshotHash: string;
  canonicalVersion: number;
  createdAt: string;
  retentionClass: "operational" | "legal_hold" | "standard";
}

export interface LeadForm {
  id: string;
  assetId: string;
  formName: string;
  externalFormId: string;
  status: "active" | "paused";
}

export interface FormSubmission {
  id: string;
  contactId?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  leadFormId?: string | null;
  formName: string;
  formVersion?: string | null;
  submissionChannel: "website_form" | "meta_lead_form" | "manual_entry" | "api";
  submittedAt: string;
  pageUrl?: string | null;
  pagePath?: string | null;
  submissionStatus: "submitted" | "partial" | "abandoned" | "invalid" | "spam";
  isMarketingLead: boolean;
  rawPayload?: Record<string, unknown>;
  normalizedPayload?: Record<string, unknown>;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  sourceChannel?: string | null;
  referrer?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  metadata?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  contactId: string;
  formId: string;
  fullName: string;
  email: string;
  phone: string;
  campaignName: string;
  adsetName: string;
  adName: string;
  status: "new" | "qualified" | "nurturing" | "won" | "lost";
  owner: string;
  createdAt: string;
  visitorProfileId?: string | null;
  sessionId?: string | null;
  formSubmissionId?: string | null;
  sourceChannel?: string | null;
  sourcePlatform?: string | null;
  convertedAt?: string | null;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: "note" | "status_change" | "call" | "email";
  summary: string;
  createdAt: string;
  actor: string;
}

export interface LeadDestination {
  id: string;
  name: string;
  destinationType: "website_endpoint" | "website_form";
  status: "active" | "warning" | "paused";
  websiteLabel: string;
  destinationUrl: string;
  mappedFields: string[];
  retryPolicy: string;
  lastDeliveredAt: string;
  lastDeliveryOutcome: "success" | "warning" | "error";
}

export interface IntegrationTarget {
  id: string;
  name: string;
  targetType: "meta_asset" | "website" | "database" | "table";
  status: "active" | "warning" | "paused";
  connectionLabel: string;
  summary: string;
  capabilities: string[];
  lastHeartbeatAt: string;
}

export interface CommandTemplate {
  id: string;
  name: string;
  targetType: IntegrationTarget["targetType"];
  commandKey: string;
  status: "active" | "draft" | "paused";
  summary: string;
  requiresApproval: boolean;
  inputShapeLabel: string;
  lastUsedAt: string;
}

export interface CommandExecution {
  id: string;
  commandTemplateId: string;
  targetId: string;
  targetName: string;
  commandLabel: string;
  requestedBy: string;
  requestedAt: string;
  completedAt: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  resultSummary: string;
}

export interface AdAccount {
  id: string;
  name: string;
  externalAccountId: string;
  currency: string;
  status: ConnectionStatus;
  spendToday: number;
  spendMonth: number;
  linkedAssetIds?: string[];
  linkedAssetNames?: string[];
  linkedBusinessIds?: string[];
  linkedBusinessNames?: string[];
}

export interface Campaign {
  id: string;
  adAccountId: string;
  name: string;
  objective: string;
  status: "active" | "paused" | "completed";
  dailyBudget: number;
  spend: number;
  results: number;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: "active" | "paused" | "completed";
  audience: string;
  spend: number;
  results: number;
}

export interface Ad {
  id: string;
  adsetId: string;
  name: string;
  status: "active" | "paused" | "completed";
  creativeLabel: string;
  spend: number;
  clicks: number;
  ctr: number;
}

export interface AdInsightDaily {
  id: string;
  entityType: "account" | "campaign" | "adset" | "ad";
  entityId: string;
  date: string;
  impressions: number;
  clicks: number;
  leads: number;
  spend: number;
  ctr: number;
  cpl: number;
}

export interface SyncJob {
  id: string;
  scope: string;
  status: "queued" | "running" | "succeeded" | "failed";
  startedAt: string;
  completedAt: string | null;
  detail: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  occurredAt: string;
  outcome: "success" | "warning" | "error";
  detail: string;
}

export interface OverviewMetric {
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "positive" | "warning";
}
