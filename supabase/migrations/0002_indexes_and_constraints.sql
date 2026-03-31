create index if not exists idx_connected_assets_business_id on public.connected_assets (business_id);
create index if not exists idx_contacts_stage on public.contacts (stage);
create index if not exists idx_conversations_asset_id on public.conversations (connected_asset_id);
create index if not exists idx_conversations_contact_id on public.conversations (contact_id);
create index if not exists idx_conversations_last_message_at on public.conversations (last_message_at desc);
create index if not exists idx_messages_conversation_id on public.messages (conversation_id);
create index if not exists idx_messages_external_message_id on public.messages (external_message_id);
create index if not exists idx_raw_webhook_events_received_at on public.raw_webhook_events (received_at desc);
create index if not exists idx_raw_webhook_events_processing_status on public.raw_webhook_events (processing_status);
create index if not exists idx_message_archive_message_id on public.message_archive (message_id);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_lead_activities_lead_id on public.lead_activities (lead_id);
create index if not exists idx_campaigns_ad_account_id on public.campaigns (ad_account_id);
create index if not exists idx_adsets_campaign_id on public.adsets (campaign_id);
create index if not exists idx_ads_adset_id on public.ads (adset_id);
create index if not exists idx_ad_insights_daily_lookup on public.ad_insights_daily (entity_type, entity_id, insight_date desc);
create index if not exists idx_sync_jobs_scope on public.sync_jobs (scope);
create index if not exists idx_audit_logs_occurred_at on public.audit_logs (occurred_at desc);

alter table public.connected_businesses
  add constraint connected_businesses_status_check check (status in ('active', 'warning', 'expired', 'revoked', 'pending')),
  add constraint connected_businesses_sync_status_check check (sync_status in ('healthy', 'pending', 'lagging', 'failed')),
  add constraint connected_businesses_webhook_health_check check (webhook_health in ('healthy', 'degraded', 'failing', 'unknown'));

alter table public.connected_assets
  add constraint connected_assets_type_check check (asset_type in ('facebook_page', 'instagram_professional', 'ad_account', 'lead_form')),
  add constraint connected_assets_connection_status_check check (connection_status in ('active', 'warning', 'expired', 'revoked', 'pending')),
  add constraint connected_assets_sync_status_check check (sync_status in ('healthy', 'pending', 'lagging', 'failed')),
  add constraint connected_assets_webhook_health_check check (webhook_health in ('healthy', 'degraded', 'failing', 'unknown'));

alter table public.messages
  add constraint messages_direction_check check (direction in ('inbound', 'outbound')),
  add constraint messages_state_check check (message_state in ('active', 'edited', 'deleted'));

alter table public.raw_webhook_events
  add constraint raw_webhook_events_status_check check (processing_status in ('received', 'processed', 'failed', 'skipped'));

alter table public.leads
  add constraint leads_status_check check (status in ('new', 'qualified', 'nurturing', 'won', 'lost'));

alter table public.sync_jobs
  add constraint sync_jobs_status_check check (status in ('queued', 'running', 'succeeded', 'failed'));

alter table public.audit_logs
  add constraint audit_logs_outcome_check check (outcome in ('success', 'warning', 'error'));

create trigger set_updated_at_app_users
before update on public.app_users
for each row execute function public.set_updated_at();

create trigger set_updated_at_connected_businesses
before update on public.connected_businesses
for each row execute function public.set_updated_at();

create trigger set_updated_at_connected_assets
before update on public.connected_assets
for each row execute function public.set_updated_at();

create trigger set_updated_at_access_tokens
before update on public.access_tokens
for each row execute function public.set_updated_at();

create trigger set_updated_at_contacts
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger set_updated_at_conversations
before update on public.conversations
for each row execute function public.set_updated_at();

create trigger set_updated_at_messages
before update on public.messages
for each row execute function public.set_updated_at();

create trigger set_updated_at_lead_forms
before update on public.lead_forms
for each row execute function public.set_updated_at();

create trigger set_updated_at_leads
before update on public.leads
for each row execute function public.set_updated_at();

create trigger set_updated_at_ad_accounts
before update on public.ad_accounts
for each row execute function public.set_updated_at();

create trigger set_updated_at_campaigns
before update on public.campaigns
for each row execute function public.set_updated_at();

create trigger set_updated_at_adsets
before update on public.adsets
for each row execute function public.set_updated_at();

create trigger set_updated_at_ads
before update on public.ads
for each row execute function public.set_updated_at();
