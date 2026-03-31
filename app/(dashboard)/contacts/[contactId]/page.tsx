import { notFound } from "next/navigation";

import { ContactsWorkspace } from "@/components/contacts/contacts-workspace";
import { getContactsData } from "@/lib/services/contacts-service";

export default async function ContactPage({
  params
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const data = await getContactsData(contactId);

  if (!data.selectedContact) {
    notFound();
  }

  return <ContactsWorkspace {...data} />;
}
