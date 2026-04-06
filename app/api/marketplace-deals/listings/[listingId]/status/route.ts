import { NextResponse } from "next/server";

import { marketplaceListingStatusUpdateSchema } from "@/lib/marketplace/schemas";
import { updateMarketplaceListingStatus } from "@/lib/services/marketplace-deals-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const parsed = marketplaceListingStatusUpdateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid listing status update." }, { status: 400 });
  }

  const { listingId } = await params;
  const status = await updateMarketplaceListingStatus(listingId, parsed.data);

  return NextResponse.json({ success: true, data: status });
}
