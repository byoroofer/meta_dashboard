import { notFound } from "next/navigation";

import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { getLeadsData } from "@/lib/services/leads-service";

export default async function LeadPage({
  params
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const data = await getLeadsData(leadId);

  if (!data.selectedLead) {
    notFound();
  }

  return <LeadsWorkspace {...data} />;
}
