alter table public.marketplace_saved_searches
  add column if not exists schedule_frequency_minutes integer,
  add column if not exists next_run_at timestamptz,
  add column if not exists notification_channels jsonb not null default '["dashboard"]'::jsonb;

update public.marketplace_saved_searches
  set schedule_frequency_minutes = 120
  where schedule_frequency_minutes is null;

create table if not exists public.marketplace_alerts (
  id uuid primary key default gen_random_uuid(),
  saved_search_id uuid references public.marketplace_saved_searches(id) on delete set null,
  scan_id uuid references public.marketplace_scan_runs(id) on delete set null,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  deal_score integer not null default 0,
  title text not null,
  reasoning text not null default '',
  channel text not null default 'dashboard',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create index if not exists idx_marketplace_alerts_created_at
  on public.marketplace_alerts (created_at desc);

create index if not exists idx_marketplace_alerts_read_at
  on public.marketplace_alerts (read_at, created_at desc);

create index if not exists idx_marketplace_saved_searches_next_run
  on public.marketplace_saved_searches (next_run_at);
