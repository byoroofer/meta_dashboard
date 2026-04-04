import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { getLeadsData } from "@/lib/services/leads-service";

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getLeadsData(scope);
  return <LeadsWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
