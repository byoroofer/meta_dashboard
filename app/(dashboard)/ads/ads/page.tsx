import { AdsWorkspace } from "@/components/ads/ads-workspace";
import { getAdsData } from "@/lib/services/ads-service";

export default async function AdsEntityPage() {
  const data = await getAdsData();
  return <AdsWorkspace mode="ads" {...data} />;
}
