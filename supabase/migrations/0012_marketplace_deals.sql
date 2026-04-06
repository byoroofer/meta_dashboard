create table if not exists public.marketplace_saved_searches (
  id uuid primary key default gen_random_uuid(),
  search_name text not null,
  description text,
  criteria jsonb not null default '{}'::jsonb,
  schedule_enabled boolean not null default false,
  schedule_label text,
  alert_threshold_score integer not null default 82,
  last_scanned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_scan_runs (
  id uuid primary key default gen_random_uuid(),
  saved_search_id uuid references public.marketplace_saved_searches(id) on delete set null,
  initiated_by_user_id uuid references public.app_users(id) on delete set null,
  run_reason text not null default 'manual',
  status text not null default 'queued',
  query_label text not null,
  criteria_snapshot jsonb not null default '{}'::jsonb,
  source_summary jsonb not null default '[]'::jsonb,
  summary text not null default '',
  listing_count integer not null default 0,
  deal_count integer not null default 0,
  source_count integer not null default 0,
  error_count integer not null default 0,
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text not null unique,
  canonical_title text not null,
  normalized_title text,
  inferred_brand text,
  inferred_model text,
  inferred_category text,
  inferred_condition text,
  latest_source text not null,
  latest_source_listing_id text not null,
  latest_title text not null,
  latest_description text,
  latest_price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  latest_location text,
  latest_url text not null,
  latest_image_urls jsonb not null default '[]'::jsonb,
  latest_posted_at timestamptz,
  seller_name text,
  condition_raw text,
  metadata jsonb not null default '{}'::jsonb,
  duplicate_count integer not null default 0,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.marketplace_scan_runs(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  source text not null,
  source_listing_id text not null,
  title text not null,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  location text,
  url text not null,
  image_urls jsonb not null default '[]'::jsonb,
  posted_at timestamptz,
  seller_name text,
  condition_raw text,
  source_metadata jsonb not null default '{}'::jsonb,
  comparison_status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  unique(scan_id, source, source_listing_id)
);

create table if not exists public.marketplace_listing_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  scan_result_id uuid not null unique references public.marketplace_scan_results(id) on delete cascade,
  normalized_title text,
  inferred_brand text,
  inferred_model text,
  inferred_category text,
  inferred_condition text,
  confidence numeric(5,4) not null default 0,
  fair_value_low numeric(12,2),
  fair_value_mid numeric(12,2),
  fair_value_high numeric(12,2),
  resale_value_low numeric(12,2),
  resale_value_mid numeric(12,2),
  resale_value_high numeric(12,2),
  best_use_case text,
  resale_potential text,
  risk_flags jsonb not null default '[]'::jsonb,
  reasoning text not null default '',
  suggested_comp_keywords jsonb not null default '[]'::jsonb,
  parsed_attributes jsonb not null default '{}'::jsonb,
  deal_score integer not null default 0,
  score_breakdown jsonb not null default '{}'::jsonb,
  price_delta_amount numeric(12,2),
  price_delta_percent numeric(12,2),
  analysis_model text,
  analysis_version text,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_listing_comps (
  id uuid primary key default gen_random_uuid(),
  scan_result_id uuid not null references public.marketplace_scan_results(id) on delete cascade,
  comp_type text not null,
  comp_source text not null,
  comp_source_listing_id text,
  comp_title text not null,
  comp_url text,
  comp_price numeric(12,2) not null default 0,
  comp_currency text not null default 'USD',
  comp_condition text,
  comp_location text,
  similarity_score numeric(5,4) not null default 0,
  match_reasons jsonb not null default '[]'::jsonb,
  posted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_listing_status (
  listing_id uuid primary key references public.marketplace_listings(id) on delete cascade,
  operator_status text not null default 'new',
  manual_notes text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.marketplace_source_errors (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.marketplace_scan_runs(id) on delete cascade,
  source text not null,
  error_code text,
  error_message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_marketplace_saved_searches_last_scanned_at
  on public.marketplace_saved_searches (last_scanned_at desc);

create index if not exists idx_marketplace_scan_runs_started_at
  on public.marketplace_scan_runs (started_at desc);

create index if not exists idx_marketplace_scan_runs_saved_search
  on public.marketplace_scan_runs (saved_search_id, started_at desc);

create index if not exists idx_marketplace_listings_last_seen_at
  on public.marketplace_listings (last_seen_at desc);

create index if not exists idx_marketplace_listings_brand_model
  on public.marketplace_listings (inferred_brand, inferred_model);

create index if not exists idx_marketplace_scan_results_scan_id
  on public.marketplace_scan_results (scan_id);

create index if not exists idx_marketplace_scan_results_listing_id
  on public.marketplace_scan_results (listing_id);

create index if not exists idx_marketplace_scan_results_price
  on public.marketplace_scan_results (price);

create index if not exists idx_marketplace_listing_ai_analysis_deal_score
  on public.marketplace_listing_ai_analysis (deal_score desc);

create index if not exists idx_marketplace_listing_comps_scan_result
  on public.marketplace_listing_comps (scan_result_id);

create index if not exists idx_marketplace_source_errors_scan_id
  on public.marketplace_source_errors (scan_id, created_at desc);

alter table public.marketplace_scan_runs
  add constraint marketplace_scan_runs_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed'));

alter table public.marketplace_listing_status
  add constraint marketplace_listing_status_operator_status_check
    check (operator_status in ('new', 'watched', 'ignored', 'contacted', 'purchased'));

drop trigger if exists set_updated_at_marketplace_saved_searches on public.marketplace_saved_searches;
create trigger set_updated_at_marketplace_saved_searches
before update on public.marketplace_saved_searches
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_marketplace_listings on public.marketplace_listings;
create trigger set_updated_at_marketplace_listings
before update on public.marketplace_listings
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_marketplace_listing_ai_analysis on public.marketplace_listing_ai_analysis;
create trigger set_updated_at_marketplace_listing_ai_analysis
before update on public.marketplace_listing_ai_analysis
for each row execute function public.set_updated_at();
