import { LeadsWorkspace } from "@/components/leads/leads-workspace";
import { getLeadsData } from "@/lib/services/leads-service";

export default async function LeadsPage() {
  const data = await getLeadsData();
  return <LeadsWorkspace {...data} />;
}
