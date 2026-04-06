import { NextResponse } from "next/server";

import { getMarketplaceResults } from "@/lib/services/marketplace-deals-service";

export async function GET(request: Request) {
  const scanId = new URL(request.url).searchParams.get("scanId");
  const results = await getMarketplaceResults(scanId);
  return NextResponse.json({ success: true, data: results });
}
