create unique index if not exists idx_messages_external_message_id_unique
  on public.messages (external_message_id)
  where external_message_id is not null;

create unique index if not exists idx_contacts_external_contact_key_unique
  on public.contacts (external_contact_key)
  where external_contact_key is not null;
