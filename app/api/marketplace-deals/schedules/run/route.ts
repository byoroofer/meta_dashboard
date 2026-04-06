import { NextResponse } from "next/server";

import { runScheduledMarketplaceScans } from "@/lib/services/marketplace-deals-service";

export async function POST() {
  const outcome = await runScheduledMarketplaceScans();
  return NextResponse.json({ success: true, data: outcome });
}
