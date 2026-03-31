create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  role_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, role_key)
);

create table if not exists public.connected_businesses (
  id uuid primary key default gen_random_uuid(),
  external_business_id text not null unique,
  business_name text not null,
  status text not null,
  sync_status text not null,
  webhook_health text not null,
  granted_scopes text[] not null default '{}',
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.connected_assets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.connected_businesses(id) on delete cascade,
  asset_type text not null,
  external_asset_id text not null,
  asset_name text not null,
  connection_status text not null,
  sync_status text not null,
  webhook_health text not null,
  granted_scopes text[] not null default '{}',
  token_last_rotated_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (asset_type, external_asset_id)
);

create table if not exists public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  connected_asset_id uuid references public.connected_assets(id) on delete cascade,
  connected_business_id uuid references public.connected_businesses(id) on delete cascade,
  token_label text not null,
  token_ciphertext text not null,
  token_last_four text,
  scopes text[] not null default '{}',
  expires_at timestamptz,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  external_contact_key text,
  display_name text not null,
  primary_email text,
  primary_phone text,
  source text not null,
  stage text not null,
  owner_user_id uuid references public.app_users(id),
  tags text[] not null default '{}',
  last_activity_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  connected_asset_id uuid not null references public.connected_assets(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  platform text not null,
  external_thread_id text not null,
  subject text,
  status text not null,
  assigned_user_id uuid references public.app_users(id),
  unread_count integer not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (platform, external_thread_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  external_message_id text,
  direction text not null,
  sender_label text,
  body text,
  delivery_status text not null,
  message_state text not null default 'active',
  sent_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  attachment_type text not null,
  external_attachment_id text,
  storage_path text,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.message_tags (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (conversation_id, tag)
);

create table if not exists public.conversation_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_user_id uuid references public.app_users(id),
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.raw_webhook_events (
  id uuid primary key default gen_random_uuid(),
  connected_asset_id uuid references public.connected_assets(id) on delete set null,
  platform text not null,
  event_type text not null,
  delivery_id text,
  dedupe_key text not null unique,
  signature_header text,
  request_headers jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null,
  raw_payload_text text not null,
  payload_sha256 text not null,
  received_at timestamptz not null default timezone('utc', now()),
  processing_status text not null default 'received',
  processed_at timestamptz,
  processing_error text
);

create table if not exists public.message_archive (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  canonical_payload jsonb not null,
  snapshot_sha256 text not null,
  canonical_version integer not null default 1,
  retention_class text not null default 'standard',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_forms (
  id uuid primary key default gen_random_uuid(),
  connected_asset_id uuid not null references public.connected_assets(id) on delete cascade,
  external_form_id text not null unique,
  form_name text not null,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  lead_form_id uuid references public.lead_forms(id) on delete set null,
  external_lead_id text unique,
  full_name text,
  email text,
  phone text,
  campaign_name text,
  adset_name text,
  ad_name text,
  status text not null,
  owner_user_id uuid references public.app_users(id),
  raw_submission jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_user_id uuid references public.app_users(id),
  activity_type text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ad_accounts (
  id uuid primary key default gen_random_uuid(),
  connected_asset_id uuid references public.connected_assets(id) on delete set null,
  external_account_id text not null unique,
  account_name text not null,
  currency text not null,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid not null references public.ad_accounts(id) on delete cascade,
  external_campaign_id text not null unique,
  campaign_name text not null,
  objective text,
  status text not null,
  budget_daily numeric(12,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.adsets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  external_adset_id text not null unique,
  adset_name text not null,
  audience_summary text,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  adset_id uuid not null references public.adsets(id) on delete cascade,
  external_ad_id text not null unique,
  ad_name text not null,
  creative_name text,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ad_insights_daily (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  insight_date date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  leads bigint not null default 0,
  spend numeric(12,2) not null default 0,
  ctr numeric(8,4) not null default 0,
  cpl numeric(12,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (entity_type, entity_id, insight_date)
);

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  status text not null,
  detail text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.app_users(id),
  actor_label text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  outcome text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);
