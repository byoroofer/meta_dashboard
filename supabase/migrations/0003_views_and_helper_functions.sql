create or replace function public.compute_sha256(value text)
returns text
language sql
immutable
as $$
  select encode(digest(value, 'sha256'), 'hex');
$$;

create or replace view public.conversation_rollups as
select
  c.id,
  c.external_thread_id,
  c.platform,
  c.subject,
  c.status,
  c.unread_count,
  c.last_message_at,
  ct.display_name as contact_name,
  count(m.id) as message_count
from public.conversations c
left join public.contacts ct on ct.id = c.contact_id
left join public.messages m on m.conversation_id = c.id
group by c.id, ct.display_name;

create or replace view public.lead_pipeline_summary as
select
  status,
  count(*) as lead_count
from public.leads
group by status;

create or replace view public.archive_processing_summary as
select
  platform,
  processing_status,
  count(*) as event_count,
  max(received_at) as latest_received_at
from public.raw_webhook_events
group by platform, processing_status;
