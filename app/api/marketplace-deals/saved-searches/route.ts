import { NextResponse } from "next/server";

import { marketplaceSavedSearchCreateSchema } from "@/lib/marketplace/schemas";
import { createMarketplaceSavedSearch, getMarketplaceDealsPageData } from "@/lib/services/marketplace-deals-service";

export async function GET() {
  const data = await getMarketplaceDealsPageData();
  return NextResponse.json({ success: true, data: data.savedSearches });
}

export async function POST(request: Request) {
  const parsed = marketplaceSavedSearchCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid saved search payload." }, { status: 400 });
  }

  const savedSearch = await createMarketplaceSavedSearch(parsed.data);
  return NextResponse.json({ success: true, data: savedSearch }, { status: 201 });
}
