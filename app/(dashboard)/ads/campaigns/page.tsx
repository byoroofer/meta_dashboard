import { AdsWorkspace } from "@/components/ads/ads-workspace";
import { getAdsData } from "@/lib/services/ads-service";

export default async function CampaignsPage() {
  const data = await getAdsData();
  return <AdsWorkspace mode="campaigns" {...data} />;
}
