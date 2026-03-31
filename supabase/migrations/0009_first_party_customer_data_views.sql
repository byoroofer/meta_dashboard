create or replace view public.contact_overview as
select
  c.id,
  c.display_name,
  coalesce(nullif(trim(coalesce(c.first_name, '') || ' ' || coalesce(c.last_name, '')), ''), c.display_name) as full_name,
  c.primary_email as email,
  c.primary_phone as phone,
  c.company_name,
  c.source,
  c.stage,
  c.lead_status,
  c.pipeline_stage,
  c.lifecycle_stage,
  c.lead_score,
  c.first_touch_source,
  c.first_touch_campaign,
  c.last_touch_source,
  c.last_touch_campaign,
  c.segment,
  c.tags,
  c.created_at,
  c.updated_at,
  (
    select count(*)
    from public.sessions s
    where s.contact_id = c.id
  ) as total_sessions,
  (
    select count(*)
    from public.events e
    where e.contact_id = c.id
  ) as total_events,
  (
    select count(*)
    from public.form_submissions fs
    where fs.contact_id = c.id
  ) as total_form_submissions,
  (
    select count(*)
    from public.communication_logs cl
    where cl.contact_id = c.id
  ) as total_communications,
  (
    select max(fs.submitted_at)
    from public.form_submissions fs
    where fs.contact_id = c.id
  ) as last_form_submission_at,
  (
    select max(cl.created_at)
    from public.communication_logs cl
    where cl.contact_id = c.id
  ) as last_communication_at
from public.contacts c;
