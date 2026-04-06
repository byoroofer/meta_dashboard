create table if not exists public.communication_archive_events (
  id uuid primary key default gen_random_uuid(),
  raw_webhook_event_id uuid references public.raw_webhook_events(id) on delete set null,
  connected_business_id uuid references public.connected_businesses(id) on delete set null,
  connected_asset_id uuid references public.connected_assets(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  source_platform text not null,
  channel text not null,
  direction text,
  event_type text not null,
  external_event_id text,
  external_thread_id text,
  external_message_id text,
  actor_external_id text,
  actor_label text,
  counterparty_external_id text,
  counterparty_label text,
  occurred_at timestamptz,
  archived_at timestamptz not null default timezone('utc', now()),
  retention_locked boolean not null default true,
  payload_sha256 text not null,
  canonical_payload jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb
);

create table if not exists public.communication_archive_attachments (
  id uuid primary key default gen_random_uuid(),
  archive_event_id uuid not null references public.communication_archive_events(id) on delete cascade,
  attachment_type text not null,
  external_attachment_id text,
  file_name text,
  mime_type text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_comm_archive_events_asset_id on public.communication_archive_events (connected_asset_id);
create index if not exists idx_comm_archive_events_conversation_id on public.communication_archive_events (conversation_id);
create index if not exists idx_comm_archive_events_message_id on public.communication_archive_events (message_id);
create index if not exists idx_comm_archive_events_external_message_id on public.communication_archive_events (external_message_id);
create index if not exists idx_comm_archive_events_occurred_at on public.communication_archive_events (occurred_at desc);
create index if not exists idx_comm_archive_events_archived_at on public.communication_archive_events (archived_at desc);
create index if not exists idx_comm_archive_attachments_event_id on public.communication_archive_attachments (archive_event_id);

alter table public.communication_archive_events
  add constraint communication_archive_events_direction_check
    check (direction is null or direction in ('inbound', 'outbound')),
  add constraint communication_archive_events_channel_check
    check (channel in ('facebook', 'instagram', 'messenger', 'meta')),
  add constraint communication_archive_events_platform_check
    check (source_platform in ('facebook', 'instagram', 'messenger', 'meta', 'unknown'));

create or replace function public.prevent_archive_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'communication archive is append-only';
end;
$$;

drop trigger if exists prevent_update_communication_archive_events on public.communication_archive_events;
create trigger prevent_update_communication_archive_events
before update or delete on public.communication_archive_events
for each row execute function public.prevent_archive_mutation();

drop trigger if exists prevent_update_communication_archive_attachments on public.communication_archive_attachments;
create trigger prevent_update_communication_archive_attachments
before update or delete on public.communication_archive_attachments
for each row execute function public.prevent_archive_mutation();
