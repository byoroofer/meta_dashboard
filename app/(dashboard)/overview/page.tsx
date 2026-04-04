import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { getOverviewData } from "@/lib/services/overview-service";

export default async function OverviewPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getOverviewData(scope);
  return <OverviewDashboard {...data} />;
}
