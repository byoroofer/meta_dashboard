create table if not exists public.integration_targets (
  id uuid primary key default gen_random_uuid(),
  connected_business_id uuid references public.connected_businesses(id) on delete cascade,
  target_name text not null,
  target_type text not null,
  status text not null,
  connection_label text,
  summary text,
  capabilities text[] not null default '{}',
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.command_templates (
  id uuid primary key default gen_random_uuid(),
  connected_business_id uuid references public.connected_businesses(id) on delete cascade,
  template_name text not null,
  target_type text not null,
  command_key text not null unique,
  status text not null,
  summary text,
  requires_approval boolean not null default false,
  input_shape_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.command_executions (
  id uuid primary key default gen_random_uuid(),
  command_template_id uuid not null references public.command_templates(id) on delete cascade,
  integration_target_id uuid not null references public.integration_targets(id) on delete cascade,
  requested_by_user_id uuid references public.app_users(id),
  requested_by_label text not null,
  status text not null,
  input_payload jsonb not null default '{}'::jsonb,
  result_payload jsonb,
  result_summary text,
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index if not exists idx_integration_targets_business_id on public.integration_targets (connected_business_id);
create index if not exists idx_command_templates_business_id on public.command_templates (connected_business_id);
create index if not exists idx_command_executions_template_id on public.command_executions (command_template_id);
create index if not exists idx_command_executions_target_id on public.command_executions (integration_target_id);
create index if not exists idx_command_executions_requested_at on public.command_executions (requested_at desc);

alter table public.integration_targets
  add constraint integration_targets_type_check check (target_type in ('meta_asset', 'website', 'database', 'table')),
  add constraint integration_targets_status_check check (status in ('active', 'warning', 'paused'));

alter table public.command_templates
  add constraint command_templates_target_type_check check (target_type in ('meta_asset', 'website', 'database', 'table')),
  add constraint command_templates_status_check check (status in ('active', 'draft', 'paused'));

alter table public.command_executions
  add constraint command_executions_status_check check (status in ('queued', 'running', 'succeeded', 'failed'));

create trigger set_updated_at_integration_targets
before update on public.integration_targets
for each row execute function public.set_updated_at();

create trigger set_updated_at_command_templates
before update on public.command_templates
for each row execute function public.set_updated_at();
