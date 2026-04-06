import { MarketplaceDealsWorkspace } from "@/components/marketplace/marketplace-deals-workspace";
import { getMarketplaceDealsPageData } from "@/lib/services/marketplace-deals-service";

export const dynamic = "force-dynamic";

export default async function MarketplaceDealsPage() {
  const data = await getMarketplaceDealsPageData();
  return <MarketplaceDealsWorkspace initialData={data} />;
}
