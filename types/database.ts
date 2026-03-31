export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DatabaseTableName =
  | "app_users"
  | "user_roles"
  | "connected_businesses"
  | "connected_assets"
  | "access_tokens"
  | "contacts"
  | "conversations"
  | "messages"
  | "message_attachments"
  | "message_tags"
  | "conversation_notes"
  | "raw_webhook_events"
  | "message_archive"
  | "lead_forms"
  | "leads"
  | "lead_activities"
  | "ad_accounts"
  | "campaigns"
  | "adsets"
  | "ads"
  | "ad_insights_daily"
  | "sync_jobs"
  | "audit_logs";
