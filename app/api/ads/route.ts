import { NextResponse } from "next/server";

import { getAdsData } from "@/lib/services/ads-service";

export async function GET() {
  const data = await getAdsData();
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
