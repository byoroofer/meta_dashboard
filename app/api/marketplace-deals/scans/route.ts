import { NextResponse } from "next/server";

import { marketplaceScanRequestSchema } from "@/lib/marketplace/schemas";
import { getMarketplaceScanHistory, runMarketplaceScan } from "@/lib/services/marketplace-deals-service";

export async function GET() {
  const history = await getMarketplaceScanHistory();
  return NextResponse.json({ success: true, data: history });
}

export async function POST(request: Request) {
  const parsed = marketplaceScanRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid scan request." }, { status: 400 });
  }

  const result = await runMarketplaceScan(parsed.data);
  return NextResponse.json({ success: true, data: result }, { status: 202 });
}
