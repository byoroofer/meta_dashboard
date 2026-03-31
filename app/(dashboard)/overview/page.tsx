import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { getOverviewData } from "@/lib/services/overview-service";

export default async function OverviewPage() {
  const data = await getOverviewData();
  return <OverviewDashboard {...data} />;
}
