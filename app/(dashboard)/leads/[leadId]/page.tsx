import { notFound } from "next/navigation";

import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { resolveDashboardScope, scopeToQueryString } from "@/lib/dashboard/scope";
import { getLeadsData } from "@/lib/services/leads-service";

export default async function LeadPage({
  params,
  searchParams
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { leadId } = await params;
  const scope = await resolveDashboardScope(searchParams);
  const data = await getLeadsData(scope, leadId);

  if (!data.selectedLead) {
    notFound();
  }

  return <LeadsWorkspace {...data} scopeQuery={scopeToQueryString(scope)} />;
}
