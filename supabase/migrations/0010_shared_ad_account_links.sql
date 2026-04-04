create table if not exists public.ad_account_asset_links (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid not null references public.ad_accounts(id) on delete cascade,
  connected_asset_id uuid not null references public.connected_assets(id) on delete cascade,
  relationship_type text not null default 'business_scope',
  created_at timestamptz not null default timezone('utc', now()),
  unique (ad_account_id, connected_asset_id)
);

create index if not exists idx_ad_account_asset_links_ad_account_id
  on public.ad_account_asset_links (ad_account_id);

create index if not exists idx_ad_account_asset_links_connected_asset_id
  on public.ad_account_asset_links (connected_asset_id);

alter table public.ad_account_asset_links
  add constraint ad_account_asset_links_relationship_type_check
  check (relationship_type in ('business_scope', 'page_binding', 'instagram_binding', 'manual'));
