import { NextResponse } from "next/server";

import { resolveDashboardScope } from "@/lib/dashboard/scope";
import { getAdsData } from "@/lib/services/ads-service";

export async function GET(request: Request) {
  const scope = await resolveDashboardScope(new URL(request.url).searchParams);
  const data = await getAdsData(scope);
  return NextResponse.json({
    success: true,
    data: {
      accounts: data.accounts,
      campaigns: data.campaigns,
      adsets: data.adsets,
      ads: data.ads
    }
  });
}
