create index if not exists idx_contacts_primary_email_lower on public.contacts (lower(primary_email))
  where primary_email is not null;
create index if not exists idx_contacts_primary_phone on public.contacts (primary_phone)
  where primary_phone is not null;
create index if not exists idx_contacts_lead_status on public.contacts (lead_status);
create index if not exists idx_contacts_pipeline_stage on public.contacts (pipeline_stage);
create index if not exists idx_contacts_lifecycle_stage on public.contacts (lifecycle_stage);
create index if not exists idx_contacts_latest_session_id on public.contacts (latest_session_id);
create index if not exists idx_contacts_latest_visitor_id on public.contacts (latest_visitor_id);
create index if not exists idx_contacts_tags_gin on public.contacts using gin (tags);
create index if not exists idx_contacts_custom_attributes_gin on public.contacts using gin (custom_attributes);

create index if not exists idx_visitor_profiles_contact_id on public.visitor_profiles (contact_id);
create index if not exists idx_visitor_profiles_last_seen_at on public.visitor_profiles (last_seen_at desc);
create index if not exists idx_visitor_profiles_metadata_gin on public.visitor_profiles using gin (metadata);

create index if not exists idx_sessions_visitor_id on public.sessions (visitor_id);
create index if not exists idx_sessions_contact_id on public.sessions (contact_id);
create index if not exists idx_sessions_started_at on public.sessions (started_at desc);
create index if not exists idx_sessions_campaign on public.sessions (campaign);
create index if not exists idx_sessions_source_medium on public.sessions (source, medium);
create index if not exists idx_sessions_source_channel on public.sessions (source_channel);

create index if not exists idx_page_views_session_id on public.page_views (session_id);
create index if not exists idx_page_views_path on public.page_views (path);
create index if not exists idx_page_views_viewed_at on public.page_views (viewed_at desc);

create index if not exists idx_consents_visitor_id on public.consents (visitor_id);
create index if not exists idx_consents_contact_id on public.consents (contact_id);
create index if not exists idx_consents_session_id on public.consents (session_id);
create index if not exists idx_consents_consented_at on public.consents (consented_at desc);

create index if not exists idx_attribution_touches_contact_id on public.attribution_touches (contact_id);
create index if not exists idx_attribution_touches_session_id on public.attribution_touches (session_id);
create index if not exists idx_attribution_touches_touched_at on public.attribution_touches (touched_at desc);
create index if not exists idx_attribution_touches_channel on public.attribution_touches (channel);
create index if not exists idx_attribution_touches_campaign on public.attribution_touches (campaign);

create index if not exists idx_events_session_id on public.events (session_id);
create index if not exists idx_events_contact_id on public.events (contact_id);
create index if not exists idx_events_event_name on public.events (event_name);
create index if not exists idx_events_occurred_at on public.events (occurred_at desc);
create index if not exists idx_events_properties_gin on public.events using gin (properties);

create index if not exists idx_form_submissions_contact_id on public.form_submissions (contact_id);
create index if not exists idx_form_submissions_session_id on public.form_submissions (session_id);
create index if not exists idx_form_submissions_lead_form_id on public.form_submissions (lead_form_id);
create index if not exists idx_form_submissions_form_name on public.form_submissions (form_name);
create index if not exists idx_form_submissions_submitted_at on public.form_submissions (submitted_at desc);
create index if not exists idx_form_submissions_status on public.form_submissions (submission_status);

create index if not exists idx_communication_logs_contact_id on public.communication_logs (contact_id);
create index if not exists idx_communication_logs_session_id on public.communication_logs (session_id);
create index if not exists idx_communication_logs_conversation_id on public.communication_logs (conversation_id);
create index if not exists idx_communication_logs_channel on public.communication_logs (channel);
create index if not exists idx_communication_logs_created_at on public.communication_logs (created_at desc);
create index if not exists idx_communication_logs_external_message_id on public.communication_logs (external_message_id)
  where external_message_id is not null;

create index if not exists idx_contact_segments_contact_id on public.contact_segments (contact_id);
create index if not exists idx_contact_segments_segment_name on public.contact_segments (segment_name);

create index if not exists idx_contact_notes_contact_id on public.contact_notes (contact_id);
create index if not exists idx_contact_notes_created_at on public.contact_notes (created_at desc);

