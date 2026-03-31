import { ContactsWorkspace } from "@/components/contacts/contacts-workspace";
import { getContactsData } from "@/lib/services/contacts-service";

export default async function ContactsPage() {
  const data = await getContactsData();
  return <ContactsWorkspace {...data} />;
}
