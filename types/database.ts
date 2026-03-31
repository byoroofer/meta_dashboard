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
  | "visitor_profiles"
  | "sessions"
  | "page_views"
  | "consents"
  | "attribution_touches"
  | "events"
  | "form_submissions"
  | "communication_logs"
  | "contact_segments"
  | "contact_notes"
  | "conversations"
  | "messages"
  | "message_attachments"
  | "message_tags"
  | "conversation_notes"
  | "auto_responder_rules"
  | "raw_webhook_events"
  | "message_archive"
  | "lead_forms"
  | "leads"
  | "lead_activities"
  | "lead_delivery_destinations"
  | "lead_delivery_events"
  | "integration_targets"
  | "command_templates"
  | "command_executions"
  | "ad_accounts"
  | "campaigns"
  | "adsets"
  | "ads"
  | "ad_insights_daily"
  | "sync_jobs"
  | "audit_logs";
