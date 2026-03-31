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

export interface ConversationNote {
  id: string;
  conversationId: string;
  author: string;
  body: string;
  createdAt: string;
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
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: "note" | "status_change" | "call" | "email";
  summary: string;
  createdAt: string;
  actor: string;
}

export interface AdAccount {
  id: string;
  name: string;
  externalAccountId: string;
  currency: string;
  status: ConnectionStatus;
  spendToday: number;
  spendMonth: number;
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
