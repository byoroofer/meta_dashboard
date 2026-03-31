create extension if not exists "pgcrypto";

alter table public.contacts
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists alternate_phone text,
  add column if not exists company_name text,
  add column if not exists job_title text,
  add column if not exists street_1 text,
  add column if not exists street_2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text default 'US',
  add column if not exists lead_status text not null default 'new',
  add column if not exists pipeline_stage text,
  add column if not exists lifecycle_stage text,
  add column if not exists lead_score integer not null default 0,
  add column if not exists priority_level text,
  add column if not exists preferred_contact_method text,
  add column if not exists preferred_contact_time text,
  add column if not exists do_not_call boolean not null default false,
  add column if not exists do_not_email boolean not null default false,
  add column if not exists do_not_sms boolean not null default false,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists first_touch_term text,
  add column if not exists first_touch_content text,
  add column if not exists first_touch_referrer text,
  add column if not exists first_touch_landing_page text,
  add column if not exists first_touch_at timestamptz,
  add column if not exists last_touch_source text,
  add column if not exists last_touch_medium text,
  add column if not exists last_touch_campaign text,
  add column if not exists last_touch_term text,
  add column if not exists last_touch_content text,
  add column if not exists last_touch_referrer text,
  add column if not exists last_touch_landing_page text,
  add column if not exists last_touch_at timestamptz,
  add column if not exists latest_session_id uuid,
  add column if not exists latest_visitor_id uuid,
  add column if not exists segment text,
  add column if not exists notes text,
  add column if not exists custom_attributes jsonb not null default '{}'::jsonb;

update public.contacts
set
  lead_status = stage,
  pipeline_stage = coalesce(pipeline_stage, stage)
where stage is not null;

create table if not exists public.visitor_profiles (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text not null unique,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  is_returning boolean not null default false,
  ip_address inet,
  user_agent text,
  browser_name text,
  browser_version text,
  os_name text,
  os_version text,
  device_type text,
  device_brand text,
  device_model text,
  screen_width integer,
  screen_height integer,
  viewport_width integer,
  viewport_height integer,
  language text,
  timezone text,
  geo_country text,
  geo_region text,
  geo_city text,
  geo_postal_code text,
  contact_id uuid references public.contacts(id) on delete set null,
  blocked boolean not null default false,
  suspicious boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  session_token text not null unique,
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  duration_seconds integer,
  entry_url text,
  entry_path text,
  exit_url text,
  exit_path text,
  referrer text,
  referrer_domain text,
  source text,
  medium text,
  campaign text,
  term text,
  content text,
  source_channel text,
  fbclid text,
  fbc text,
  fbp text,
  gclid text,
  msclkid text,
  ttclid text,
  landing_page text,
  landing_host text,
  landing_query text,
  page_view_count integer not null default 0,
  event_count integer not null default 0,
  cta_click_count integer not null default 0,
  form_started boolean not null default false,
  form_submitted boolean not null default false,
  converted boolean not null default false,
  converted_at timestamptz,
  ip_address inet,
  user_agent text,
  browser_name text,
  os_name text,
  device_type text,
  language text,
  timezone text,
  session_quality text,
  session_flags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  viewed_at timestamptz not null default timezone('utc', now()),
  url text not null,
  path text not null,
  title text,
  referrer text,
  source text,
  medium text,
  campaign text,
  dwell_seconds integer,
  scroll_percent numeric(5,2),
  is_entry boolean not null default false,
  is_exit boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  policy_version text not null,
  consent_source text not null default 'cookie_banner',
  consent_action text not null,
  necessary boolean not null default true,
  analytics boolean not null default false,
  marketing boolean not null default false,
  consented_at timestamptz not null default timezone('utc', now()),
  ip_address inet,
  user_agent text,
  proof jsonb not null default '{}'::jsonb
);

create table if not exists public.attribution_touches (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  touch_type text not null,
  touched_at timestamptz not null default timezone('utc', now()),
  source text,
  medium text,
  campaign text,
  term text,
  content text,
  channel text,
  referrer text,
  landing_page text,
  fbclid text,
  fbc text,
  fbp text,
  gclid text,
  msclkid text,
  ttclid text,
  ad_platform text,
  ad_account_id text,
  campaign_id text,
  adset_id text,
  ad_id text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  event_name text not null,
  event_category text,
  event_label text,
  event_value numeric,
  occurred_at timestamptz not null default timezone('utc', now()),
  path text,
  url text,
  source text,
  medium text,
  campaign text,
  consent_state jsonb not null default '{}'::jsonb,
  properties jsonb not null default '{}'::jsonb
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  visitor_id uuid references public.visitor_profiles(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  lead_form_id uuid references public.lead_forms(id) on delete set null,
  form_name text not null,
  form_version text,
  submission_channel text not null default 'website_form',
  submitted_at timestamptz not null default timezone('utc', now()),
  page_url text,
  page_path text,
  submission_status text not null default 'submitted',
  is_marketing_lead boolean not null default true,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  source text,
  medium text,
  campaign text,
  source_channel text,
  referrer text,
  fbclid text,
  fbc text,
  fbp text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  direction text not null,
  channel text not null,
  subject text,
  message_text text,
  external_message_id text,
  external_thread_id text,
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_segments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  created_by_user_id uuid references public.app_users(id) on delete set null,
  segment_name text not null,
  segment_reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz
);

create table if not exists public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  author_user_id uuid references public.app_users(id) on delete set null,
  note_body text not null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.leads
  add column if not exists visitor_profile_id uuid,
  add column if not exists session_id uuid,
  add column if not exists form_submission_id uuid,
  add column if not exists source_channel text,
  add column if not exists source_platform text,
  add column if not exists converted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contacts_latest_session_id_fkey'
  ) then
    alter table public.contacts
      add constraint contacts_latest_session_id_fkey
      foreign key (latest_session_id) references public.sessions(id) on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contacts_latest_visitor_id_fkey'
  ) then
    alter table public.contacts
      add constraint contacts_latest_visitor_id_fkey
      foreign key (latest_visitor_id) references public.visitor_profiles(id) on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_visitor_profile_id_fkey'
  ) then
    alter table public.leads
      add constraint leads_visitor_profile_id_fkey
      foreign key (visitor_profile_id) references public.visitor_profiles(id) on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_session_id_fkey'
  ) then
    alter table public.leads
      add constraint leads_session_id_fkey
      foreign key (session_id) references public.sessions(id) on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_form_submission_id_fkey'
  ) then
    alter table public.leads
      add constraint leads_form_submission_id_fkey
      foreign key (form_submission_id) references public.form_submissions(id) on delete set null;
  end if;
end
$$;

