import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { ContactsWorkspace } from "@/components/contacts/contacts-workspace";
import { getContactsData } from "@/lib/services/contacts-service";

export default async function ContactsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getContactsData(scope);
  return <ContactsWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
