import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { AdsWorkspace } from "@/components/ads/ads-workspace";
import { getAdsData } from "@/lib/services/ads-service";

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const scope = await resolveDashboardScope(searchParams);
  const data = await getAdsData(scope);
  return <AdsWorkspace mode="campaigns" {...data} />;
}
