import { AdsWorkspace } from "@/components/ads/ads-workspace";
import { getAdsData } from "@/lib/services/ads-service";

export default async function AdsPage() {
  const data = await getAdsData();
  return <AdsWorkspace mode="overview" {...data} />;
}