create index if not exists idx_leads_visitor_profile_id on public.leads (visitor_profile_id);
create index if not exists idx_leads_session_id on public.leads (session_id);
create index if not exists idx_leads_form_submission_id on public.leads (form_submission_id);
create index if not exists idx_leads_source_channel on public.leads (source_channel);
create index if not exists idx_leads_converted_at on public.leads (converted_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contacts_lead_score_check'
  ) then
    alter table public.contacts
      add constraint contacts_lead_score_check check (lead_score >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contacts_preferred_contact_method_check'
  ) then
    alter table public.contacts
      add constraint contacts_preferred_contact_method_check
      check (
        preferred_contact_method is null
        or preferred_contact_method in ('sms', 'call', 'email')
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_duration_seconds_check'
  ) then
    alter table public.sessions
      add constraint sessions_duration_seconds_check
      check (duration_seconds is null or duration_seconds >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_page_view_count_check'
  ) then
    alter table public.sessions
      add constraint sessions_page_view_count_check check (page_view_count >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_event_count_check'
  ) then
    alter table public.sessions
      add constraint sessions_event_count_check check (event_count >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_cta_click_count_check'
  ) then
    alter table public.sessions
      add constraint sessions_cta_click_count_check check (cta_click_count >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_session_quality_check'
  ) then
    alter table public.sessions
      add constraint sessions_session_quality_check
      check (
        session_quality is null
        or session_quality in ('low', 'normal', 'high_intent')
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'page_views_dwell_seconds_check'
  ) then
    alter table public.page_views
      add constraint page_views_dwell_seconds_check
      check (dwell_seconds is null or dwell_seconds >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'page_views_scroll_percent_check'
  ) then
    alter table public.page_views
      add constraint page_views_scroll_percent_check
      check (scroll_percent is null or (scroll_percent >= 0 and scroll_percent <= 100));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'consents_source_check'
  ) then
    alter table public.consents
      add constraint consents_source_check
      check (consent_source in ('cookie_banner', 'form_checkbox', 'preference_center', 'server_default'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'consents_action_check'
  ) then
    alter table public.consents
      add constraint consents_action_check
      check (consent_action in ('accept_all', 'reject_all', 'save_preferences', 'revoke'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'attribution_touches_touch_type_check'
  ) then
    alter table public.attribution_touches
      add constraint attribution_touches_touch_type_check
      check (touch_type in ('first_touch', 'last_touch', 'assist', 'conversion_touch'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'attribution_touches_ad_platform_check'
  ) then
    alter table public.attribution_touches
      add constraint attribution_touches_ad_platform_check
      check (
        ad_platform is null
        or ad_platform in ('meta', 'google', 'microsoft', 'tiktok', 'unknown')
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'form_submissions_submission_status_check'
  ) then
    alter table public.form_submissions
      add constraint form_submissions_submission_status_check
      check (submission_status in ('submitted', 'partial', 'abandoned', 'invalid', 'spam'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'form_submissions_submission_channel_check'
  ) then
    alter table public.form_submissions
      add constraint form_submissions_submission_channel_check
      check (submission_channel in ('website_form', 'meta_lead_form', 'manual_entry', 'api'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'communication_logs_direction_check'
  ) then
    alter table public.communication_logs
      add constraint communication_logs_direction_check
      check (direction in ('inbound', 'outbound'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'communication_logs_channel_check'
  ) then
    alter table public.communication_logs
      add constraint communication_logs_channel_check
      check (channel in ('sms', 'email', 'phone', 'chat', 'messenger', 'instagram', 'facebook', 'website_form', 'meta_lead'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'communication_logs_status_check'
  ) then
    alter table public.communication_logs
      add constraint communication_logs_status_check
      check (
        status is null
        or status in ('queued', 'sent', 'delivered', 'failed', 'received', 'read')
      );
  end if;
end
$$;

drop trigger if exists set_updated_at_visitor_profiles on public.visitor_profiles;
create trigger set_updated_at_visitor_profiles
before update on public.visitor_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_sessions on public.sessions;
create trigger set_updated_at_sessions
before update on public.sessions
for each row execute function public.set_updated_at();
