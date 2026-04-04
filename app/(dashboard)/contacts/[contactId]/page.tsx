import { notFound } from "next/navigation";

import { ContactsWorkspace } from "@/components/contacts/contacts-workspace";
import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { getContactsData } from "@/lib/services/contacts-service";

export default async function ContactPage({
  params,
  searchParams
}: {
  params: Promise<{ contactId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { contactId } = await params;
  const scope = await resolveDashboardScope(searchParams);
  const data = await getContactsData(scope, contactId);

  if (!data.selectedContact) {
    notFound();
  }

  return <ContactsWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
