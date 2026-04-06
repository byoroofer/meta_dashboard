import { NextResponse } from "next/server";

import { getMarketplaceListingDetail } from "@/lib/services/marketplace-deals-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  const detail = await getMarketplaceListingDetail(listingId);

  if (!detail) {
    return NextResponse.json({ success: false, error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}
