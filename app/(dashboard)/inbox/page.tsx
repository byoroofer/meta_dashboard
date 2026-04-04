import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { InboxWorkspace } from "@/components/inbox/inbox-workspace";
import { getInboxData } from "@/lib/services/inbox-service";

export default async function InboxPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getInboxData(scope);
  return <InboxWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
