create table if not exists public.auto_responder_rules (
  id uuid primary key default gen_random_uuid(),
  connected_business_id uuid references public.connected_businesses(id) on delete cascade,
  rule_name text not null,
  trigger_type text not null,
  status text not null,
  asset_types text[] not null default '{}',
  response_template text not null,
  keyword_matches text[] not null default '{}',
  suppress_when_assigned boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_delivery_destinations (
  id uuid primary key default gen_random_uuid(),
  connected_business_id uuid references public.connected_businesses(id) on delete cascade,
  destination_name text not null,
  destination_type text not null,
  status text not null,
  website_label text not null,
  destination_url text not null,
  auth_strategy text,
  mapped_fields text[] not null default '{}',
  retry_policy text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lead_delivery_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  destination_id uuid not null references public.lead_delivery_destinations(id) on delete cascade,
  status text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_auto_responder_rules_business_id on public.auto_responder_rules (connected_business_id);
create index if not exists idx_lead_delivery_destinations_business_id on public.lead_delivery_destinations (connected_business_id);
create index if not exists idx_lead_delivery_events_lead_id on public.lead_delivery_events (lead_id);
create index if not exists idx_lead_delivery_events_destination_id on public.lead_delivery_events (destination_id);

alter table public.auto_responder_rules
  add constraint auto_responder_rules_status_check check (status in ('active', 'paused', 'draft')),
  add constraint auto_responder_rules_trigger_type_check check (trigger_type in ('first_inbound_message', 'after_business_hours', 'keyword_match'));

alter table public.lead_delivery_destinations
  add constraint lead_delivery_destinations_status_check check (status in ('active', 'warning', 'paused')),
  add constraint lead_delivery_destinations_type_check check (destination_type in ('website_endpoint', 'website_form'));

alter table public.lead_delivery_events
  add constraint lead_delivery_events_status_check check (status in ('queued', 'success', 'warning', 'error'));

create trigger set_updated_at_auto_responder_rules
before update on public.auto_responder_rules
for each row execute function public.set_updated_at();

create trigger set_updated_at_lead_delivery_destinations
before update on public.lead_delivery_destinations
for each row execute function public.set_updated_at();
